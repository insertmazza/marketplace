// ─────────────────────────────────────────────────────────────
//  app.jsx — Marketplace "Compra en Jujuy"
//  v2: Auth, consejos de seguridad, subcategorías, sin venta de animales
// ─────────────────────────────────────────────────────────────

const { useState, useEffect } = React;

const categories = [
  { id:"vehiculos",    label:"Vehículos",   icon:"🚗", color:"#FF6B35", subs:["Autos","Camionetas / SUV","Motos","Camiones","Náutica","Planes de Ahorro"] },
  { id:"inmuebles",    label:"Inmuebles",   icon:"🏠", color:"#2EC4B6", subs:["Casas","Departamentos","Terrenos / Lotes","Locales","Campos / Quintas","Galpones"] },
  { id:"servicios",    label:"Servicios",   icon:"🔧", color:"#9B5DE5", subs:["Mantenimiento Hogar","Profesionales","Eventos","Transporte","Capacitaciones","Técnicos"] },
  { id:"electronicos", label:"Electrónica", icon:"📱", color:"#00BBF9", subs:["Celulares","Computación","Audio / Video","Cámaras","Consolas","Accesorios"] },
  { id:"hogar",        label:"Hogar",       icon:"🛋️", color:"#F7B731", subs:["Muebles","Jardín","Decoración","Electrodomésticos","Herramientas","Arte"] },
  { id:"ropa",         label:"Ropa & Moda", icon:"👗", color:"#FF85A1", subs:["Ropa Mujer","Ropa Hombre","Zapatillas","Joyas","Relojes","Accesorios"] },
  { id:"deportes",     label:"Deportes",    icon:"⚽", color:"#0EAD69", subs:["Fútbol","Ciclismo","Fitness","Camping","Natación","Artes Marciales"] },
  // Mascotas: sin venta de animales
  { id:"mascotas",     label:"Mascotas",    icon:"🐾", color:"#E55934", subs:["Acuarios","Accesorios para mascotas","Alimentos para mascotas"] },
];

const securityTips = [
  {
    titulo: "Si vas a COMPRAR, desconfiá del vendedor cuando insiste en:",
    color: "#92400E", bg: "#FFFBEB", border: "#F59E0B",
    items: [
      "Pedirte el adelanto del pago del producto o del valor del envío.",
      "Informarte una ubicación distinta a la que aparece en su anuncio.",
      "Ofrecer promociones sumamente llamativas y/o precios sospechosamente bajos.",
      "Ofrecer precios bajos y además el vendedor es nuevo en el sitio (registrado en los últimos días).",
    ]
  },
  {
    titulo: "Si vas a VENDER, desconfiá de un comprador cuando insiste en:",
    color: "#065F46", bg: "#F0FDF4", border: "#10B981",
    items: [
      "Abonarte a través de sistemas de pago como Western Union, Paypal, Moneygram u otros medios electrónicos.",
      "Abonarte con moneda extranjera. Realizá la transacción en un banco o casa de cambio para verificar la autenticidad.",
      "Abonarte con cheques. Corroborá con tu entidad bancaria si el cheque tiene fondos antes de enviar el producto.",
      "Ofrecerte una seña via transferencia bancaria cuando en realidad te enviará una solicitud de transferencia desde tu cuenta.",
      "Ofrecerte comprobante falso por un monto mayor, exigiéndote la devolución de la diferencia.",
      "Recibir el producto antes de pagar por él.",
    ]
  },
  {
    titulo: "En general tené en cuenta:",
    color: "#1E3A5F", bg: "#EFF6FF", border: "#3B82F6",
    items: [
      "En lo posible realizá la transacción en persona y en lugar seguro. Especial precaución con usuarios fuera del país.",
      "Nunca envíes información personal: datos bancarios, dirección de correo, número de tarjeta de débito o crédito, etc.",
      "Si un anuncio te resulta sospecho, podés reportarlo usando el link 'Denunciar este anuncio' en cada publicación.",
    ]
  }
];

const defaultAdSlots = {
  banner_top:    { title:"¡Publicá tu negocio aquí! Espacios disponibles", link_url:"#", bg_color:"linear-gradient(135deg,#7C3AED,#4338CA)" },
  banner_mid:    { title:"Contactanos para publicitar tu negocio",          link_url:"#", bg_color:"linear-gradient(135deg,#F97316,#DC2626)"  },
  banner_bottom: { title:"Alcanzá miles de compradores en Jujuy",           link_url:"#", bg_color:"linear-gradient(135deg,#0F766E,#0369A1)"  },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff/60)}min`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return `${Math.floor(diff/86400)}d`;
}

function formatCount(n) {
  if (!n && n !== 0) return "...";
  if (n >= 1000) return (n/1000).toFixed(1) + "k";
  return n.toString();
}

// ─── App principal ───────────────────────────────────────────
function App() {
  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [megaMenuOpen,   setMegaMenuOpen]   = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [activeTab,      setActiveTab]      = useState("Todos");

  // Modales
  const [publishModal,  setPublishModal]  = useState(false);
  const [authModal,     setAuthModal]     = useState(false);
  const [authMode,      setAuthMode]      = useState("login"); // "login" | "register"
  const [securityModal, setSecurityModal] = useState(false);

  // Auth
  const [user,      setUser]      = useState(null);
  const [authForm,  setAuthForm]  = useState({ email:"", password:"", confirmPassword:"" });
  const [authMsg,   setAuthMsg]   = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Datos
  const [totalListings,  setTotalListings]  = useState(null);
  const [catCounts,      setCatCounts]      = useState({});
  const [recentListings, setRecentListings] = useState([]);
  const [topListings,    setTopListings]    = useState([]);
  const [adSlots,        setAdSlots]        = useState(defaultAdSlots);
  const [loading,        setLoading]        = useState(true);

  // Formulario publicar
  const [form,       setForm]       = useState({ title:"", description:"", price:"", priceType:"valor", currency:"ARS", categoryId:"", subcategory:"", location:"", contact:"", files:[] });
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);

    // Detectar sesión activa
    db.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    // Escuchar cambios de auth
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    loadData();
    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, []);

  async function loadData() {
    try {
      const { count: total } = await db.from("listings")
        .select("*", { count:"exact", head:true }).eq("status","active");
      setTotalListings(total || 0);

      const counts = {};
      await Promise.all(categories.map(async cat => {
        const { count } = await db.from("listings")
          .select("*", { count:"exact", head:true })
          .eq("status","active").eq("category_id", cat.id);
        counts[cat.id] = count || 0;
      }));
      setCatCounts(counts);

      const { data: top } = await db.from("listings")
        .select("*, listing_images(url)").eq("status","active")
        .order("views", { ascending:false }).limit(6);
      setTopListings(top || []);

      const { data: recent } = await db.from("listings")
        .select("*, listing_images(url)").eq("status","active")
        .order("created_at", { ascending:false }).limit(12);
      setRecentListings(recent || []);

      const { data: ads } = await db.from("ad_slots").select("*").eq("active", true);
      if (ads?.length) {
        const slots = ads.reduce((acc, s) => { acc[s.slot_id] = s; return acc; }, {});
        setAdSlots(prev => ({ ...prev, ...slots }));
      }
    } catch(e) { console.error("Error:", e); }
    setLoading(false);
  }

  // ── Auth ──────────────────────────────────────────────────
  async function handleAuth(e) {
    e.preventDefault();
    setAuthMsg("");
    setAuthLoading(true);

    const { email, password, confirmPassword } = authForm;
    if (!email || !password) { setAuthMsg("❌ Completá todos los campos"); setAuthLoading(false); return; }

    try {
      if (authMode === "register") {
        if (password !== confirmPassword) { setAuthMsg("❌ Las contraseñas no coinciden"); setAuthLoading(false); return; }
        if (password.length < 6) { setAuthMsg("❌ La contraseña debe tener al menos 6 caracteres"); setAuthLoading(false); return; }
        const { error } = await db.auth.signUp({ email, password });
        if (error) throw error;
        setAuthMsg("✅ ¡Registrado! Revisá tu email para confirmar la cuenta.");
      } else {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthMsg("✅ ¡Bienvenido!");
        setTimeout(() => { setAuthModal(false); setAuthMsg(""); setAuthForm({ email:"", password:"", confirmPassword:"" }); }, 1000);
      }
    } catch(err) {
      const msg = err.message.includes("Invalid login") ? "Email o contraseña incorrectos"
        : err.message.includes("already registered") ? "Este email ya está registrado"
        : err.message;
      setAuthMsg("❌ " + msg);
    }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await db.auth.signOut();
    setUser(null);
  }

  // ── Publicar ──────────────────────────────────────────────
  async function handlePublish(e) {
    e.preventDefault();
    if (!user) { setPublishModal(false); setAuthModal(true); setAuthMode("login"); return; }
    if (!form.title || !form.categoryId) { setPublishMsg("❌ Completá el título y la categoría"); return; }

    setPublishing(true);
    setPublishMsg("");
    try {
      const priceLabel = form.priceType === "consultar" ? "Consultar"
        : form.price ? `${form.currency === "USD" ? "U$S" : "$"} ${Number(form.price).toLocaleString("es-AR")}` : "Consultar";

      const { data: listing, error } = await db.from("listings").insert({
        title:        form.title,
        description:  form.description,
        price:        form.priceType === "consultar" ? null : (parseFloat(form.price) || null),
        currency:     form.currency,
        price_label:  priceLabel,
        category_id:  form.categoryId,
        subcategory:  form.subcategory || null,
        location:     form.location,
        contact_phone: form.contact,
        user_id:      user.id,
        status:       "active",
      }).select().single();

      if (error) throw error;

      // Subir fotos si hay
      if (form.files?.length && typeof uploadImage === "function") {
        const images = await Promise.all(
          form.files.map(async (file, i) => {
            const { url, key } = await uploadImage(file);
            return { listing_id: listing.id, url, r2_key: key, position: i };
          })
        );
        await db.from("listing_images").insert(images);
      }

      setPublishMsg("✅ ¡Anuncio publicado con éxito!");
      setForm({ title:"", description:"", price:"", priceType:"valor", currency:"ARS", categoryId:"", subcategory:"", location:"", contact:"", files:[] });
      await loadData();
      setTimeout(() => { setPublishModal(false); setPublishMsg(""); }, 1500);
    } catch(err) { setPublishMsg("❌ " + err.message); }
    setPublishing(false);
  }

  const filteredRecent = recentListings.filter(l => {
    const matchSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab    = activeTab === "Todos" || l.category_id === activeTab;
    return matchSearch && matchTab;
  });

  const activeCatSubs = categories.find(c=>c.id===form.categoryId)?.subs || [];

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Sora','Nunito',sans-serif", background:"#F8F7F4", minHeight:"100vh", color:"#1A1A2E" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#FF6B35;border-radius:3px}
        .nav-link{color:white;text-decoration:none;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px;transition:all .2s;cursor:pointer;background:none;border:none;font-family:inherit}
        .nav-link:hover{background:rgba(255,255,255,.18)}
        .cat-pill{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;background:white;border-radius:16px;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);border:2px solid transparent;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .cat-pill:hover{transform:translateY(-5px) scale(1.04);box-shadow:0 12px 28px rgba(0,0,0,.12)}
        .card{background:white;border-radius:16px;overflow:hidden;cursor:pointer;transition:all .25s;box-shadow:0 2px 10px rgba(0,0,0,.06);border:1px solid #F0EDE8}
        .card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(0,0,0,.12)}
        .recent-card{display:flex;gap:12px;align-items:center;background:white;border-radius:12px;padding:12px;cursor:pointer;transition:all .2s;border:1px solid #F0EDE8}
        .recent-card:hover{transform:translateX(4px);box-shadow:0 6px 20px rgba(0,0,0,.09)}
        .pub-btn{background:#FF6B35;color:white;border:none;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit}
        .pub-btn:hover{background:#E55520;transform:translateY(-1px);box-shadow:0 6px 16px rgba(255,107,53,.4)}
        .tab-btn{padding:8px 18px;border-radius:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
        .tab-active{background:#1A1A2E;color:white}
        .tab-inactive{background:white;color:#6B7280;border:1px solid #E5E7EB}
        .tab-inactive:hover{border-color:#FF6B35;color:#FF6B35}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
        .modal{background:white;border-radius:24px;width:90%;max-width:520px;padding:32px;max-height:90vh;overflow-y:auto}
        .form-input{border:2px solid #E5E7EB;border-radius:10px;padding:11px 14px;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;width:100%}
        .form-input:focus{border-color:#FF6B35}
        .ad-banner{border-radius:18px;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;margin:28px 0;gap:16px;flex-wrap:wrap}
        .ad-cta{background:white;color:#1A1A2E;border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit}
        .empty-state{text-align:center;padding:60px 20px;color:#9CA3AF}
        .price-toggle{display:flex;gap:0;border:2px solid #E5E7EB;border-radius:10px;overflow:hidden}
        .price-toggle button{flex:1;padding:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .price-active{background:#FF6B35;color:white}
        .price-inactive{background:white;color:#6B7280}
        @media(max-width:600px){.mega-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"sticky",top:0,zIndex:300,background:scrolled?"#1A1A2E":"linear-gradient(135deg,#1A0A2E,#2D1B6B)",boxShadow:scrolled?"0 4px 20px rgba(0,0,0,.25)":"none",transition:"all .3s" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:10,height:66 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginRight:16,flexShrink:0,cursor:"pointer" }}>
            <div style={{ width:38,height:38,background:"linear-gradient(135deg,#E63946,#F4A261)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🌵</div>
            <div>
              <div style={{ color:"white",fontWeight:800,fontSize:16,lineHeight:1.1 }}>Compra en Jujuy</div>
              <div style={{ color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:"1.5px",textTransform:"uppercase" }}>Clasificados gratuitos</div>
            </div>
          </div>

          <div style={{ flex:1,maxWidth:480,background:"rgba(255,255,255,.1)",borderRadius:12,display:"flex",alignItems:"center",padding:"0 14px",height:42,border:"1px solid rgba(255,255,255,.15)" }}>
            <span style={{ marginRight:8,fontSize:16,opacity:.7 }}>🔍</span>
            <input style={{ flex:1,border:"none",outline:"none",fontSize:15,fontFamily:"inherit",background:"transparent",color:"white" }}
              placeholder="Buscar en todos los clasificados..."
              value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
          </div>

          <div style={{ display:"flex",alignItems:"center",gap:4,marginLeft:"auto" }}>
            {user ? (
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:600 }}>👤 {user.email.split("@")[0]}</span>
                <button className="nav-link" onClick={handleLogout}>Salir</button>
              </div>
            ) : (
              <>
                <button className="nav-link" onClick={()=>{ setAuthMode("login"); setAuthModal(true); }}>Ingresar</button>
                <button className="nav-link" onClick={()=>{ setAuthMode("register"); setAuthModal(true); }}>Registrarse</button>
              </>
            )}
            <button className="nav-link" style={{ display:"flex",alignItems:"center",gap:5 }} onClick={()=>setMegaMenuOpen(!megaMenuOpen)}>
              Categorías <span style={{ fontSize:10,display:"inline-block",transform:megaMenuOpen?"rotate(180deg)":"none",transition:"transform .2s" }}>▼</span>
            </button>
            <button className="pub-btn" onClick={()=>setPublishModal(true)}>✏️ Publicar GRATIS</button>
          </div>
        </div>

        {megaMenuOpen && (
          <div style={{ position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:"white",borderRadius:"0 0 20px 20px",boxShadow:"0 20px 60px rgba(0,0,0,.15)",zIndex:200,padding:28 }}>
            <div className="mega-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20 }}>
              {categories.map(cat=>(
                <div key={cat.id} onClick={()=>{ setActiveCategory(cat.id); setMegaMenuOpen(false); }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10,cursor:"pointer" }}>
                    <span style={{ fontSize:18 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontWeight:700,fontSize:14,color:"#1A1A2E" }}>{cat.label}</div>
                      <div style={{ fontSize:11,color:"#9CA3AF" }}>{formatCount(catCounts[cat.id])} anuncios</div>
                    </div>
                  </div>
                  {cat.subs.map(sub=>(
                    <div key={sub} style={{ fontSize:12,color:"#6B7280",padding:"3px 0 3px 26px",cursor:"pointer" }}
                      onMouseEnter={e=>e.target.style.color="#FF6B35"}
                      onMouseLeave={e=>e.target.style.color="#6B7280"}>{sub}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div style={{ background:"linear-gradient(135deg,#1A0A2E 0%,#3D1A6B 40%,#6B2D1A 70%,#1A0A2E 100%)",padding:"52px 20px 60px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:8,background:"linear-gradient(90deg,#E63946,#F4A261,#F7D060,#8BC34A,#2EC4B6,#4A90D9,#9B5DE5)",opacity:.9 }}></div>
        <div style={{ position:"absolute",bottom:8,left:0,right:0,height:4,background:"linear-gradient(90deg,#F4A261,#E63946,#F7D060,#2EC4B6,#8BC34A,#9B5DE5,#4A90D9)",opacity:.5 }}></div>
        <div style={{ position:"absolute",bottom:24,left:20,fontSize:64,opacity:.12 }}>🌵</div>
        <div style={{ position:"absolute",bottom:24,left:80,fontSize:40,opacity:.08 }}>🌵</div>
        <div style={{ position:"absolute",bottom:24,right:20,fontSize:72,opacity:.12 }}>🌵</div>
        <div style={{ position:"absolute",bottom:24,right:90,fontSize:44,opacity:.07 }}>🌵</div>

        <div style={{ maxWidth:1200,margin:"0 auto",textAlign:"center" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(244,162,97,.2)",border:"1px solid rgba(244,162,97,.4)",borderRadius:20,padding:"6px 16px",marginBottom:18 }}>
            <span style={{ color:"#F4A261",fontSize:12,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase" }}>🟢 Clasificados gratuitos de Jujuy</span>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ display:"inline-flex",alignItems:"flex-end",gap:3,height:48 }}>
              {["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map((color,i)=>(
                <div key={i} style={{ width:18,height:`${28+Math.sin((i/6)*Math.PI)*20}px`,background:color,borderRadius:"4px 4px 0 0",opacity:.85 }}></div>
              ))}
            </div>
          </div>

          <h1 style={{ color:"white",fontSize:"clamp(28px,5vw,52px)",fontWeight:900,lineHeight:1.15,letterSpacing:"-1px",marginBottom:14 }}>
            Compra y vendé en<br />
            <span style={{ background:"linear-gradient(90deg,#E63946,#F4A261,#F7D060,#8BC34A,#2EC4B6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
              Jujuy 🌵
            </span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.65)",fontSize:"clamp(13px,2vw,16px)",maxWidth:500,margin:"0 auto 32px" }}>
            Clasificados gratuitos para toda la provincia. Publicá en segundos, llegá a miles.
          </p>
          <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
            <button className="pub-btn" style={{ padding:"14px 32px",fontSize:15,borderRadius:14,background:"linear-gradient(135deg,#E63946,#F4A261)",boxShadow:"0 8px 24px rgba(230,57,70,.4)" }} onClick={()=>setPublishModal(true)}>
              ✏️ Publicar GRATIS
            </button>
            <button style={{ background:"rgba(255,255,255,.12)",color:"white",border:"1px solid rgba(255,255,255,.25)",padding:"14px 28px",borderRadius:14,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              🔍 Explorar todo
            </button>
          </div>
          <div style={{ display:"flex",justifyContent:"center",gap:"clamp(20px,5vw,60px)",flexWrap:"wrap",marginTop:40 }}>
            {[
              { num:totalListings===null?"...":totalListings.toLocaleString("es-AR"), label:"Anuncios activos" },
              { num:"Gratis", label:"Publicación" },
              { num:"100%",   label:"Jujuy" },
            ].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:28,fontWeight:800,color:"white" }}>{s.num}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,.75)",fontWeight:500,marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 20px" }}>

        <AdBanner slot={adSlots.banner_top} />

        {/* CATEGORÍAS */}
        <div style={{ marginBottom:36 }}>
          <SectionTitle title="Explorar por categoría" sub="Encontrá exactamente lo que buscás" />
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:12 }}>
            {categories.map(cat=>(
              <div key={cat.id} className="cat-pill"
                style={{ borderColor:activeCategory===cat.id?cat.color:"transparent",background:activeCategory===cat.id?`${cat.color}18`:"white" }}
                onClick={()=>setActiveCategory(activeCategory===cat.id?null:cat.id)}>
                <div style={{ fontSize:28,lineHeight:1 }}>{cat.icon}</div>
                <div style={{ fontSize:11,fontWeight:700,color:"#1A1A2E",textAlign:"center",lineHeight:1.3 }}>{cat.label}</div>
                <div style={{ fontSize:10,color:"#9CA3AF" }}>{formatCount(catCounts[cat.id])}</div>
              </div>
            ))}
          </div>
          {activeCategory && (
            <div style={{ marginTop:16,background:"white",borderRadius:16,padding:"18px 20px",border:"1px solid #F0EDE8" }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#6B7280",marginBottom:12,textTransform:"uppercase",letterSpacing:".8px" }}>
                Subcategorías de {categories.find(c=>c.id===activeCategory)?.label}
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {categories.find(c=>c.id===activeCategory)?.subs.map(sub=>(
                  <span key={sub} style={{ background:"#F3F4F6",color:"#374151",padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}
                    onMouseEnter={e=>{e.target.style.background="#FF6B35";e.target.style.color="white"}}
                    onMouseLeave={e=>{e.target.style.background="#F3F4F6";e.target.style.color="#374151"}}>
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MÁS VISTOS */}
        {topListings.length > 0 && (
          <div style={{ marginBottom:36 }}>
            <SectionTitle title="🔥 Más vistos" sub="Ordenados por tráfico real" link="Ver todos →" />
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20 }}>
              {topListings.map(l=><ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}

        <AdBanner slot={adSlots.banner_mid} />

        {/* ÚLTIMOS PUBLICADOS */}
        <div style={{ marginBottom:36 }}>
          <SectionTitle title="🕐 Últimos Publicados" sub="Actualizados en tiempo real" link="Ver más →" />
          <div style={{ display:"flex",gap:8,marginBottom:18,flexWrap:"wrap" }}>
            <button className={`tab-btn ${activeTab==="Todos"?"tab-active":"tab-inactive"}`} onClick={()=>setActiveTab("Todos")}>Todos</button>
            {categories.map(c=>(
              <button key={c.id} className={`tab-btn ${activeTab===c.id?"tab-active":"tab-inactive"}`} onClick={()=>setActiveTab(c.id)}>{c.label}</button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state"><div style={{ fontSize:40,marginBottom:12 }}>⏳</div><div style={{ fontWeight:600 }}>Cargando anuncios...</div></div>
          ) : filteredRecent.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize:40,marginBottom:12 }}>📭</div>
              <div style={{ fontWeight:600,marginBottom:8 }}>
                {searchQuery ? `Sin resultados para "${searchQuery}"` : "Todavía no hay anuncios publicados"}
              </div>
              <button className="pub-btn" style={{ marginTop:16 }} onClick={()=>setPublishModal(true)}>✏️ Sé el primero en publicar</button>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12 }}>
              {filteredRecent.map(l=>(
                <div key={l.id} className="recent-card">
                  <div style={{ width:60,height:60,background:"linear-gradient(135deg,#FFF7ED,#FFEDD5)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,overflow:"hidden" }}>
                    {l.listing_images?.[0]?.url
                      ? <img src={l.listing_images[0].url} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />
                      : categories.find(c=>c.id===l.category_id)?.icon || "📦"}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#1A1A2E",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{l.title}</div>
                    <div style={{ fontSize:15,fontWeight:900,color:"#FF6B35" }}>{l.price_label||"Consultar"}</div>
                    <div style={{ display:"flex",gap:8,marginTop:4 }}>
                      <span style={{ fontSize:10,color:"#9CA3AF",background:"#F3F4F6",padding:"2px 7px",borderRadius:5,fontWeight:600 }}>
                        {categories.find(c=>c.id===l.category_id)?.label||l.category_id}
                        {l.subcategory ? ` › ${l.subcategory}` : ""}
                      </span>
                      <span style={{ fontSize:10,color:"#9CA3AF" }}>🕐 {timeAgo(l.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:18,color:"#D1D5DB" }}>›</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CONSEJOS DE SEGURIDAD ── */}
        <div style={{ marginBottom:36 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
            <div>
              <div style={{ fontSize:22,fontWeight:800,color:"#1A1A2E" }}>🛡️ Consejos de Seguridad</div>
              <div style={{ fontSize:13,color:"#9CA3AF",marginTop:2 }}>Operá con tranquilidad — leé esto antes de comprar o vender</div>
            </div>
            <button onClick={()=>setSecurityModal(true)} style={{ background:"#1A1A2E",color:"white",border:"none",padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>
              Ver todo →
            </button>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
            {securityTips.map((tip,i)=>(
              <div key={i} style={{ background:tip.bg,border:`1px solid ${tip.border}`,borderRadius:16,padding:"18px 20px" }}>
                <div style={{ fontWeight:700,fontSize:13,color:tip.color,marginBottom:12 }}>{tip.titulo}</div>
                <ul style={{ paddingLeft:16,margin:0 }}>
                  {tip.items.slice(0,2).map((item,j)=>(
                    <li key={j} style={{ fontSize:12,color:tip.color,marginBottom:6,lineHeight:1.5 }}>{item}</li>
                  ))}
                  {tip.items.length > 2 && <li style={{ fontSize:12,color:tip.color,opacity:.6 }}>y {tip.items.length-2} más...</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <AdBanner slot={adSlots.banner_bottom} />

      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#1A0A2E",color:"rgba(255,255,255,.65)",padding:"40px 20px 24px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <div style={{ display:"flex",flexWrap:"wrap",gap:40,marginBottom:32 }}>
            <div style={{ flex:"1 1 220px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                <div style={{ width:36,height:36,background:"linear-gradient(135deg,#E63946,#F4A261)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🌵</div>
                <div style={{ color:"white",fontWeight:800,fontSize:15 }}>Compra en Jujuy</div>
              </div>
              <p style={{ fontSize:12,lineHeight:1.7 }}>Clasificados gratuitos para toda la provincia de Jujuy, Argentina.</p>
              <div style={{ marginTop:16,display:"flex",gap:8 }}>
                {["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map((c,i)=>(
                  <div key={i} style={{ width:18,height:18,background:c,borderRadius:4,opacity:.8 }}></div>
                ))}
              </div>
            </div>
            {[
              {title:"Publicar",links:["Publicar GRATIS","Cómo funciona","Planes destacados"]},
              {title:"Cuenta",  links:["Registrarse","Iniciar sesión","Mis anuncios"]},
              {title:"Ayuda",   links:["Consejos de Seguridad","Preguntas frecuentes","Términos y condiciones","Contacto"]},
            ].map(col=>(
              <div key={col.title} style={{ flex:"1 1 140px" }}>
                <div style={{ color:"white",fontWeight:700,fontSize:13,marginBottom:14,textTransform:"uppercase",letterSpacing:".8px" }}>{col.title}</div>
                {col.links.map(l=>(
                  <a key={l} href="#" style={{ display:"block",color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12,marginBottom:8 }}
                    onMouseEnter={e=>e.target.style.color="#F4A261"}
                    onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.5)"}
                    onClick={l==="Consejos de Seguridad"?e=>{e.preventDefault();setSecurityModal(true)}:undefined}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
            <div style={{ fontSize:12 }}>© 2024–2026 Compra en Jujuy. Todos los derechos reservados.</div>
            <div style={{ display:"flex",gap:16 }}>
              {["📘 Facebook","📸 Instagram","💬 WhatsApp"].map(s=>(
                <a key={s} href="#" style={{ color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12 }}
                  onMouseEnter={e=>e.target.style.color="white"}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.5)"}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE */}
      <button onClick={()=>setPublishModal(true)}
        style={{ position:"fixed",bottom:28,right:28,background:"linear-gradient(135deg,#E63946,#F4A261)",color:"white",border:"none",width:60,height:60,borderRadius:"50%",fontSize:24,cursor:"pointer",boxShadow:"0 8px 24px rgba(230,57,70,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s",fontFamily:"inherit" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>✏️</button>

      {/* ── MODAL AUTH ── */}
      {authModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setAuthModal(false)}>
          <div className="modal" style={{ maxWidth:440 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
              <div>
                <div style={{ fontSize:20,fontWeight:800,color:"#1A1A2E" }}>
                  {authMode==="login" ? "👤 Iniciar sesión" : "✨ Crear cuenta"}
                </div>
                <div style={{ fontSize:12,color:"#9CA3AF",marginTop:3 }}>
                  {authMode==="login" ? "Ingresá con tu email y contraseña" : "Registrate gratis para publicar"}
                </div>
              </div>
              <button onClick={()=>{setAuthModal(false);setAuthMsg("");}} style={{ background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit" }}>×</button>
            </div>

            {/* Toggle */}
            <div style={{ display:"flex",background:"#F3F4F6",borderRadius:12,padding:4,marginBottom:24 }}>
              {["login","register"].map(mode=>(
                <button key={mode} onClick={()=>{setAuthMode(mode);setAuthMsg("");}}
                  style={{ flex:1,padding:"10px",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
                    background:authMode===mode?"white":"transparent",
                    color:authMode===mode?"#1A1A2E":"#9CA3AF",
                    boxShadow:authMode===mode?"0 2px 8px rgba(0,0,0,.08)":"none" }}>
                  {mode==="login"?"Iniciar sesión":"Registrarse"}
                </button>
              ))}
            </div>

            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Email</div>
              <input className="form-input" type="email" placeholder="tucorreo@gmail.com"
                value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} />
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Contraseña</div>
              <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} />
            </div>
            {authMode==="register" && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Confirmar contraseña</div>
                <input className="form-input" type="password" placeholder="Repetí la contraseña"
                  value={authForm.confirmPassword} onChange={e=>setAuthForm({...authForm,confirmPassword:e.target.value})} />
              </div>
            )}

            {authMsg && <div style={{ fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center",padding:"10px",background:authMsg.startsWith("✅")?"#F0FDF4":"#FFF1F2",borderRadius:8 }}>{authMsg}</div>}

            <button className="pub-btn" style={{ width:"100%",padding:16,fontSize:15,borderRadius:12,opacity:authLoading?.7:1 }}
              onClick={handleAuth} disabled={authLoading}>
              {authLoading ? "⏳ Procesando..." : authMode==="login" ? "Ingresar" : "Crear cuenta"}
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL PUBLICAR ── */}
      {publishModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setPublishModal(false)}>
          <div className="modal">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
              <div>
                <div style={{ fontSize:20,fontWeight:800,color:"#1A1A2E" }}>✏️ Publicar anuncio</div>
                <div style={{ fontSize:12,color:"#9CA3AF",marginTop:3 }}>
                  {user ? `Publicando como ${user.email}` : "Necesitás una cuenta para publicar"}
                </div>
              </div>
              <button onClick={()=>setPublishModal(false)} style={{ background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit" }}>×</button>
            </div>

            {!user && (
              <div style={{ background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"center" }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#92400E",marginBottom:8 }}>Necesitás iniciar sesión para publicar</div>
                <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
                  <button className="pub-btn" style={{ padding:"8px 16px",fontSize:12 }} onClick={()=>{ setPublishModal(false); setAuthMode("login"); setAuthModal(true); }}>Ingresar</button>
                  <button style={{ background:"white",color:"#FF6B35",border:"2px solid #FF6B35",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}
                    onClick={()=>{ setPublishModal(false); setAuthMode("register"); setAuthModal(true); }}>Registrarse gratis</button>
                </div>
              </div>
            )}

            {/* Categoría */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Categoría *</div>
              <select className="form-input" value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value,subcategory:""})}>
                <option value="">Seleccioná una categoría...</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>

            {/* Subcategoría — solo si hay categoría seleccionada */}
            {form.categoryId && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Subcategoría</div>
                <select className="form-input" value={form.subcategory} onChange={e=>setForm({...form,subcategory:e.target.value})}>
                  <option value="">Sin subcategoría</option>
                  {activeCatSubs.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* Título */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Título *</div>
              <input className="form-input" placeholder="Ej: iPhone 15 Pro 256GB – Como nuevo" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>

            {/* Precio con toggle Valor / Consultar */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:8 }}>Precio</div>
              <div className="price-toggle" style={{ marginBottom:10 }}>
                <button className={form.priceType==="valor"?"price-active":"price-inactive"} onClick={()=>setForm({...form,priceType:"valor"})}>
                  $ Poner un valor
                </button>
                <button className={form.priceType==="consultar"?"price-active":"price-inactive"} onClick={()=>setForm({...form,priceType:"consultar",price:""})}>
                  💬 Consultar
                </button>
              </div>
              {form.priceType==="valor" && (
                <div style={{ display:"grid",gridTemplateColumns:"1fr auto",gap:8 }}>
                  <input className="form-input" placeholder="350000" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
                  <select className="form-input" style={{ width:"auto" }} value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>
                    <option value="ARS">$ ARS</option>
                    <option value="USD">U$S</option>
                  </select>
                </div>
              )}
              {form.priceType==="consultar" && (
                <div style={{ background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#166534",fontWeight:600 }}>
                  💬 El precio aparecerá como "Consultar" — los interesados te contactarán directamente.
                </div>
              )}
            </div>

            {/* Descripción */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Descripción</div>
              <textarea className="form-input" rows={3} placeholder="Describí tu artículo o servicio..." style={{ resize:"vertical" }} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Ubicación</div>
                <input className="form-input" placeholder="San Salvador de Jujuy" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>WhatsApp</div>
                <input className="form-input" placeholder="388 4XX XXXX" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} />
              </div>
            </div>

            {/* Fotos */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Fotos (hasta 8)</div>
              <label style={{ display:"block",border:"2px dashed #E5E7EB",borderRadius:12,padding:"24px",textAlign:"center",cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#FF6B35"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#E5E7EB"}>
                <div style={{ fontSize:28,marginBottom:6 }}>📷</div>
                <div style={{ fontSize:13,color:"#6B7280",fontWeight:600 }}>Tocá para elegir fotos</div>
                <div style={{ fontSize:11,color:"#9CA3AF",marginTop:3 }}>JPG, PNG · Se comprimen automáticamente</div>
                <input type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>setForm({...form,files:[...e.target.files]})} />
              </label>
              {form.files.length>0 && <div style={{ fontSize:12,color:"#059669",marginTop:8,fontWeight:600 }}>✅ {form.files.length} foto(s) seleccionada(s)</div>}
            </div>

            {publishMsg && <div style={{ fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center",padding:"10px",background:publishMsg.startsWith("✅")?"#F0FDF4":"#FFF1F2",borderRadius:8 }}>{publishMsg}</div>}

            <button className="pub-btn" style={{ width:"100%",padding:16,fontSize:15,borderRadius:12,background:"linear-gradient(135deg,#E63946,#F4A261)",opacity:publishing?0.7:1 }}
              onClick={handlePublish} disabled={publishing}>
              {publishing ? "⏳ Publicando..." : "🚀 Publicar anuncio GRATIS"}
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL CONSEJOS DE SEGURIDAD ── */}
      {securityModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSecurityModal(false)}>
          <div className="modal" style={{ maxWidth:640 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
              <div>
                <div style={{ fontSize:20,fontWeight:800,color:"#1A1A2E" }}>🛡️ Consejos de Seguridad</div>
                <div style={{ fontSize:12,color:"#9CA3AF",marginTop:3 }}>Leé esto antes de comprar o vender</div>
              </div>
              <button onClick={()=>setSecurityModal(false)} style={{ background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit" }}>×</button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              {securityTips.map((tip,i)=>(
                <div key={i} style={{ background:tip.bg,border:`1px solid ${tip.border}`,borderRadius:16,padding:"18px 20px" }}>
                  <div style={{ fontWeight:700,fontSize:14,color:tip.color,marginBottom:12 }}>{tip.titulo}</div>
                  <ol style={{ paddingLeft:20,margin:0 }}>
                    {tip.items.map((item,j)=>(
                      <li key={j} style={{ fontSize:13,color:tip.color,marginBottom:8,lineHeight:1.6 }}>{item}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────
function ListingCard({ listing: l }) {
  const cat = categories.find(c=>c.id===l.category_id);
  const img = l.listing_images?.[0]?.url;
  return (
    <div className="card">
      <div style={{ height:160,background:"linear-gradient(135deg,#FFF7ED,#FFEDD5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,position:"relative",overflow:"hidden" }}>
        {img ? <img src={img} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" /> : <span>{cat?.icon||"📦"}</span>}
        <span style={{ position:"absolute",top:10,left:10,background:"#FF6B35",color:"white",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6 }}>🔥 {l.views} visitas</span>
        {cat && <span style={{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,.55)",color:"white",fontSize:10,fontWeight:600,padding:"4px 8px",borderRadius:6 }}>{cat.label}</span>}
      </div>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:6,lineHeight:1.35 }}>{l.title}</div>
        <div style={{ fontSize:18,fontWeight:900,color:"#FF6B35",marginBottom:10 }}>{l.price_label||"Consultar"}</div>
        <div style={{ display:"flex",justifyContent:"space-between" }}>
          <span style={{ fontSize:11,color:"#9CA3AF" }}>📍 {l.location||"Jujuy"}</span>
          <span style={{ fontSize:11,color:"#9CA3AF" }}>🕐 {timeAgo(l.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

function AdBanner({ slot }) {
  if (!slot) return null;
  return (
    <div className="ad-banner" style={{ background:slot.bg_color||"linear-gradient(135deg,#7C3AED,#4338CA)" }}>
      <div style={{ display:"flex",alignItems:"center",gap:16 }}>
        {slot.image_url ? <img src={slot.image_url} style={{ height:50,borderRadius:8,objectFit:"cover" }} alt="" /> : <div style={{ fontSize:36 }}>🎯</div>}
        <div>
          <div style={{ color:"white",fontWeight:700,fontSize:16 }}>{slot.title||"Espacio publicitario"}</div>
          <div style={{ color:"rgba(255,255,255,.65)",fontSize:12,marginTop:2 }}>Publicidad · Administrado desde Supabase</div>
        </div>
      </div>
      <a href={slot.link_url||"#"} target="_blank" rel="noopener noreferrer">
        <button className="ad-cta">Ver más →</button>
      </a>
    </div>
  );
}

function SectionTitle({ title, sub, link }) {
  return (
    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:sub?4:22 }}>
      <div>
        <div style={{ fontSize:22,fontWeight:800,color:"#1A1A2E" }}>{title}</div>
        {sub && <div style={{ fontSize:13,color:"#9CA3AF",marginBottom:22 }}>{sub}</div>}
      </div>
      {link && <a href="#" style={{ fontSize:13,color:"#FF6B35",fontWeight:600,textDecoration:"none",marginTop:4,whiteSpace:"nowrap" }}>{link}</a>}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
