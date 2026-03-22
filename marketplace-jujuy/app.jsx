// ─────────────────────────────────────────────────────────────
//  app.jsx — Marketplace "Compra en Jujuy"
//  React cargado desde CDN, sin Node.js ni build
// ─────────────────────────────────────────────────────────────

const { useState, useEffect, useRef } = React;

const categories = [
  { id: "vehiculos",    label: "Vehículos",   icon: "🚗", color: "#FF6B35", count: 11393,
    subs: ["Autos","Camionetas / SUV","Motos","Camiones","Náutica","Planes de Ahorro"] },
  { id: "inmuebles",    label: "Inmuebles",   icon: "🏠", color: "#2EC4B6", count: 11872,
    subs: ["Casas","Departamentos","Terrenos / Lotes","Locales","Campos / Quintas","Galpones"] },
  { id: "servicios",    label: "Servicios",   icon: "🔧", color: "#9B5DE5", count: 7633,
    subs: ["Mantenimiento Hogar","Profesionales","Eventos","Transporte","Capacitaciones","Técnicos"] },
  { id: "electronicos", label: "Electrónica", icon: "📱", color: "#00BBF9", count: 6621,
    subs: ["Celulares","Computación","Audio / Video","Cámaras","Consolas","Accesorios"] },
  { id: "hogar",        label: "Hogar",       icon: "🛋️", color: "#F7B731", count: 7928,
    subs: ["Muebles","Jardín","Decoración","Electrodomésticos","Herramientas","Arte"] },
  { id: "ropa",         label: "Ropa & Moda", icon: "👗", color: "#FF85A1", count: 4251,
    subs: ["Ropa Mujer","Ropa Hombre","Zapatillas","Joyas","Relojes","Accesorios"] },
  { id: "deportes",     label: "Deportes",    icon: "⚽", color: "#0EAD69", count: 3602,
    subs: ["Fútbol","Ciclismo","Fitness","Camping","Natación","Artes Marciales"] },
  { id: "mascotas",     label: "Mascotas",    icon: "🐾", color: "#E55934", count: 770,
    subs: ["Perros","Gatos","Aves","Acuarios","Accesorios","Alimentos"] },
];

const featuredListings = [
  { id:1, title:"Toyota Hilux SRX 4x4 2022",          price:"U$S 42.000",    img:"🚙", category:"Vehículos", badge:"DESTACADO", time:"2h",      location:"Capital" },
  { id:2, title:"Casa 3 dorm. con jardín – Chimbas",   price:"U$S 78.000",    img:"🏡", category:"Inmuebles", badge:"DESTACADO", time:"4h",      location:"Chimbas" },
  { id:3, title:"iPhone 16 Pro 256GB – Como nuevo",    price:"U$S 850",       img:"📱", category:"Electrónica",badge:"DESTACADO", time:"1h",     location:"Palpalá" },
  { id:4, title:"Plomero matriculado – 24hs",          price:"Consultar",     img:"🔧", category:"Servicios", badge:"VERIFICADO",time:"6h",      location:"Capital" },
  { id:5, title:"Departamento 2 dorm. – Centro",       price:"$ 480.000/mes", img:"🏢", category:"Inmuebles", badge:"DESTACADO", time:"3h",      location:"Capital" },
  { id:6, title:"Honda CB 500F 2021 – 8.000km",        price:"$ 9.800.000",   img:"🏍️", category:"Vehículos",badge:"DESTACADO", time:"5h",      location:"Tilcara" },
];

const recentListings = [
  { id:7,  title:"Calefactor Industrial 5000W",        price:"$ 350.000",   img:"🔥", time:"19min", category:"Hogar"      },
  { id:8,  title:"Mesa y bancos madera maciza",         price:"$ 200.000",   img:"🪑", time:"39min", category:"Hogar"      },
  { id:9,  title:"Ford Focus SE 2.0 – 2017",           price:"$ 18.950.000",img:"🚗", time:"40min", category:"Vehículos"  },
  { id:10, title:"Parlante Bluetooth JBL",              price:"$ 85.000",    img:"🔊", time:"52min", category:"Electrónica"},
  { id:11, title:"Terreno 400m² – Palpalá",             price:"$ 7.500.000", img:"🌿", time:"1h",    category:"Inmuebles"  },
  { id:12, title:"Smart TV 55\" Samsung 4K",           price:"$ 520.000",   img:"📺", time:"1h 12m",category:"Electrónica"},
  { id:13, title:"Bicicleta MTB rodado 29",             price:"$ 180.000",   img:"🚴", time:"1h 30m",category:"Deportes"   },
  { id:14, title:"Conjunto living 3 cuerpos",           price:"$ 420.000",   img:"🛋️",time:"2h",    category:"Hogar"      },
];

const stores = [
  { name:"AutoMax Jujuy",    logo:"🚗", items:142, rating:4.8 },
  { name:"Inmobiliaria Norte",logo:"🏠",items:87,  rating:4.9 },
  { name:"TechStore JJ",     logo:"💻", items:203, rating:4.7 },
  { name:"Moda Andina",      logo:"👗", items:65,  rating:4.6 },
  { name:"Hogar & Deco SJ",  logo:"🛋️",items:118, rating:4.8 },
  { name:"MotoSport Jujuy",  logo:"🏍️",items:54,  rating:4.9 },
];

// Slots publicitarios por defecto (se sobreescriben con datos de Supabase)
const defaultAdSlots = {
  banner_top:    { title:"¡Publicá tu negocio aquí! Espacios disponibles", link_url:"#", bg_color:"linear-gradient(135deg,#7C3AED,#4338CA)" },
  banner_mid:    { title:"Tu tienda virtual desde $0 — ¡Abrí hoy!",        link_url:"#", bg_color:"linear-gradient(135deg,#F97316,#DC2626)"  },
  banner_bottom: { title:"Alcanzá miles de compradores en Jujuy",           link_url:"#", bg_color:"linear-gradient(135deg,#0F766E,#0369A1)"  },
};

// ─── Componente principal ───────────────────────────────────────────────────
function App() {
  const [searchQuery,      setSearchQuery]      = useState("");
  const [activeCategory,   setActiveCategory]   = useState(null);
  const [megaMenuOpen,     setMegaMenuOpen]      = useState(false);
  const [scrolled,         setScrolled]          = useState(false);
  const [publishModal,     setPublishModal]       = useState(false);
  const [adSlots,          setAdSlots]            = useState(defaultAdSlots);
  const [listings,         setListings]           = useState(recentListings);
  const [activeTab,        setActiveTab]          = useState("Todos");

  // Formulario de publicación
  const [form, setForm] = useState({ title:"", description:"", price:"", currency:"ARS", categoryId:"", location:"", contact:"", files:[] });
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cargar ad slots desde Supabase al iniciar
  useEffect(() => {
    async function loadAds() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data } = await db.from("ad_slots").select("*").eq("active", true);
        if (data?.length) {
          const slots = data.reduce((acc, s) => { acc[s.slot_id] = s; return acc; }, {});
          setAdSlots(prev => ({ ...prev, ...slots }));
        }
      } catch(e) { /* usa defaults */ }
    }
    loadAds();
  }, []);

  // Cargar últimos anuncios desde Supabase
  useEffect(() => {
    async function loadListings() {
      try {
        const { data } = await db.from("listings").select("*, listing_images(url)")
          .eq("status","active").order("created_at",{ascending:false}).limit(12);
        if (data?.length) setListings(data.map(l => ({
          id: l.id,
          title: l.title,
          price: l.price_label || "Consultar",
          img: l.listing_images?.[0]?.url || "🖼️",
          time: "reciente",
          category: l.category_id || "General"
        })));
      } catch(e) { /* usa mock data */ }
    }
    loadListings();
  }, []);

  const filteredListings = listings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab    = activeTab === "Todos" || l.category === activeTab;
    return matchSearch && matchTab;
  });

  async function handlePublish(e) {
    e.preventDefault();
    setPublishing(true);
    setPublishMsg("");
    try {
      await createListing({ ...form });
      setPublishMsg("✅ ¡Anuncio publicado con éxito!");
      setForm({ title:"", description:"", price:"", currency:"ARS", categoryId:"", location:"", contact:"", files:[] });
      setTimeout(() => setPublishModal(false), 1500);
    } catch(err) {
      setPublishMsg("❌ " + err.message);
    }
    setPublishing(false);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
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
        .store-card{display:flex;flex-direction:column;align-items:center;gap:10px;background:white;border-radius:16px;padding:18px 14px;cursor:pointer;transition:all .25s;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid #F0EDE8}
        .store-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(0,0,0,.1)}
        .pub-btn{background:#FF6B35;color:white;border:none;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.3px;white-space:nowrap;font-family:inherit}
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
        .ad-cta{background:white;color:#1A1A2E;border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit;flex-shrink:0}
        @media(max-width:600px){.featured-grid{grid-template-columns:1fr!important}.mega-menu-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"sticky",top:0,zIndex:300,background:scrolled?"#1A1A2E":"linear-gradient(135deg,#1A0A2E 0%,#2D1B6B 100%)",boxShadow:scrolled?"0 4px 20px rgba(0,0,0,.25)":"none",transition:"all .3s" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:10,height:66 }}>
          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:10,marginRight:16,cursor:"pointer",flexShrink:0 }}>
            <div style={{ width:38,height:38,background:"linear-gradient(135deg,#E63946,#F4A261)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🌵</div>
            <div>
              <div style={{ color:"white",fontWeight:800,fontSize:16,lineHeight:1.1 }}>Compra en Jujuy</div>
              <div style={{ color:"rgba(255,255,255,.5)",fontWeight:500,fontSize:10,letterSpacing:"1.5px",textTransform:"uppercase" }}>Clasificados gratuitos</div>
            </div>
          </div>

          {/* Buscador */}
          <div style={{ flex:1,maxWidth:480,background:"rgba(255,255,255,.1)",borderRadius:12,display:"flex",alignItems:"center",padding:"0 14px",height:42,border:"1px solid rgba(255,255,255,.15)" }}>
            <span style={{ marginRight:8,fontSize:16,opacity:.7 }}>🔍</span>
            <input style={{ flex:1,border:"none",outline:"none",fontSize:15,fontFamily:"inherit",background:"transparent",color:"white" }}
              placeholder="Buscar en todos los clasificados..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Links */}
          <div style={{ display:"flex",alignItems:"center",gap:4,marginLeft:"auto" }}>
            <button className="nav-link">Mi Cuenta</button>
            <button className="nav-link">Tiendas</button>
            <button className="nav-link" style={{ display:"flex",alignItems:"center",gap:5 }} onClick={() => setMegaMenuOpen(!megaMenuOpen)}>
              Categorías <span style={{ fontSize:10,transition:"transform .2s",display:"inline-block",transform:megaMenuOpen?"rotate(180deg)":"rotate(0)" }}>▼</span>
            </button>
            <button className="pub-btn" onClick={() => setPublishModal(true)}>✏️ Publicar GRATIS</button>
          </div>
        </div>

        {/* Mega menu */}
        {megaMenuOpen && (
          <div style={{ position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:"white",borderRadius:"0 0 20px 20px",boxShadow:"0 20px 60px rgba(0,0,0,.15)",zIndex:200,padding:28 }}>
            <div className="mega-menu-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20 }}>
              {categories.map(cat => (
                <div key={cat.id} onClick={() => { setActiveCategory(cat.id); setMegaMenuOpen(false); }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10,cursor:"pointer" }}>
                    <span style={{ fontSize:18 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontWeight:700,fontSize:14,color:"#1A1A2E" }}>{cat.label}</div>
                      <div style={{ fontSize:11,color:"#9CA3AF" }}>{cat.count.toLocaleString()} anuncios</div>
                    </div>
                  </div>
                  {cat.subs.map(sub => (
                    <div key={sub} style={{ fontSize:12,color:"#6B7280",padding:"3px 0 3px 26px",cursor:"pointer",transition:"color .15s" }}
                      onMouseEnter={e=>e.target.style.color="#FF6B35"}
                      onMouseLeave={e=>e.target.style.color="#6B7280"}>
                      {sub}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div style={{ background:"linear-gradient(135deg,#1A0A2E 0%,#3D1A6B 40%,#6B2D1A 70%,#1A0A2E 100%)",padding:"52px 20px 60px",position:"relative",overflow:"hidden" }}>
        {/* Barras 7 colores en el fondo */}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:8,background:"linear-gradient(90deg,#E63946,#F4A261,#F7D060,#8BC34A,#2EC4B6,#4A90D9,#9B5DE5)",opacity:.9 }}></div>
        <div style={{ position:"absolute",bottom:8,left:0,right:0,height:4,background:"linear-gradient(90deg,#F4A261,#E63946,#F7D060,#2EC4B6,#8BC34A,#9B5DE5,#4A90D9)",opacity:.5 }}></div>

        {/* Cactus decorativos */}
        {[{l:20,s:64,o:.12},{l:80,s:40,o:.08},{r:20,s:72,o:.12},{r:90,s:44,o:.07}].map((c,i)=>(
          <div key={i} style={{ position:"absolute",bottom:24,fontSize:c.s,opacity:c.o,lineHeight:1,[c.l?"left":"right"]:c.l||c.r }}>🌵</div>
        ))}

        <div style={{ maxWidth:1200,margin:"0 auto",textAlign:"center" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(244,162,97,.2)",border:"1px solid rgba(244,162,97,.4)",borderRadius:20,padding:"6px 16px",marginBottom:18 }}>
            <span style={{ color:"#F4A261",fontSize:12,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase" }}>🟢 Miles de anuncios activos</span>
          </div>

          {/* Cerro 7 colores */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"inline-flex",alignItems:"flex-end",gap:3,height:48 }}>
              {["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map((color,i)=>(
                <div key={i} style={{ width:18,height:`${28+Math.sin((i/6)*Math.PI)*20}px`,background:color,borderRadius:"4px 4px 0 0",opacity:.85 }}></div>
              ))}
            </div>
            <div style={{ color:"rgba(255,255,255,.4)",fontSize:10,fontWeight:600,letterSpacing:"2px",textTransform:"uppercase",marginTop:4 }}>Cerro de los 7 Colores · Purmamarca</div>
          </div>

          <h1 style={{ color:"white",fontSize:"clamp(28px,5vw,52px)",fontWeight:900,lineHeight:1.15,letterSpacing:"-1px",marginBottom:14 }}>
            Compra y vendé en <br />
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

          {/* Stats */}
          <div style={{ display:"flex",justifyContent:"center",gap:"clamp(20px,5vw,60px)",flexWrap:"wrap",marginTop:40 }}>
            {[{num:"86K+",label:"Anuncios activos"},{num:"Gratis",label:"Publicación"},{num:"24hs",label:"Soporte"},{num:"100%",label:"Jujuy"}].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:28,fontWeight:800,color:"white" }}>{s.num}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,.75)",fontWeight:500,marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 20px" }}>

        {/* ── AD BANNER TOP ── */}
        <AdBanner slot={adSlots.banner_top} />

        {/* ── CATEGORÍAS ── */}
        <div style={{ marginBottom:36 }}>
          <SectionTitle title="Explorar por categoría" sub="Encontrá exactamente lo que buscás" />
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:12 }}>
            {categories.map(cat=>(
              <div key={cat.id} className="cat-pill"
                style={{ borderColor:activeCategory===cat.id?cat.color:"transparent",background:activeCategory===cat.id?`${cat.color}18`:"white" }}
                onClick={()=>setActiveCategory(activeCategory===cat.id?null:cat.id)}>
                <div style={{ fontSize:28,lineHeight:1 }}>{cat.icon}</div>
                <div style={{ fontSize:11,fontWeight:700,color:"#1A1A2E",textAlign:"center",lineHeight:1.3 }}>{cat.label}</div>
                <div style={{ fontSize:10,color:"#9CA3AF" }}>{(cat.count/1000).toFixed(1)}k</div>
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
                  <span key={sub} style={{ background:"#F3F4F6",color:"#374151",padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s" }}
                    onMouseEnter={e=>{e.target.style.background="#FF6B35";e.target.style.color="white"}}
                    onMouseLeave={e=>{e.target.style.background="#F3F4F6";e.target.style.color="#374151"}}>
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── DESTACADOS ── */}
        <div style={{ marginBottom:36 }}>
          <SectionTitle title="⭐ Anuncios Destacados" sub="Publicaciones con mayor visibilidad" link="Ver todos →" />
          <div className="featured-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20 }}>
            {featuredListings.map(l=>(
              <div key={l.id} className="card">
                <div style={{ height:160,background:l.id%2===0?"linear-gradient(135deg,#F0F9FF,#E0F2FE)":"linear-gradient(135deg,#FFF7ED,#FFEDD5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,position:"relative" }}>
                  {l.img}
                  <span style={{ position:"absolute",top:10,left:10,background:l.badge==="VERIFICADO"?"#059669":"#FF6B35",color:"white",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6 }}>
                    {l.badge==="VERIFICADO"?"✓ ":"★ "}{l.badge}
                  </span>
                  <span style={{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,.55)",color:"white",fontSize:10,fontWeight:600,padding:"4px 8px",borderRadius:6 }}>{l.category}</span>
                </div>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:6,lineHeight:1.35 }}>{l.title}</div>
                  <div style={{ fontSize:18,fontWeight:900,color:"#FF6B35",marginBottom:10 }}>{l.price}</div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <span style={{ fontSize:11,color:"#9CA3AF" }}>📍 {l.location}</span>
                    <span style={{ fontSize:11,color:"#9CA3AF" }}>🕐 {l.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AD BANNER MID ── */}
        <AdBanner slot={adSlots.banner_mid} />

        {/* ── TIENDAS ── */}
        <div style={{ marginBottom:36 }}>
          <SectionTitle title="🏪 Tiendas Virtuales" sub="Vendedores verificados con catálogo completo" link="Ver todas →" />
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:14 }}>
            {stores.map(s=>(
              <div key={s.name} className="store-card">
                <div style={{ width:52,height:52,background:"linear-gradient(135deg,#F3F4F6,#E5E7EB)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>{s.logo}</div>
                <div style={{ fontWeight:700,fontSize:12,color:"#1A1A2E",textAlign:"center",lineHeight:1.3 }}>{s.name}</div>
                <div style={{ fontSize:11,color:"#9CA3AF" }}>{s.items} artículos</div>
                <div style={{ display:"flex",alignItems:"center",gap:3 }}>
                  <span style={{ color:"#F59E0B",fontSize:12 }}>★</span>
                  <span style={{ fontSize:12,fontWeight:700 }}>{s.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ÚLTIMOS PUBLICADOS ── */}
        <div style={{ marginBottom:36 }}>
          <SectionTitle title="🕐 Últimos Publicados" sub="Actualizados en tiempo real" link="Ver más →" />
          <div style={{ display:"flex",gap:8,marginBottom:18,flexWrap:"wrap" }}>
            {["Todos","Artículos","Vehículos","Inmuebles","Servicios"].map(t=>(
              <button key={t} className={`tab-btn ${t===activeTab?"tab-active":"tab-inactive"}`} onClick={()=>setActiveTab(t)}>{t}</button>
            ))}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12 }}>
            {filteredListings.map(l=>(
              <div key={l.id} className="recent-card">
                <div style={{ width:60,height:60,background:"linear-gradient(135deg,#FFF7ED,#FFEDD5)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:l.img.startsWith("http")?"14px":30,flexShrink:0,overflow:"hidden" }}>
                  {l.img.startsWith("http") ? <img src={l.img} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" /> : l.img}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#1A1A2E",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{l.title}</div>
                  <div style={{ fontSize:15,fontWeight:900,color:"#FF6B35" }}>{l.price}</div>
                  <div style={{ display:"flex",gap:8,marginTop:4 }}>
                    <span style={{ fontSize:10,color:"#9CA3AF",background:"#F3F4F6",padding:"2px 7px",borderRadius:5,fontWeight:600 }}>{l.category}</span>
                    <span style={{ fontSize:10,color:"#9CA3AF" }}>🕐 {l.time}</span>
                  </div>
                </div>
                <div style={{ fontSize:18,color:"#D1D5DB" }}>›</div>
              </div>
            ))}
          </div>
          {filteredListings.length===0 && (
            <div style={{ textAlign:"center",padding:"40px 20px",color:"#9CA3AF" }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🔍</div>
              <div style={{ fontWeight:600 }}>No se encontraron resultados para "{searchQuery}"</div>
            </div>
          )}
        </div>

        {/* ── AD BANNER BOTTOM ── */}
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
              <p style={{ fontSize:12,lineHeight:1.7 }}>Clasificados gratuitos para compradores y vendedores de toda la provincia de Jujuy, Argentina.</p>
              <div style={{ marginTop:16,display:"flex",gap:8,flexWrap:"wrap" }}>
                {["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map((c,i)=>(
                  <div key={i} style={{ width:18,height:18,background:c,borderRadius:4,opacity:.8 }}></div>
                ))}
              </div>
            </div>
            {[
              {title:"Publicar",links:["Publicar GRATIS","Cómo funciona","Planes destacados","Tienda virtual"]},
              {title:"Cuenta",  links:["Registrarse","Iniciar sesión","Mis anuncios","Mis favoritos"]},
              {title:"Ayuda",   links:["Consejos de seguridad","Preguntas frecuentes","Términos y condiciones","Contacto"]},
            ].map(col=>(
              <div key={col.title} style={{ flex:"1 1 140px" }}>
                <div style={{ color:"white",fontWeight:700,fontSize:13,marginBottom:14,textTransform:"uppercase",letterSpacing:".8px" }}>{col.title}</div>
                {col.links.map(l=>(
                  <a key={l} href="#" style={{ display:"block",color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12,marginBottom:8,transition:"color .15s" }}
                    onMouseEnter={e=>e.target.style.color="#F4A261"}
                    onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.5)"}>
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
                <a key={s} href="#" style={{ color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12,transition:"color .15s" }}
                  onMouseEnter={e=>e.target.style.color="white"}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.5)"}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── BOTÓN FLOTANTE ── */}
      <button onClick={()=>setPublishModal(true)}
        style={{ position:"fixed",bottom:28,right:28,background:"linear-gradient(135deg,#E63946,#F4A261)",color:"white",border:"none",width:60,height:60,borderRadius:"50%",fontSize:24,cursor:"pointer",boxShadow:"0 8px 24px rgba(230,57,70,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s",fontFamily:"inherit" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        ✏️
      </button>

      {/* ── MODAL PUBLICAR ── */}
      {publishModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setPublishModal(false)}>
          <div className="modal">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
              <div>
                <div style={{ fontSize:20,fontWeight:800,color:"#1A1A2E" }}>✏️ Publicar anuncio</div>
                <div style={{ fontSize:12,color:"#9CA3AF",marginTop:3 }}>Completá los datos de tu publicación</div>
              </div>
              <button onClick={()=>setPublishModal(false)} style={{ background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit" }}>×</button>
            </div>

            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Categoría *</div>
              <select className="form-input" value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>
                <option value="">Seleccioná una categoría...</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Título *</div>
              <input className="form-input" placeholder="Ej: iPhone 15 Pro 256GB – Como nuevo" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Precio</div>
                <input className="form-input" placeholder="350000" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Moneda</div>
                <select className="form-input" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>
                  <option value="ARS">$ ARS</option>
                  <option value="USD">U$S USD</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Descripción</div>
              <textarea className="form-input" rows={3} placeholder="Describí tu artículo o servicio..." style={{ resize:"vertical" }} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Ubicación</div>
                <input className="form-input" placeholder="Ej: San Salvador de Jujuy" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>WhatsApp / Teléfono</div>
                <input className="form-input" placeholder="388 4XX XXXX" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} />
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>Fotos (hasta 8)</div>
              <label style={{ display:"block",border:"2px dashed #E5E7EB",borderRadius:12,padding:"24px",textAlign:"center",cursor:"pointer",transition:"border-color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#FF6B35"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#E5E7EB"}>
                <div style={{ fontSize:28,marginBottom:6 }}>📷</div>
                <div style={{ fontSize:13,color:"#6B7280",fontWeight:600 }}>Tocá para elegir fotos</div>
                <div style={{ fontSize:11,color:"#9CA3AF",marginTop:3 }}>JPG, PNG · Máx. 5MB · Se comprimen automáticamente</div>
                <input type="file" accept="image/*" multiple style={{ display:"none" }}
                  onChange={e=>setForm({...form,files:[...e.target.files]})} />
              </label>
              {form.files.length>0 && <div style={{ fontSize:12,color:"#059669",marginTop:8,fontWeight:600 }}>✅ {form.files.length} foto(s) seleccionada(s)</div>}
            </div>

            {publishMsg && <div style={{ fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center" }}>{publishMsg}</div>}

            <button className="pub-btn" style={{ width:"100%",padding:16,fontSize:15,borderRadius:12,background:"linear-gradient(135deg,#E63946,#F4A261)",opacity:publishing?.7:1 }}
              onClick={handlePublish} disabled={publishing}>
              {publishing ? "⏳ Publicando..." : "🚀 Publicar anuncio GRATIS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────
function AdBanner({ slot }) {
  if (!slot) return null;
  return (
    <div className="ad-banner" style={{ background: slot.bg_color || "linear-gradient(135deg,#7C3AED,#4338CA)" }}>
      <div style={{ display:"flex",alignItems:"center",gap:16 }}>
        {slot.image_url
          ? <img src={slot.image_url} style={{ height:50,borderRadius:8,objectFit:"cover" }} alt="" />
          : <div style={{ fontSize:36 }}>🎯</div>
        }
        <div>
          <div style={{ color:"white",fontWeight:700,fontSize:16 }}>{slot.title || "Espacio publicitario"}</div>
          <div style={{ color:"rgba(255,255,255,.65)",fontSize:12,marginTop:2 }}>Publicidad • Administrado desde Supabase</div>
        </div>
      </div>
      <a href={slot.link_url || "#"} target="_blank" rel="noopener noreferrer">
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

// Montar la app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
