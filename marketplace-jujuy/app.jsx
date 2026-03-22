// ─────────────────────────────────────────────────────────────
//  app.jsx — Marketplace "Compra en Jujuy"
//  Todos los datos vienen de Supabase — sin datos ficticios
// ─────────────────────────────────────────────────────────────

const { useState, useEffect } = React;

const categories = [
  { id: "vehiculos",    label: "Vehículos",   icon: "🚗", color: "#FF6B35", subs: ["Autos","Camionetas / SUV","Motos","Camiones","Náutica","Planes de Ahorro"] },
  { id: "inmuebles",    label: "Inmuebles",   icon: "🏠", color: "#2EC4B6", subs: ["Casas","Departamentos","Terrenos / Lotes","Locales","Campos / Quintas","Galpones"] },
  { id: "servicios",    label: "Servicios",   icon: "🔧", color: "#9B5DE5", subs: ["Mantenimiento Hogar","Profesionales","Eventos","Transporte","Capacitaciones","Técnicos"] },
  { id: "electronicos", label: "Electrónica", icon: "📱", color: "#00BBF9", subs: ["Celulares","Computación","Audio / Video","Cámaras","Consolas","Accesorios"] },
  { id: "hogar",        label: "Hogar",       icon: "🛋️", color: "#F7B731", subs: ["Muebles","Jardín","Decoración","Electrodomésticos","Herramientas","Arte"] },
  { id: "ropa",         label: "Ropa & Moda", icon: "👗", color: "#FF85A1", subs: ["Ropa Mujer","Ropa Hombre","Zapatillas","Joyas","Relojes","Accesorios"] },
  { id: "deportes",     label: "Deportes",    icon: "⚽", color: "#0EAD69", subs: ["Fútbol","Ciclismo","Fitness","Camping","Natación","Artes Marciales"] },
  { id: "mascotas",     label: "Mascotas",    icon: "🐾", color: "#E55934", subs: ["Perros","Gatos","Aves","Acuarios","Accesorios","Alimentos"] },
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

function App() {
  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [megaMenuOpen,   setMegaMenuOpen]   = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [publishModal,   setPublishModal]   = useState(false);
  const [activeTab,      setActiveTab]      = useState("Todos");

  const [totalListings,  setTotalListings]  = useState(null);
  const [catCounts,      setCatCounts]      = useState({});
  const [recentListings, setRecentListings] = useState([]);
  const [topListings,    setTopListings]    = useState([]);
  const [adSlots,        setAdSlots]        = useState(defaultAdSlots);
  const [loading,        setLoading]        = useState(true);

  const [form,       setForm]       = useState({ title:"", description:"", price:"", currency:"ARS", categoryId:"", location:"", contact:"", files:[] });
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { loadData(); }, []);

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

  const filteredRecent = recentListings.filter(l => {
    const matchSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab    = activeTab === "Todos" || l.category_id === activeTab;
    return matchSearch && matchTab;
  });

  async function handlePublish(e) {
    e.preventDefault();
    if (!form.title || !form.categoryId) { setPublishMsg("❌ Completá el título y la categoría"); return; }
    setPublishing(true);
    setPublishMsg("");
    try {
      await createListing({ ...form });
      setPublishMsg("✅ ¡Anuncio publicado con éxito!");
      setForm({ title:"", description:"", price:"", currency:"ARS", categoryId:"", location:"", contact:"", files:[] });
      await loadData();
      setTimeout(() => setPublishModal(false), 1500);
    } catch(err) { setPublishMsg("❌ " + err.message); }
    setPublishing(false);
  }

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
        @media(max-width:600px){.mega-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {/* NAVBAR */}
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
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:4,marginLeft:"auto" }}>
            <button className="nav-link">Mi Cuenta</button>
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
                <div key={cat.id} onClick={()=>{setActiveCategory(cat.id);setMegaMenuOpen(false);}}>
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

      {/* HERO */}
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
              { num: totalListings===null ? "..." : totalListings.toLocaleString("es-AR"), label:"Anuncios activos" },
              { num:"Gratis", label:"Publicación" },
              { num:"24hs",   label:"Soporte" },
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

        {/* AD TOP */}
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

        {/* MÁS VISTOS — solo si hay datos reales */}
        {topListings.length > 0 && (
          <div style={{ marginBottom:36 }}>
            <SectionTitle title="🔥 Más vistos" sub="Ordenados por tráfico real" link="Ver todos →" />
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20 }}>
              {topListings.map(l=><ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}

        {/* AD MID */}
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
                    <div style={{ fontSize:15,fontWeight:900,color:"#FF6B35" }}>{l.price_label || "Consultar"}</div>
                    <div style={{ display:"flex",gap:8,marginTop:4 }}>
                      <span style={{ fontSize:10,color:"#9CA3AF",background:"#F3F4F6",padding:"2px 7px",borderRadius:5,fontWeight:600 }}>
                        {categories.find(c=>c.id===l.category_id)?.label || l.category_id}
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

        {/* AD BOTTOM */}
        <AdBanner slot={adSlots.banner_bottom} />

      </div>

      {/* FOOTER */}
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
              {title:"Ayuda",   links:["Consejos de seguridad","Preguntas frecuentes","Términos y condiciones","Contacto"]},
            ].map(col=>(
              <div key={col.title} style={{ flex:"1 1 140px" }}>
                <div style={{ color:"white",fontWeight:700,fontSize:13,marginBottom:14,textTransform:"uppercase",letterSpacing:".8px" }}>{col.title}</div>
                {col.links.map(l=>(
                  <a key={l} href="#" style={{ display:"block",color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12,marginBottom:8 }}
                    onMouseEnter={e=>e.target.style.color="#F4A261"}
                    onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.5)"}>{l}</a>
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

      {/* MODAL */}
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

            {[
              { label:"Categoría *", content:
                <select className="form-input" value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>
                  <option value="">Seleccioná una categoría...</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              },
              { label:"Título *", content:
                <input className="form-input" placeholder="Ej: iPhone 15 Pro 256GB – Como nuevo" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              },
            ].map(f=>(
              <div key={f.label} style={{ marginBottom:18 }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>{f.label}</div>
                {f.content}
              </div>
            ))}

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
                <input className="form-input" placeholder="San Salvador de Jujuy" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 }}>WhatsApp</div>
                <input className="form-input" placeholder="388 4XX XXXX" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} />
              </div>
            </div>

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

            {publishMsg && <div style={{ fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center" }}>{publishMsg}</div>}

            <button className="pub-btn" style={{ width:"100%",padding:16,fontSize:15,borderRadius:12,background:"linear-gradient(135deg,#E63946,#F4A261)",opacity:publishing?0.7:1 }}
              onClick={handlePublish} disabled={publishing}>
              {publishing ? "⏳ Publicando..." : "🚀 Publicar anuncio GRATIS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
