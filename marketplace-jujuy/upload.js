// ─────────────────────────────────────────────
//  Sube una imagen al Worker de Cloudflare → R2
//  Comprime automáticamente antes de subir
// ─────────────────────────────────────────────

async function compressImage(file, maxSizeKB = 150) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Redimensionar si es muy grande
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = (height * maxDim) / width; width = maxDim; }
          else { width = (width * maxDim) / height; height = maxDim; }
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        // Comprimir con calidad variable hasta alcanzar el tamaño
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob.size / 1024 > maxSizeKB && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            }
          }, "image/jpeg", quality);
        };
        tryCompress();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file) {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed, file.name);

  const res = await fetch(window.ENV.UPLOAD_WORKER_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Error al subir la imagen");
  return res.json(); // { url, key }
}

async function createListing({ title, description, price, currency,
                                categoryId, location, contact, files }) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para publicar");

  const { data: listing, error } = await db
    .from("listings")
    .insert({
      title,
      description,
      price: parseFloat(price) || null,
      currency,
      price_label: price ? `${currency === "USD" ? "U$S" : "$"} ${price}` : "Consultar",
      category_id: categoryId,
      location,
      contact_phone: contact,
      user_id: user.id,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  if (files?.length) {
    const images = await Promise.all(
      files.map(async (file, i) => {
        const { url, key } = await uploadImage(file);
        return { listing_id: listing.id, url, r2_key: key, position: i };
      })
    );
    await db.from("listing_images").insert(images);
  }

  return listing;
}
