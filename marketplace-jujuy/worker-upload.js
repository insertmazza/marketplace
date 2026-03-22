// ─────────────────────────────────────────────────────────────
//  CLOUDFLARE WORKER — marketplace-upload
//  Pegá este código en el editor web de Cloudflare Workers
//  dash.cloudflare.com → Workers & Pages → Create → Worker
// ─────────────────────────────────────────────────────────────

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const s3 = new S3Client({
      region: "auto",
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId:     env.R2_ACCESS_KEY,
        secretAccessKey: env.R2_SECRET_KEY,
      },
    });

    // ── POST: subir imagen ──────────────────────────────────
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file     = formData.get("file");

        if (!file) return json({ error: "Sin archivo" }, 400, cors);

        const ext = file.name.split(".").pop().toLowerCase() || "jpg";
        const key = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        await s3.send(new PutObjectCommand({
          Bucket:      env.R2_BUCKET_NAME,
          Key:         key,
          Body:        await file.arrayBuffer(),
          ContentType: file.type || "image/jpeg",
        }));

        return json({ url: `${env.R2_PUBLIC_URL}/${key}`, key }, 200, cors);

      } catch (err) {
        return json({ error: err.message }, 500, cors);
      }
    }

    // ── DELETE: borrar imagen (cuando se elimina un anuncio) ─
    if (request.method === "DELETE") {
      try {
        const { key } = await request.json();
        if (!key) return json({ error: "Sin key" }, 400, cors);

        await s3.send(new DeleteObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key:    key,
        }));

        return json({ deleted: true }, 200, cors);

      } catch (err) {
        return json({ error: err.message }, 500, cors);
      }
    }

    return json({ error: "Método no permitido" }, 405, cors);
  },
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
