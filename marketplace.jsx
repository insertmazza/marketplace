import { useState, useEffect, useRef } from "react";

const categories = [
  {
    id: "vehiculos", label: "Vehículos", icon: "🚗", color: "#FF6B35", count: 11393,
    subs: ["Autos", "Camionetas / SUV", "Motos", "Camiones", "Náutica", "Planes de Ahorro"]
  },
  {
    id: "inmuebles", label: "Inmuebles", icon: "🏠", color: "#2EC4B6", count: 11872,
    subs: ["Casas", "Departamentos", "Terrenos / Lotes", "Locales", "Campos / Quintas", "Galpones"]
  },
  {
    id: "servicios", label: "Servicios", icon: "🔧", color: "#9B5DE5", count: 7633,
    subs: ["Mantenimiento Hogar", "Profesionales", "Eventos", "Transporte", "Capacitaciones", "Técnicos"]
  },
  {
    id: "electronicos", label: "Electrónica", icon: "📱", color: "#00BBF9", count: 6621,
    subs: ["Celulares", "Computación", "Audio / Video", "Cámaras", "Consolas", "Accesorios"]
  },
  {
    id: "hogar", label: "Hogar", icon: "🛋️", color: "#F7B731", count: 7928,
    subs: ["Muebles", "Jardín", "Decoración", "Electrodomésticos", "Herramientas", "Arte"]
  },
  {
    id: "ropa", label: "Ropa & Moda", icon: "👗", color: "#FF85A1", count: 4251,
    subs: ["Ropa Mujer", "Ropa Hombre", "Zapatillas", "Joyas", "Relojes", "Accesorios"]
  },
  {
    id: "deportes", label: "Deportes", icon: "⚽", color: "#0EAD69", count: 3602,
    subs: ["Fútbol", "Ciclismo", "Fitness", "Camping", "Natación", "Artes Marciales"]
  },
  {
    id: "mascotas", label: "Mascotas", icon: "🐾", color: "#E55934", count: 770,
    subs: ["Perros", "Gatos", "Aves", "Acuarios", "Accesorios", "Alimentos"]
  }
];

const featuredListings = [
  { id: 1, title: "Toyota Hilux SRX 4x4 2022", price: "U$S 42.000", img: "🚙", category: "Vehículos", badge: "DESTACADO", time: "2h", location: "Capital" },
  { id: 2, title: "Casa 3 dorm. con jardín – Chimbas", price: "U$S 78.000", img: "🏡", category: "Inmuebles", badge: "DESTACADO", time: "4h", location: "Chimbas" },
  { id: 3, title: "iPhone 16 Pro 256GB – Como nuevo", price: "U$S 850", img: "📱", category: "Electrónica", badge: "DESTACADO", time: "1h", location: "Rawson" },
  { id: 4, title: "Plomero matriculado – 24hs", price: "Consultar", img: "🔧", category: "Servicios", badge: "VERIFICADO", time: "6h", location: "Capital" },
  { id: 5, title: "Departamento 2 dorm. – Centro", price: "$ 480.000/mes", img: "🏢", category: "Inmuebles", badge: "DESTACADO", time: "3h", location: "Capital" },
  { id: 6, title: "Honda CB 500F 2021 – 8.000km", price: "$ 9.800.000", img: "🏍️", category: "Vehículos", badge: "DESTACADO", time: "5h", location: "Pocito" },
];

const recentListings = [
  { id: 7, title: "Calefactor Industrial 5000W", price: "$ 350.000", img: "🔥", time: "19min", category: "Hogar" },
  { id: 8, title: "Mesa y bancos madera maciza", price: "$ 200.000", img: "🪑", time: "39min", category: "Hogar" },
  { id: 9, title: "Ford Focus SE 2.0 – 2017", price: "$ 18.950.000", img: "🚗", time: "40min", category: "Vehículos" },
  { id: 10, title: "Parlante Bluetooth JBL", price: "$ 85.000", img: "🔊", time: "52min", category: "Electrónica" },
  { id: 11, title: "Terreno 400m² – Rivadavia", price: "$ 7.500.000", img: "🌿", time: "1h", category: "Inmuebles" },
  { id: 12, title: "Smart TV 55\" Samsung 4K", price: "$ 520.000", img: "📺", time: "1h 12min", category: "Electrónica" },
  { id: 13, title: "Bicicleta MTB rodado 29", price: "$ 180.000", img: "🚴", time: "1h 30min", category: "Deportes" },
  { id: 14, title: "Conjunto living 3 cuerpos", price: "$ 420.000", img: "🛋️", time: "2h", category: "Hogar" },
];

const stores = [
  { name: "AutoMax SJ", logo: "🚗", items: 142, rating: 4.8 },
  { name: "Inmobiliaria Sur", logo: "🏠", items: 87, rating: 4.9 },
  { name: "TechStore SJ", logo: "💻", items: 203, rating: 4.7 },
  { name: "Moda Urbana", logo: "👗", items: 65, rating: 4.6 },
  { name: "Hogar & Deco", logo: "🛋️", items: 118, rating: 4.8 },
  { name: "MotoSport SJ", logo: "🏍️", items: 54, rating: 4.9 },
];

// Simulated ad slots (in real app, these come from Supabase)
const adSlots = {
  banner_top: { img: "🎯", text: "¡Publicá tu negocio aquí! Espacios disponibles", cta: "Consultar", color: "from-violet-600 to-indigo-600" },
  banner_mid: { img: "🏪", text: "Tu tienda virtual desde $0 — ¡Abrí hoy!", cta: "Empezar gratis", color: "from-orange-500 to-rose-500" },
  banner_bottom: { img: "📣", text: "Alcanzá miles de compradores en San Juan", cta: "Ver planes", color: "from-teal-500 to-cyan-600" },
  sidebar_1: { img: "💎", text: "Destacá tu anuncio", sub: "3x más visitas", color: "#7C3AED" },
  sidebar_2: { img: "🏆", text: "Tienda Verificada", sub: "Mayor confianza", color: "#0EA5E9" },
};

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("");
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredListings = recentListings.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Sora', 'Nunito', sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1A1A2E" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 3px; }
        .nav-link { color: white; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; padding: 8px 14px; border-radius: 8px; transition: all 0.2s; white-space: nowrap; }
        .nav-link:hover { background: rgba(255,255,255,0.18); }
        .cat-pill { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; background: white; border-radius: 16px; cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); border: 2px solid transparent; min-width: 90px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .cat-pill:hover { transform: translateY(-5px) scale(1.04); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
        .listing-card { background: white; border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1px solid #F0EDE8; }
        .listing-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(0,0,0,0.12); }
        .recent-card { display: flex; gap: 12px; align-items: center; background: white; border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid #F0EDE8; }
        .recent-card:hover { transform: translateX(4px); box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
        .store-card { display: flex; flex-direction: column; align-items: center; gap: 10px; background: white; border-radius: 16px; padding: 18px 14px; cursor: pointer; transition: all 0.25s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #F0EDE8; }
        .store-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,0,0,0.1); }
        .search-input { width: 100%; border: none; outline: none; font-size: 15px; font-family: inherit; background: transparent; color: #1A1A2E; }
        .search-input::placeholder { color: #9CA3AF; }
        .publish-btn { background: #FF6B35; color: white; border: none; padding: 11px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; white-space: nowrap; }
        .publish-btn:hover { background: #E55520; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,107,53,0.4); }
        .badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.5px; }
        .ad-banner { border-radius: 18px; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; margin: 28px 0; }
        .ad-cta { background: white; color: #1A1A2E; border: none; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal { background: white; border-radius: 24px; width: 90%; max-width: 520px; padding: 32px; animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .form-label { font-size: 13px; font-weight: 600; color: #6B7280; }
        .form-input { border: 2px solid #E5E7EB; border-radius: 10px; padding: 11px 14px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: #FF6B35; }
        .section-title { font-size: 22px; font-weight: 800; color: #1A1A2E; margin-bottom: 4px; }
        .section-sub { font-size: 13px; color: #9CA3AF; margin-bottom: 22px; }
        .mega-menu { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: white; border-radius: 0 0 20px 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 200; padding: 28px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; animation: fadeIn 0.15s ease; }
        .alert-bar { background: linear-gradient(135deg, #FFF3CD, #FFEAA7); border: 1px solid #F6C90E; border-radius: 12px; padding: 14px 18px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
        @media (max-width: 768px) { .mega-menu { grid-template-columns: repeat(2, 1fr); } }
        .hero-stat { text-align: center; }
        .hero-stat-num { font-size: 28px; font-weight: 800; color: white; }
        .hero-stat-label { font-size: 11px; color: rgba(255,255,255,0.75); font-weight: 500; margin-top: 2px; }
        .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 12px; }
        .featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
        .recent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
        .stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
        .tab-btn { padding: 8px 18px; border-radius: 10px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .tab-active { background: #1A1A2E; color: white; }
        .tab-inactive { background: white; color: #6B7280; border: 1px solid #E5E7EB; }
        .tab-inactive:hover { border-color: #FF6B35; color: #FF6B35; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 300,
        background: scrolled ? "#1A1A2E" : "linear-gradient(135deg, #1A1A2E 0%, #2D1B6B 100%)",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.25)" : "none",
        transition: "all 0.3s ease"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 10, height: 66 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 16, cursor: "pointer", flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #E63946, #F4A261, #2EC4B6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌵</div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 16, lineHeight: 1.1, letterSpacing: "-0.3px" }}>Compra en Jujuy</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>Clasificados gratuitos</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 480, background: "rgba(255,255,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 14px", height: 42, border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <span style={{ marginRight: 8, fontSize: 16, opacity: 0.7 }}>🔍</span>
            <input
              className="search-input"
              style={{ color: "white" }}
              placeholder="Buscar en todos los clasificados..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
            <a href="#" className="nav-link">Mi Cuenta</a>
            <a href="#" className="nav-link">Tiendas</a>
            <div style={{ position: "relative" }}>
              <button
                className="nav-link"
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              >
                Categorías <span style={{ fontSize: 10, transition: "transform 0.2s", transform: megaMenuOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
            </div>
            <button className="publish-btn" onClick={() => setPublishModalOpen(true)}>
              ✏️ Publicar GRATIS
            </button>
          </div>
        </div>

        {/* Mega Menu */}
        {megaMenuOpen && (
          <div className="mega-menu" onClick={() => setMegaMenuOpen(false)}>
            {categories.map(cat => (
              <div key={cat.id} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1A2E" }}>{cat.label}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{cat.count.toLocaleString()} anuncios</div>
                  </div>
                </div>
                {cat.subs.map(sub => (
                  <a key={sub} href="#" style={{ display: "block", fontSize: 12, color: "#6B7280", textDecoration: "none", padding: "3px 0 3px 26px", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#FF6B35"}
                    onMouseLeave={e => e.target.style.color = "#6B7280"}>
                    {sub}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <div ref={heroRef} style={{ background: "linear-gradient(135deg, #1A0A2E 0%, #3D1A6B 40%, #6B2D1A 70%, #1A0A2E 100%)", padding: "52px 20px 60px", position: "relative", overflow: "hidden" }}>
        {/* Cerro 7 colores decorative stripes */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg, #E63946, #F4A261, #F7D060, #8BC34A, #2EC4B6, #4A90D9, #9B5DE5)", opacity: 0.9 }}></div>
        <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #F4A261, #E63946, #F7D060, #2EC4B6, #8BC34A, #9B5DE5, #4A90D9)", opacity: 0.5 }}></div>

        {/* Decorative cactus silhouettes */}
        <div style={{ position: "absolute", left: 20, bottom: 24, fontSize: 64, opacity: 0.12, lineHeight: 1 }}>🌵</div>
        <div style={{ position: "absolute", left: 80, bottom: 24, fontSize: 40, opacity: 0.08, lineHeight: 1 }}>🌵</div>
        <div style={{ position: "absolute", right: 20, bottom: 24, fontSize: 72, opacity: 0.12, lineHeight: 1 }}>🌵</div>
        <div style={{ position: "absolute", right: 90, bottom: 24, fontSize: 44, opacity: 0.07, lineHeight: 1 }}>🌵</div>

        {/* Glow orbs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(230,57,70,0.2) 0%, transparent 70%)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", bottom: 0, left: -40, width: 250, height: 250, background: "radial-gradient(circle, rgba(46,196,182,0.15) 0%, transparent 70%)", pointerEvents: "none" }}></div>

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(244,162,97,0.2)", border: "1px solid rgba(244,162,97,0.4)", borderRadius: 20, padding: "6px 16px", marginBottom: 18 }}>
              <span style={{ color: "#F4A261", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>🟢 Miles de anuncios activos</span>
            </div>

            {/* Mountain icon */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, height: 48 }}>
                {["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map((color, i) => (
                  <div key={i} style={{
                    width: 18,
                    height: `${28 + Math.sin((i / 6) * Math.PI) * 20}px`,
                    background: color,
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.85,
                    transition: "height 0.3s"
                  }}></div>
                ))}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginTop: 4 }}>Cerro de los 7 Colores · Purmamarca</div>
            </div>

            <h1 style={{ color: "white", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 14 }}>
              Compra y vendé en<br />
              <span style={{ background: "linear-gradient(90deg, #E63946, #F4A261, #F7D060, #8BC34A, #2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Jujuy 🌵
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "clamp(13px, 2vw, 16px)", maxWidth: 500, margin: "0 auto 32px" }}>
              Clasificados gratuitos para toda la provincia. Publicá en segundos, llegá a miles.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="publish-btn" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 14, background: "linear-gradient(135deg, #E63946, #F4A261)", boxShadow: "0 8px 24px rgba(230,57,70,0.4)" }} onClick={() => setPublishModalOpen(true)}>
                ✏️ Publicar GRATIS
              </button>
              <button style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.25)", padding: "14px 28px", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>
                🔍 Explorar todo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 60px)", flexWrap: "wrap" }}>
            {[
              { num: "86K+", label: "Anuncios activos" },
              { num: "Gratis", label: "Publicación" },
              { num: "24hs", label: "Soporte" },
              { num: "100%", label: "Jujuy" },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>

        {/* AD BANNER TOP — Slot configurable vía Supabase */}
        <div className={`ad-banner bg-gradient-to-r ${adSlots.banner_top.color}`} style={{ background: "linear-gradient(135deg, #7C3AED, #4338CA)", marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36 }}>{adSlots.banner_top.img}</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{adSlots.banner_top.text}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>Espacio publicitario premium • Slot: banner_top</div>
            </div>
          </div>
          <button className="ad-cta">{adSlots.banner_top.cta} →</button>
        </div>

        {/* CATEGORIES */}
        <div style={{ marginBottom: 36 }}>
          <div className="section-title">Explorar por categoría</div>
          <div className="section-sub">Encontrá exactamente lo que buscás</div>
          <div className="cat-grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="cat-pill"
                style={{ borderColor: activeCategory === cat.id ? cat.color : "transparent", background: activeCategory === cat.id ? `${cat.color}10` : "white" }}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              >
                <div style={{ fontSize: 28, lineHeight: 1 }}>{cat.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1A2E", textAlign: "center", lineHeight: 1.3 }}>{cat.label}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>{(cat.count / 1000).toFixed(1)}k</div>
              </div>
            ))}
          </div>
          {activeCategory && (
            <div style={{ marginTop: 16, background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid #F0EDE8", animation: "fadeIn 0.2s ease" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Subcategorías de {categories.find(c => c.id === activeCategory)?.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.find(c => c.id === activeCategory)?.subs.map(sub => (
                  <span key={sub} style={{ background: "#F3F4F6", color: "#374151", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.target.style.background = "#FF6B35"; e.target.style.color = "white"; }}
                    onMouseLeave={e => { e.target.style.background = "#F3F4F6"; e.target.style.color = "#374151"; }}>
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FEATURED LISTINGS */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div className="section-title">⭐ Anuncios Destacados</div>
            <a href="#" style={{ fontSize: 13, color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>Ver todos →</a>
          </div>
          <div className="section-sub">Publicaciones con mayor visibilidad y confianza</div>
          <div className="featured-grid">
            {featuredListings.map(listing => (
              <div key={listing.id} className="listing-card">
                <div style={{ height: 160, background: `linear-gradient(135deg, ${listing.id % 2 === 0 ? "#F0F9FF, #E0F2FE" : "#FFF7ED, #FFEDD5"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, position: "relative" }}>
                  {listing.img}
                  <span className="badge" style={{ position: "absolute", top: 10, left: 10, background: listing.badge === "VERIFICADO" ? "#059669" : "#FF6B35", color: "white" }}>
                    {listing.badge === "VERIFICADO" ? "✓" : "★"} {listing.badge}
                  </span>
                  <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 6 }}>
                    {listing.category}
                  </span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 6, lineHeight: 1.35 }}>{listing.title}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#FF6B35", marginBottom: 10 }}>{listing.price}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>📍 {listing.location}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>🕐 {listing.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AD BANNER MID */}
        <div className="ad-banner" style={{ background: "linear-gradient(135deg, #F97316, #DC2626)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36 }}>{adSlots.banner_mid.img}</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{adSlots.banner_mid.text}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>Espacio publicitario premium • Slot: banner_mid</div>
            </div>
          </div>
          <button className="ad-cta">{adSlots.banner_mid.cta} →</button>
        </div>

        {/* VIRTUAL STORES */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div className="section-title">🏪 Tiendas Virtuales</div>
            <a href="#" style={{ fontSize: 13, color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>Ver todas →</a>
          </div>
          <div className="section-sub">Vendedores verificados con catálogo completo</div>
          <div className="stores-grid">
            {stores.map(store => (
              <div key={store.name} className="store-card">
                <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #F3F4F6, #E5E7EB)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{store.logo}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1A1A2E", textAlign: "center", lineHeight: 1.3 }}>{store.name}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{store.items} artículos</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ color: "#F59E0B", fontSize: 12 }}>★</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E" }}>{store.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT LISTINGS */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div className="section-title">🕐 Últimos Publicados</div>
            <a href="#" style={{ fontSize: 13, color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>Ver más →</a>
          </div>
          <div className="section-sub">Recién llegados — actualizados en tiempo real</div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {["Todos", "Artículos", "Vehículos", "Inmuebles", "Servicios"].map(t => (
              <button key={t} className={`tab-btn ${t === "Todos" ? "tab-active" : "tab-inactive"}`}>{t}</button>
            ))}
          </div>

          <div className="recent-grid">
            {(searchQuery ? filteredListings : recentListings).map(listing => (
              <div key={listing.id} className="recent-card">
                <div style={{ width: 60, height: 60, background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
                  {listing.img}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{listing.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#FF6B35" }}>{listing.price}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>{listing.category}</span>
                    <span style={{ fontSize: 10, color: "#9CA3AF" }}>🕐 {listing.time}</span>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: "#D1D5DB", paddingLeft: 4 }}>›</div>
              </div>
            ))}
          </div>
          {searchQuery && filteredListings.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>No se encontraron resultados para "{searchQuery}"</div>
            </div>
          )}
        </div>

        {/* AD BANNER BOTTOM */}
        <div className="ad-banner" style={{ background: "linear-gradient(135deg, #0F766E, #0369A1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36 }}>{adSlots.banner_bottom.img}</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{adSlots.banner_bottom.text}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>Espacio publicitario premium • Slot: banner_bottom</div>
            </div>
          </div>
          <button className="ad-cta">{adSlots.banner_bottom.cta} →</button>
        </div>

        {/* SIDEBAR ADS note */}
        <div style={{ background: "white", borderRadius: 18, padding: 24, marginBottom: 36, border: "1px solid #F0EDE8" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>🎯 Espacios publicitarios disponibles</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(adSlots).map(([slot, ad]) => (
              <div key={slot} style={{ flex: "1 1 140px", background: "#F9F8F6", borderRadius: 12, padding: "14px", border: "2px dashed #E5E7EB", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#FF6B35"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{ad.img}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{ad.text}</div>
                {ad.sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>{ad.sub}</div>}
                <div style={{ fontSize: 10, color: "#FF6B35", fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Slot: {slot}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#F0FDF4", borderRadius: 10, border: "1px solid #BBF7D0" }}>
            <div style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>
              ✅ Todos los espacios publicitarios se configuran dinámicamente desde <strong>Supabase</strong> (tabla <code style={{ background: "#DCFCE7", padding: "1px 5px", borderRadius: 4 }}>ad_slots</code>). El admin actualiza imagen, URL y posición sin tocar código. Compatible con la arquitectura <strong>GitHub + Supabase + Cloudflare</strong>.
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ background: "#1A1A2E", color: "rgba(255,255,255,0.65)", padding: "40px 20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, marginBottom: 32 }}>
            <div style={{ flex: "1 1 220px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #FF6B35, #FF4757)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛒</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>Clasificados San Juan</div>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>Clasificados gratuitos para compradores y vendedores de toda la provincia de San Juan, Argentina.</p>
            </div>
            {[
              { title: "Publicar", links: ["Publicar GRATIS", "Cómo funciona", "Planes destacados", "Tienda virtual"] },
              { title: "Cuenta", links: ["Registrarse", "Iniciar sesión", "Mis anuncios", "Mis favoritos"] },
              { title: "Ayuda", links: ["Consejos de seguridad", "Preguntas frecuentes", "Términos y condiciones", "Contacto"] },
            ].map(col => (
              <div key={col.title} style={{ flex: "1 1 140px" }}>
                <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.8px" }}>{col.title}</div>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ display: "block", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 12, marginBottom: 8, transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#FF6B35"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12 }}>© 2024–2026 Clasificados San Juan. Todos los derechos reservados.</div>
            <div style={{ display: "flex", gap: 16 }}>
              {["📘 Facebook", "📸 Instagram", "💬 WhatsApp"].map(s => (
                <a key={s} href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 12, transition: "color 0.15s" }}
                  onMouseEnter={e => e.target.style.color = "white"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* PUBLISH MODAL */}
      {publishModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPublishModalOpen(false)}>
          <div className="modal">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E" }}>✏️ Publicar anuncio</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>Completá los datos de tu publicación</div>
              </div>
              <button onClick={() => setPublishModalOpen(false)} style={{ background: "#F3F4F6", border: "none", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select className="form-input" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
                <option value="">Seleccioná una categoría...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Título del anuncio *</label>
              <input className="form-input" placeholder="Ej: iPhone 15 Pro 256GB – Como nuevo" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Precio</label>
                <input className="form-input" placeholder="$ 0.000" />
              </div>
              <div className="form-group">
                <label className="form-label">Moneda</label>
                <select className="form-input">
                  <option>$ ARS</option>
                  <option>U$S USD</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" rows={3} placeholder="Describí tu artículo o servicio..." style={{ resize: "vertical" }} />
            </div>

            <div className="form-group">
              <label className="form-label">Fotos (hasta 8)</label>
              <div style={{ border: "2px dashed #E5E7EB", borderRadius: 12, padding: "24px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#FF6B35"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>Arrastrá o hacé clic para subir fotos</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>JPG, PNG · Máx. 5MB por imagen</div>
              </div>
            </div>

            <button className="publish-btn" style={{ width: "100%", padding: 16, fontSize: 15, borderRadius: 12, marginTop: 4 }}>
              🚀 Publicar anuncio GRATIS
            </button>
          </div>
        </div>
      )}

      {/* Floating publish button */}
      <button
        onClick={() => setPublishModalOpen(true)}
        style={{ position: "fixed", bottom: 28, right: 28, background: "linear-gradient(135deg, #FF6B35, #FF4757)", color: "white", border: "none", width: 60, height: 60, borderRadius: "50%", fontSize: 26, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,53,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title="Publicar GRATIS"
      >
        ✏️
      </button>
    </div>
  );
}
