const { useState, useEffect } = React;

const categories = [
  { id:"vehiculos",    label:"Vehículos",   icon:"🚗", color:"#FF6B35", subs:["Autos","Camionetas / SUV","Motos","Camiones","Náutica","Planes de Ahorro"] },
  { id:"inmuebles",    label:"Inmuebles",   icon:"🏠", color:"#2EC4B6", subs:["Casas","Departamentos","Terrenos / Lotes","Locales","Campos / Quintas","Galpones"] },
  { id:"servicios",    label:"Servicios",   icon:"🔧", color:"#9B5DE5", subs:["Mantenimiento Hogar","Profesionales","Eventos","Transporte","Capacitaciones","Técnicos"] },
  { id:"electronicos", label:"Electrónica", icon:"📱", color:"#00BBF9", subs:["Celulares","Computación","Audio / Video","Cámaras","Consolas","Accesorios"] },
  { id:"hogar",        label:"Hogar",       icon:"🛋️", color:"#F7B731", subs:["Muebles","Jardín","Decoración","Electrodomésticos","Herramientas","Arte"] },
  { id:"ropa",         label:"Ropa & Moda", icon:"👗", color:"#FF85A1", subs:["Ropa Mujer","Ropa Hombre","Zapatillas","Joyas","Relojes","Accesorios"] },
  { id:"deportes",     label:"Deportes",    icon:"⚽", color:"#0EAD69", subs:["Fútbol","Ciclismo","Fitness","Camping","Natación","Artes Marciales"] },
  { id:"mascotas",     label:"Mascotas",    icon:"🐾", color:"#E55934", subs:["Acuarios","Accesorios para mascotas","Alimentos para mascotas"] },
];

const securityTips = [
  {
    titulo:"Si vas a COMPRAR, desconfiá del vendedor cuando insiste en:",
    color:"#92400E", bg:"#FFFBEB", border:"#F59E0B",
    items:[
      "Pedirte el adelanto del pago del producto o del valor del envío.",
      "Informarte una ubicación distinta a la que aparece en su anuncio.",
      "Ofrecer promociones sumamente llamativas y/o precios sospechosamente bajos.",
      "Ofrecer precios bajos siendo que el vendedor es nuevo en el sitio (registrado en los últimos días).",
    ]
  },
  {
    titulo:"Si vas a VENDER, desconfiá de un comprador cuando insiste en:",
    color:"#065F46", bg:"#F0FDF4", border:"#10B981",
    items:[
      "Abonarte a través de Western Union, Paypal, Moneygram u otros medios electrónicos.",
      "Abonarte con moneda extranjera. Realizá la transacción en un banco para verificar la autenticidad.",
      "Abonarte con cheques. Corroborá con tu banco si tiene fondos antes de enviar el producto.",
      "Ofrecerte una seña via transferencia bancaria cuando en realidad te enviará una solicitud desde tu cuenta.",
      "Ofrecerte comprobante falso por un monto mayor, exigiéndote la devolución de la diferencia.",
      "Recibir el producto antes de pagar por él.",
    ]
  },
  {
    titulo:"En general tené en cuenta:",
    color:"#1E3A5F", bg:"#EFF6FF", border:"#3B82F6",
    items:[
      "En lo posible realizá la transacción en persona y en lugar seguro.",
      "Nunca envíes información personal: datos bancarios, número de tarjeta, etc.",
      "Si un anuncio te resulta sospechoso, reportalo con el link 'Denunciar este anuncio'.",
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
  if (diff < 60)    return diff + "s";
  if (diff < 3600)  return Math.floor(diff/60) + "min";
  if (diff < 86400) return Math.floor(diff/3600) + "h";
  return Math.floor(diff/86400) + "d";
}

function formatCount(n) {
  if (!n && n !== 0) return "...";
  if (n >= 1000) return (n/1000).toFixed(1) + "k";
  return String(n);
}

function formatPrice(val) {
  const num = val.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function App() {
  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [megaMenuOpen,   setMegaMenuOpen]   = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [activeTab,      setActiveTab]      = useState("Todos");
  const [publishModal,   setPublishModal]   = useState(false);
  const [authModal,      setAuthModal]      = useState(false);
  const [authMode,       setAuthMode]       = useState("login");
  const [securityModal,  setSecurityModal]  = useState(false);

  const [user,        setUser]        = useState(null);
  const [authForm,    setAuthForm]    = useState({ email:"", password:"", confirmPassword:"" });
  const [authMsg,     setAuthMsg]     = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [totalListings,  setTotalListings]  = useState(null);
  const [catCounts,      setCatCounts]      = useState({});
  const [recentListings, setRecentListings] = useState([]);
  const [topListings,    setTopListings]    = useState([]);
  const [adSlots,        setAdSlots]        = useState(defaultAdSlots);
  const [loading,        setLoading]        = useState(true);

  const [form,       setForm]       = useState({ title:"", description:"", price:"", priceType:"valor", currency:"ARS", categoryId:"", subcategory:"", location:"", contact:"", files:[], previews:[] });
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    db.auth.getUser().then(function(r) { if (r.data && r.data.user) setUser(r.data.user); });
    const sub = db.auth.onAuthStateChange(function(_e, session) { setUser(session ? session.user : null); });
    loadData();
    return function() {
      window.removeEventListener("scroll", onScroll);
      if (sub && sub.data && sub.data.subscription) sub.data.subscription.unsubscribe();
    };
  }, []);

  async function loadData() {
    try {
      const t = await db.from("listings").select("*", { count:"exact", head:true }).eq("status","active");
      setTotalListings(t.count || 0);

      const counts = {};
      await Promise.all(categories.map(async function(cat) {
        const r = await db.from("listings").select("*", { count:"exact", head:true }).eq("status","active").eq("category_id", cat.id);
        counts[cat.id] = r.count || 0;
      }));
      setCatCounts(counts);

      const top = await db.from("listings").select("*, listing_images(url)").eq("status","active").order("views", { ascending:false }).limit(6);
      setTopListings(top.data || []);

      const recent = await db.from("listings").select("*, listing_images(url)").eq("status","active").order("created_at", { ascending:false }).limit(12);
      setRecentListings(recent.data || []);

      const ads = await db.from("ad_slots").select("*").eq("active", true);
      if (ads.data && ads.data.length) {
        const slots = ads.data.reduce(function(acc, s) { acc[s.slot_id] = s; return acc; }, {});
        setAdSlots(function(prev) { return Object.assign({}, prev, slots); });
      }
    } catch(e) { console.error("Error:", e); }
    setLoading(false);
  }

  function handleFiles(e) {
    const newFiles = Array.from(e.target.files);
    const combined = form.files.concat(newFiles).slice(0, 8);
    const previews = combined.map(function(f) { return URL.createObjectURL(f); });
    setForm(Object.assign({}, form, { files: combined, previews: previews }));
  }

  function removeImage(idx) {
    const files    = form.files.filter(function(_,i) { return i !== idx; });
    const previews = files.map(function(f) { return URL.createObjectURL(f); });
    setForm(Object.assign({}, form, { files: files, previews: previews }));
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthMsg(""); setAuthLoading(true);
    const email = authForm.email, password = authForm.password, confirmPassword = authForm.confirmPassword;
    if (!email || !password) { setAuthMsg("❌ Completá todos los campos"); setAuthLoading(false); return; }
    try {
      if (authMode === "register") {
        if (password !== confirmPassword) { setAuthMsg("❌ Las contraseñas no coinciden"); setAuthLoading(false); return; }
        if (password.length < 6) { setAuthMsg("❌ Mínimo 6 caracteres"); setAuthLoading(false); return; }
        const r = await db.auth.signUp({ email: email, password: password });
        if (r.error) throw r.error;
        setAuthMsg("✅ ¡Registrado! Revisá tu email para confirmar.");
      } else {
        const r = await db.auth.signInWithPassword({ email: email, password: password });
        if (r.error) throw r.error;
        setAuthMsg("✅ ¡Bienvenido!");
        setTimeout(function() { setAuthModal(false); setAuthMsg(""); setAuthForm({ email:"", password:"", confirmPassword:"" }); }, 900);
      }
    } catch(err) {
      const msg = err.message && err.message.includes("Invalid login") ? "Email o contraseña incorrectos"
        : err.message && err.message.includes("already registered") ? "Este email ya está registrado"
        : err.message || "Error desconocido";
      setAuthMsg("❌ " + msg);
    }
    setAuthLoading(false);
  }

  async function handleLogout() { await db.auth.signOut(); }

  async function handlePublish(e) {
    e.preventDefault();
    if (!user) { setPublishModal(false); setAuthModal(true); setAuthMode("login"); return; }
    if (!form.title || !form.categoryId) { setPublishMsg("❌ Completá el título y la categoría"); return; }
    setPublishing(true); setPublishMsg("");
    try {
      const rawPrice   = form.price.replace(/\./g, "");
      const priceLabel = form.priceType === "consultar" ? "Consultar"
        : rawPrice ? ((form.currency === "USD" ? "U$S" : "$") + " " + form.price) : "Consultar";

      const ins = await db.from("listings").insert({
        title:         form.title,
        description:   form.description,
        price:         form.priceType === "consultar" ? null : (parseFloat(rawPrice) || null),
        currency:      form.currency,
        price_label:   priceLabel,
        category_id:   form.categoryId,
        subcategory:   form.subcategory || null,
        location:      form.location,
        contact_phone: form.contact,
        user_id:       user.id,
        status:        "active",
      }).select().single();

      if (ins.error) throw ins.error;

      if (form.files && form.files.length && typeof uploadImage === "function") {
        const images = await Promise.all(
          form.files.map(async function(file, i) {
            const r = await uploadImage(file);
            return { listing_id: ins.data.id, url: r.url, r2_key: r.key, position: i };
          })
        );
        await db.from("listing_images").insert(images);
      }

      setPublishMsg("✅ ¡Anuncio publicado con éxito!");
      setForm({ title:"", description:"", price:"", priceType:"valor", currency:"ARS", categoryId:"", subcategory:"", location:"", contact:"", files:[], previews:[] });
      await loadData();
      setTimeout(function() { setPublishModal(false); setPublishMsg(""); }, 1500);
    } catch(err) { setPublishMsg("❌ " + (err.message || "Error al publicar")); }
    setPublishing(false);
  }

  const filteredRecent = recentListings.filter(function(l) {
    const matchSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab    = activeTab === "Todos" || l.category_id === activeTab;
    return matchSearch && matchTab;
  });

  const activeCatSubs = (categories.find(function(c) { return c.id === form.categoryId; }) || {}).subs || [];

  return React.createElement("div", { style:{ fontFamily:"'Sora','Nunito',sans-serif", background:"#F8F7F4", minHeight:"100vh", color:"#1A1A2E" } },
    React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#FF6B35;border-radius:3px}
      .nl{color:white;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px;transition:all .2s;cursor:pointer;background:none;border:none;font-family:inherit}
      .nl:hover{background:rgba(255,255,255,.18)}
      .cp{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;background:white;border-radius:16px;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);border:2px solid transparent;box-shadow:0 2px 8px rgba(0,0,0,.06)}
      .cp:hover{transform:translateY(-5px) scale(1.04);box-shadow:0 12px 28px rgba(0,0,0,.12)}
      .card{background:white;border-radius:16px;overflow:hidden;cursor:pointer;transition:all .25s;box-shadow:0 2px 10px rgba(0,0,0,.06);border:1px solid #F0EDE8}
      .card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(0,0,0,.12)}
      .rc{display:flex;gap:12px;align-items:center;background:white;border-radius:12px;padding:12px;cursor:pointer;transition:all .2s;border:1px solid #F0EDE8}
      .rc:hover{transform:translateX(4px);box-shadow:0 6px 20px rgba(0,0,0,.09)}
      .pb{background:#FF6B35;color:white;border:none;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit}
      .pb:hover{background:#E55520;transform:translateY(-1px);box-shadow:0 6px 16px rgba(255,107,53,.4)}
      .tb{padding:8px 18px;border-radius:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
      .ta{background:#1A1A2E;color:white}
      .ti{background:white;color:#6B7280;border:1px solid #E5E7EB}
      .ti:hover{border-color:#FF6B35;color:#FF6B35}
      .mo{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
      .md{background:white;border-radius:24px;width:90%;max-width:520px;padding:32px;max-height:90vh;overflow-y:auto}
      .fi{border:2px solid #E5E7EB;border-radius:10px;padding:11px 14px;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;width:100%}
      .fi:focus{border-color:#FF6B35}
      .ab{border-radius:18px;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;margin:28px 0;gap:16px;flex-wrap:wrap}
      .ac{background:white;color:#1A1A2E;border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit}
      .es{text-align:center;padding:60px 20px;color:#9CA3AF}
      .pt{display:flex;border:2px solid #E5E7EB;border-radius:10px;overflow:hidden;margin-bottom:10px}
      .pt button{flex:1;padding:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
      .pa{background:#FF6B35;color:white}
      .pi{background:white;color:#6B7280}
      .ipg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
      .ipi{position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden}
      .ipi img{width:100%;height:100%;object-fit:cover}
      .irb{position:absolute;top:3px;right:3px;background:rgba(0,0,0,.6);color:white;border:none;border-radius:50%;width:22px;height:22px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;line-height:1}
      .irb:hover{background:rgba(220,38,38,.85)}
      @media(max-width:600px){.mg{grid-template-columns:repeat(2,1fr)!important}}
    `),

    /* NAVBAR */
    React.createElement("nav", { style:{ position:"sticky",top:0,zIndex:300,background:scrolled?"#1A1A2E":"linear-gradient(135deg,#1A0A2E,#2D1B6B)",boxShadow:scrolled?"0 4px 20px rgba(0,0,0,.25)":"none",transition:"all .3s" } },
      React.createElement("div", { style:{ maxWidth:1200,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:10,height:66 } },
        React.createElement("div", { style:{ display:"flex",alignItems:"center",gap:10,marginRight:16,flexShrink:0,cursor:"pointer" } },
          React.createElement("div", { style:{ width:38,height:38,background:"linear-gradient(135deg,#E63946,#F4A261)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 } }, "🌵"),
          React.createElement("div", null,
            React.createElement("div", { style:{ color:"white",fontWeight:800,fontSize:16,lineHeight:1.1 } }, "Compra en Jujuy"),
            React.createElement("div", { style:{ color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:"1.5px",textTransform:"uppercase" } }, "Clasificados gratuitos")
          )
        ),
        React.createElement("div", { style:{ flex:1,maxWidth:480,background:"rgba(255,255,255,.1)",borderRadius:12,display:"flex",alignItems:"center",padding:"0 14px",height:42,border:"1px solid rgba(255,255,255,.15)" } },
          React.createElement("span", { style:{ marginRight:8,fontSize:16,opacity:.7 } }, "🔍"),
          React.createElement("input", { style:{ flex:1,border:"none",outline:"none",fontSize:15,fontFamily:"inherit",background:"transparent",color:"white" }, placeholder:"Buscar en todos los clasificados...", value:searchQuery, onChange:function(e){ setSearchQuery(e.target.value); } })
        ),
        React.createElement("div", { style:{ display:"flex",alignItems:"center",gap:4,marginLeft:"auto" } },
          user
            ? React.createElement("div", { style:{ display:"flex",alignItems:"center",gap:8 } },
                React.createElement("span", { style:{ color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:600 } }, "👤 " + user.email.split("@")[0]),
                React.createElement("button", { className:"nl", onClick:handleLogout }, "Salir")
              )
            : React.createElement(React.Fragment, null,
                React.createElement("button", { className:"nl", onClick:function(){ setAuthMode("login"); setAuthModal(true); } }, "Ingresar"),
                React.createElement("button", { className:"nl", onClick:function(){ setAuthMode("register"); setAuthModal(true); } }, "Registrarse")
              ),
          React.createElement("button", { className:"nl", style:{ display:"flex",alignItems:"center",gap:5 }, onClick:function(){ setMegaMenuOpen(!megaMenuOpen); } },
            "Categorías ", React.createElement("span", { style:{ fontSize:10,display:"inline-block",transform:megaMenuOpen?"rotate(180deg)":"none",transition:"transform .2s" } }, "▼")
          ),
          React.createElement("button", { className:"pb", onClick:function(){ setPublishModal(true); } }, "✏️ Publicar GRATIS")
        )
      ),
      megaMenuOpen && React.createElement("div", { style:{ position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:"white",borderRadius:"0 0 20px 20px",boxShadow:"0 20px 60px rgba(0,0,0,.15)",zIndex:200,padding:28 } },
        React.createElement("div", { className:"mg", style:{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20 } },
          categories.map(function(cat) {
            return React.createElement("div", { key:cat.id, onClick:function(){ setActiveCategory(cat.id); setMegaMenuOpen(false); } },
              React.createElement("div", { style:{ display:"flex",alignItems:"center",gap:8,marginBottom:10,cursor:"pointer" } },
                React.createElement("span", { style:{ fontSize:18 } }, cat.icon),
                React.createElement("div", null,
                  React.createElement("div", { style:{ fontWeight:700,fontSize:14,color:"#1A1A2E" } }, cat.label),
                  React.createElement("div", { style:{ fontSize:11,color:"#9CA3AF" } }, formatCount(catCounts[cat.id]) + " anuncios")
                )
              ),
              cat.subs.map(function(sub) {
                return React.createElement("div", { key:sub, style:{ fontSize:12,color:"#6B7280",padding:"3px 0 3px 26px",cursor:"pointer" },
                  onMouseEnter:function(e){ e.target.style.color="#FF6B35"; },
                  onMouseLeave:function(e){ e.target.style.color="#6B7280"; } }, sub);
              })
            );
          })
        )
      )
    ),

    /* HERO */
    React.createElement("div", { style:{ background:"linear-gradient(135deg,#1A0A2E 0%,#3D1A6B 40%,#6B2D1A 70%,#1A0A2E 100%)",padding:"52px 20px 60px",position:"relative",overflow:"hidden" } },
      React.createElement("div", { style:{ position:"absolute",bottom:0,left:0,right:0,height:8,background:"linear-gradient(90deg,#E63946,#F4A261,#F7D060,#8BC34A,#2EC4B6,#4A90D9,#9B5DE5)",opacity:.9 } }),
      React.createElement("div", { style:{ position:"absolute",bottom:8,left:0,right:0,height:4,background:"linear-gradient(90deg,#F4A261,#E63946,#F7D060,#2EC4B6,#8BC34A,#9B5DE5,#4A90D9)",opacity:.5 } }),
      React.createElement("div", { style:{ position:"absolute",bottom:24,left:20,fontSize:64,opacity:.12 } }, "🌵"),
      React.createElement("div", { style:{ position:"absolute",bottom:24,right:20,fontSize:72,opacity:.12 } }, "🌵"),
      React.createElement("div", { style:{ maxWidth:1200,margin:"0 auto",textAlign:"center" } },
        React.createElement("div", { style:{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(244,162,97,.2)",border:"1px solid rgba(244,162,97,.4)",borderRadius:20,padding:"6px 16px",marginBottom:18 } },
          React.createElement("span", { style:{ color:"#F4A261",fontSize:12,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase" } }, "🟢 Clasificados gratuitos de Jujuy")
        ),
        React.createElement("div", { style:{ marginBottom:16 } },
          React.createElement("div", { style:{ display:"inline-flex",alignItems:"flex-end",gap:3,height:48 } },
            ["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map(function(color,i) {
              return React.createElement("div", { key:i, style:{ width:18,height:(28+Math.sin((i/6)*Math.PI)*20)+"px",background:color,borderRadius:"4px 4px 0 0",opacity:.85 } });
            })
          )
        ),
        React.createElement("h1", { style:{ color:"white",fontSize:"clamp(28px,5vw,52px)",fontWeight:900,lineHeight:1.15,letterSpacing:"-1px",marginBottom:14 } },
          "Compra y vendé en", React.createElement("br"),
          React.createElement("span", { style:{ background:"linear-gradient(90deg,#E63946,#F4A261,#F7D060,#8BC34A,#2EC4B6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" } }, "Jujuy 🌵")
        ),
        React.createElement("p", { style:{ color:"rgba(255,255,255,.65)",fontSize:"clamp(13px,2vw,16px)",maxWidth:500,margin:"0 auto 32px" } },
          "Clasificados gratuitos para toda la provincia. Publicá en segundos, llegá a miles."
        ),
        React.createElement("div", { style:{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" } },
          React.createElement("button", { className:"pb", style:{ padding:"14px 32px",fontSize:15,borderRadius:14,background:"linear-gradient(135deg,#E63946,#F4A261)",boxShadow:"0 8px 24px rgba(230,57,70,.4)" }, onClick:function(){ setPublishModal(true); } }, "✏️ Publicar GRATIS"),
          React.createElement("button", { style:{ background:"rgba(255,255,255,.12)",color:"white",border:"1px solid rgba(255,255,255,.25)",padding:"14px 28px",borderRadius:14,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" } }, "🔍 Explorar todo")
        ),
        React.createElement("div", { style:{ display:"flex",justifyContent:"center",gap:"clamp(20px,5vw,60px)",flexWrap:"wrap",marginTop:40 } },
          [
            { num: totalListings===null ? "..." : totalListings.toLocaleString("es-AR"), label:"Anuncios activos" },
            { num:"Gratis", label:"Publicación" },
            { num:"100%",   label:"Jujuy" },
          ].map(function(s) {
            return React.createElement("div", { key:s.label, style:{ textAlign:"center" } },
              React.createElement("div", { style:{ fontSize:28,fontWeight:800,color:"white" } }, s.num),
              React.createElement("div", { style:{ fontSize:11,color:"rgba(255,255,255,.75)",fontWeight:500,marginTop:2 } }, s.label)
            );
          })
        )
      )
    ),

    /* CONTENIDO PRINCIPAL */
    React.createElement("div", { style:{ maxWidth:1200,margin:"0 auto",padding:"0 20px" } },
      React.createElement(AdBanner, { slot:adSlots.banner_top }),

      /* CATEGORÍAS */
      React.createElement("div", { style:{ marginBottom:36 } },
        React.createElement(SectionTitle, { title:"Explorar por categoría", sub:"Encontrá exactamente lo que buscás" }),
        React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:12 } },
          categories.map(function(cat) {
            return React.createElement("div", { key:cat.id, className:"cp",
              style:{ borderColor:activeCategory===cat.id?cat.color:"transparent", background:activeCategory===cat.id?(cat.color+"18"):"white" },
              onClick:function(){ setActiveCategory(activeCategory===cat.id?null:cat.id); } },
              React.createElement("div", { style:{ fontSize:28,lineHeight:1 } }, cat.icon),
              React.createElement("div", { style:{ fontSize:11,fontWeight:700,color:"#1A1A2E",textAlign:"center",lineHeight:1.3 } }, cat.label),
              React.createElement("div", { style:{ fontSize:10,color:"#9CA3AF" } }, formatCount(catCounts[cat.id]))
            );
          })
        ),
        activeCategory && React.createElement("div", { style:{ marginTop:16,background:"white",borderRadius:16,padding:"18px 20px",border:"1px solid #F0EDE8" } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:700,color:"#6B7280",marginBottom:12,textTransform:"uppercase",letterSpacing:".8px" } },
            "Subcategorías de " + ((categories.find(function(c){ return c.id===activeCategory; })||{}).label||"")
          ),
          React.createElement("div", { style:{ display:"flex",flexWrap:"wrap",gap:8 } },
            ((categories.find(function(c){ return c.id===activeCategory; })||{}).subs||[]).map(function(sub) {
              return React.createElement("span", { key:sub, style:{ background:"#F3F4F6",color:"#374151",padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" },
                onMouseEnter:function(e){ e.target.style.background="#FF6B35"; e.target.style.color="white"; },
                onMouseLeave:function(e){ e.target.style.background="#F3F4F6"; e.target.style.color="#374151"; } }, sub);
            })
          )
        )
      ),

      /* MÁS VISTOS */
      topListings.length > 0 && React.createElement("div", { style:{ marginBottom:36 } },
        React.createElement(SectionTitle, { title:"🔥 Más vistos", sub:"Ordenados por tráfico real", link:"Ver todos →" }),
        React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20 } },
          topListings.map(function(l) { return React.createElement(ListingCard, { key:l.id, listing:l }); })
        )
      ),

      React.createElement(AdBanner, { slot:adSlots.banner_mid }),

      /* ÚLTIMOS PUBLICADOS */
      React.createElement("div", { style:{ marginBottom:36 } },
        React.createElement(SectionTitle, { title:"🕐 Últimos Publicados", sub:"Actualizados en tiempo real", link:"Ver más →" }),
        React.createElement("div", { style:{ display:"flex",gap:8,marginBottom:18,flexWrap:"wrap" } },
          React.createElement("button", { className:"tb " + (activeTab==="Todos"?"ta":"ti"), onClick:function(){ setActiveTab("Todos"); } }, "Todos"),
          categories.map(function(c) {
            return React.createElement("button", { key:c.id, className:"tb " + (activeTab===c.id?"ta":"ti"), onClick:function(){ setActiveTab(c.id); } }, c.label);
          })
        ),
        loading
          ? React.createElement("div", { className:"es" }, React.createElement("div", { style:{ fontSize:40,marginBottom:12 } }, "⏳"), React.createElement("div", { style:{ fontWeight:600 } }, "Cargando anuncios..."))
          : filteredRecent.length === 0
            ? React.createElement("div", { className:"es" },
                React.createElement("div", { style:{ fontSize:40,marginBottom:12 } }, "📭"),
                React.createElement("div", { style:{ fontWeight:600,marginBottom:8 } }, searchQuery ? ("Sin resultados para \"" + searchQuery + "\"") : "Todavía no hay anuncios publicados"),
                React.createElement("button", { className:"pb", style:{ marginTop:16 }, onClick:function(){ setPublishModal(true); } }, "✏️ Sé el primero en publicar")
              )
            : React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12 } },
                filteredRecent.map(function(l) {
                  const cat = categories.find(function(c){ return c.id===l.category_id; });
                  const img = l.listing_images && l.listing_images[0] && l.listing_images[0].url;
                  return React.createElement("div", { key:l.id, className:"rc" },
                    React.createElement("div", { style:{ width:60,height:60,background:"linear-gradient(135deg,#FFF7ED,#FFEDD5)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,overflow:"hidden" } },
                      img ? React.createElement("img", { src:img, style:{ width:"100%",height:"100%",objectFit:"cover" } }) : (cat ? cat.icon : "📦")
                    ),
                    React.createElement("div", { style:{ flex:1,minWidth:0 } },
                      React.createElement("div", { style:{ fontSize:13,fontWeight:700,color:"#1A1A2E",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" } }, l.title),
                      React.createElement("div", { style:{ fontSize:15,fontWeight:900,color:"#FF6B35" } }, l.price_label||"Consultar"),
                      React.createElement("div", { style:{ display:"flex",gap:8,marginTop:4 } },
                        React.createElement("span", { style:{ fontSize:10,color:"#9CA3AF",background:"#F3F4F6",padding:"2px 7px",borderRadius:5,fontWeight:600 } },
                          (cat?cat.label:l.category_id) + (l.subcategory?" › "+l.subcategory:"")
                        ),
                        React.createElement("span", { style:{ fontSize:10,color:"#9CA3AF" } }, "🕐 " + timeAgo(l.created_at))
                      )
                    ),
                    React.createElement("div", { style:{ fontSize:18,color:"#D1D5DB" } }, "›")
                  );
                })
              )
      ),

      /* CONSEJOS DE SEGURIDAD */
      React.createElement("div", { style:{ marginBottom:36 } },
        React.createElement("div", { style:{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 } },
          React.createElement("div", null,
            React.createElement("div", { style:{ fontSize:22,fontWeight:800,color:"#1A1A2E" } }, "🛡️ Consejos de Seguridad"),
            React.createElement("div", { style:{ fontSize:13,color:"#9CA3AF",marginTop:2 } }, "Leé esto antes de comprar o vender")
          ),
          React.createElement("button", { onClick:function(){ setSecurityModal(true); }, style:{ background:"#1A1A2E",color:"white",border:"none",padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" } }, "Ver todo →")
        ),
        React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 } },
          securityTips.map(function(tip,i) {
            return React.createElement("div", { key:i, style:{ background:tip.bg,border:"1px solid "+tip.border,borderRadius:16,padding:"18px 20px" } },
              React.createElement("div", { style:{ fontWeight:700,fontSize:13,color:tip.color,marginBottom:12 } }, tip.titulo),
              React.createElement("ul", { style:{ paddingLeft:16,margin:0 } },
                tip.items.slice(0,2).map(function(item,j) {
                  return React.createElement("li", { key:j, style:{ fontSize:12,color:tip.color,marginBottom:6,lineHeight:1.5 } }, item);
                }),
                tip.items.length > 2 && React.createElement("li", { style:{ fontSize:12,color:tip.color,opacity:.6 } }, "y " + (tip.items.length-2) + " más...")
              )
            );
          })
        )
      ),

      React.createElement(AdBanner, { slot:adSlots.banner_bottom })
    ),

    /* FOOTER */
    React.createElement("footer", { style:{ background:"#1A0A2E",color:"rgba(255,255,255,.65)",padding:"40px 20px 24px" } },
      React.createElement("div", { style:{ maxWidth:1200,margin:"0 auto" } },
        React.createElement("div", { style:{ display:"flex",flexWrap:"wrap",gap:40,marginBottom:32 } },
          React.createElement("div", { style:{ flex:"1 1 220px" } },
            React.createElement("div", { style:{ display:"flex",alignItems:"center",gap:10,marginBottom:14 } },
              React.createElement("div", { style:{ width:36,height:36,background:"linear-gradient(135deg,#E63946,#F4A261)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 } }, "🌵"),
              React.createElement("div", { style:{ color:"white",fontWeight:800,fontSize:15 } }, "Compra en Jujuy")
            ),
            React.createElement("p", { style:{ fontSize:12,lineHeight:1.7 } }, "Clasificados gratuitos para toda la provincia de Jujuy, Argentina."),
            React.createElement("div", { style:{ marginTop:16,display:"flex",gap:8 } },
              ["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map(function(c,i) {
                return React.createElement("div", { key:i, style:{ width:18,height:18,background:c,borderRadius:4,opacity:.8 } });
              })
            )
          ),
          [
            {title:"Publicar",links:["Publicar GRATIS","Cómo funciona","Planes destacados"]},
            {title:"Cuenta",  links:["Registrarse","Iniciar sesión","Mis anuncios"]},
            {title:"Ayuda",   links:["Consejos de Seguridad","Preguntas frecuentes","Términos y condiciones","Contacto"]},
          ].map(function(col) {
            return React.createElement("div", { key:col.title, style:{ flex:"1 1 140px" } },
              React.createElement("div", { style:{ color:"white",fontWeight:700,fontSize:13,marginBottom:14,textTransform:"uppercase",letterSpacing:".8px" } }, col.title),
              col.links.map(function(l) {
                return React.createElement("a", { key:l, href:"#", style:{ display:"block",color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12,marginBottom:8 },
                  onMouseEnter:function(e){ e.target.style.color="#F4A261"; },
                  onMouseLeave:function(e){ e.target.style.color="rgba(255,255,255,.5)"; },
                  onClick: l==="Consejos de Seguridad" ? function(e){ e.preventDefault(); setSecurityModal(true); } : undefined
                }, l);
              })
            );
          })
        ),
        React.createElement("div", { style:{ borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 } },
          React.createElement("div", { style:{ fontSize:12 } }, "© 2024–2026 Compra en Jujuy. Todos los derechos reservados."),
          React.createElement("div", { style:{ display:"flex",gap:16 } },
            ["📘 Facebook","📸 Instagram","💬 WhatsApp"].map(function(s) {
              return React.createElement("a", { key:s, href:"#", style:{ color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12 },
                onMouseEnter:function(e){ e.target.style.color="white"; },
                onMouseLeave:function(e){ e.target.style.color="rgba(255,255,255,.5)"; } }, s);
            })
          )
        )
      )
    ),

    /* BOTÓN FLOTANTE */
    React.createElement("button", { onClick:function(){ setPublishModal(true); },
      style:{ position:"fixed",bottom:28,right:28,background:"linear-gradient(135deg,#E63946,#F4A261)",color:"white",border:"none",width:60,height:60,borderRadius:"50%",fontSize:24,cursor:"pointer",boxShadow:"0 8px 24px rgba(230,57,70,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s",fontFamily:"inherit" },
      onMouseEnter:function(e){ e.currentTarget.style.transform="scale(1.1)"; },
      onMouseLeave:function(e){ e.currentTarget.style.transform="scale(1)"; } }, "✏️"),

    /* MODAL AUTH */
    authModal && React.createElement("div", { className:"mo", onClick:function(e){ if(e.target===e.currentTarget){ setAuthModal(false); setAuthMsg(""); } } },
      React.createElement("div", { className:"md", style:{ maxWidth:440 } },
        React.createElement("div", { style:{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 } },
          React.createElement("div", null,
            React.createElement("div", { style:{ fontSize:20,fontWeight:800,color:"#1A1A2E" } }, authMode==="login"?"👤 Iniciar sesión":"✨ Crear cuenta"),
            React.createElement("div", { style:{ fontSize:12,color:"#9CA3AF",marginTop:3 } }, authMode==="login"?"Ingresá con tu email y contraseña":"Registrate gratis para publicar")
          ),
          React.createElement("button", { onClick:function(){ setAuthModal(false); setAuthMsg(""); }, style:{ background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit" } }, "×")
        ),
        React.createElement("div", { style:{ display:"flex",background:"#F3F4F6",borderRadius:12,padding:4,marginBottom:24 } },
          ["login","register"].map(function(mode) {
            return React.createElement("button", { key:mode, onClick:function(){ setAuthMode(mode); setAuthMsg(""); },
              style:{ flex:1,padding:"10px",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
                background:authMode===mode?"white":"transparent", color:authMode===mode?"#1A1A2E":"#9CA3AF",
                boxShadow:authMode===mode?"0 2px 8px rgba(0,0,0,.08)":"none" } },
              mode==="login"?"Iniciar sesión":"Registrarse"
            );
          })
        ),
        React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Email"),
          React.createElement("input", { className:"fi", type:"email", placeholder:"tucorreo@gmail.com", value:authForm.email, onChange:function(e){ setAuthForm(Object.assign({},authForm,{email:e.target.value})); } })
        ),
        React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Contraseña"),
          React.createElement("input", { className:"fi", type:"password", placeholder:"Mínimo 6 caracteres", value:authForm.password, onChange:function(e){ setAuthForm(Object.assign({},authForm,{password:e.target.value})); } })
        ),
        authMode==="register" && React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Confirmar contraseña"),
          React.createElement("input", { className:"fi", type:"password", placeholder:"Repetí la contraseña", value:authForm.confirmPassword, onChange:function(e){ setAuthForm(Object.assign({},authForm,{confirmPassword:e.target.value})); } })
        ),
        authMsg && React.createElement("div", { style:{ fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center",padding:"10px",background:authMsg.startsWith("✅")?"#F0FDF4":"#FFF1F2",borderRadius:8 } }, authMsg),
        React.createElement("button", { className:"pb", style:{ width:"100%",padding:16,fontSize:15,borderRadius:12,opacity:authLoading?0.7:1 }, onClick:handleAuth, disabled:authLoading },
          authLoading?"⏳ Procesando...":authMode==="login"?"Ingresar":"Crear cuenta"
        )
      )
    ),

    /* MODAL PUBLICAR */
    publishModal && React.createElement("div", { className:"mo", onClick:function(e){ if(e.target===e.currentTarget) setPublishModal(false); } },
      React.createElement("div", { className:"md" },
        React.createElement("div", { style:{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 } },
          React.createElement("div", null,
            React.createElement("div", { style:{ fontSize:20,fontWeight:800,color:"#1A1A2E" } }, "✏️ Publicar anuncio"),
            React.createElement("div", { style:{ fontSize:12,color:"#9CA3AF",marginTop:3 } }, user?("Publicando como "+user.email):"Necesitás una cuenta para publicar")
          ),
          React.createElement("button", { onClick:function(){ setPublishModal(false); }, style:{ background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit" } }, "×")
        ),

        !user && React.createElement("div", { style:{ background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"center" } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#92400E",marginBottom:8 } }, "Necesitás iniciar sesión para publicar"),
          React.createElement("div", { style:{ display:"flex",gap:8,justifyContent:"center" } },
            React.createElement("button", { className:"pb", style:{ padding:"8px 16px",fontSize:12 }, onClick:function(){ setPublishModal(false); setAuthMode("login"); setAuthModal(true); } }, "Ingresar"),
            React.createElement("button", { style:{ background:"white",color:"#FF6B35",border:"2px solid #FF6B35",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit" },
              onClick:function(){ setPublishModal(false); setAuthMode("register"); setAuthModal(true); } }, "Registrarse gratis")
          )
        ),

        React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Categoría *"),
          React.createElement("select", { className:"fi", value:form.categoryId, onChange:function(e){ setForm(Object.assign({},form,{categoryId:e.target.value,subcategory:""})); } },
            React.createElement("option", { value:"" }, "Seleccioná una categoría..."),
            categories.map(function(c){ return React.createElement("option", { key:c.id, value:c.id }, c.icon+" "+c.label); })
          )
        ),

        form.categoryId && React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Subcategoría"),
          React.createElement("select", { className:"fi", value:form.subcategory, onChange:function(e){ setForm(Object.assign({},form,{subcategory:e.target.value})); } },
            React.createElement("option", { value:"" }, "Sin subcategoría"),
            activeCatSubs.map(function(s){ return React.createElement("option", { key:s, value:s }, s); })
          )
        ),

        React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Título *"),
          React.createElement("input", { className:"fi", placeholder:"Ej: iPhone 15 Pro 256GB – Como nuevo", value:form.title, onChange:function(e){ setForm(Object.assign({},form,{title:e.target.value})); } })
        ),

        React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:8 } }, "Precio"),
          React.createElement("div", { className:"pt" },
            React.createElement("button", { className:form.priceType==="valor"?"pa":"pi", onClick:function(){ setForm(Object.assign({},form,{priceType:"valor"})); } }, "$ Poner un valor"),
            React.createElement("button", { className:form.priceType==="consultar"?"pa":"pi", onClick:function(){ setForm(Object.assign({},form,{priceType:"consultar",price:""})); } }, "💬 Consultar")
          ),
          form.priceType==="valor" && React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"1fr auto",gap:8 } },
            React.createElement("input", { className:"fi", placeholder:"100.000", inputMode:"numeric", value:form.price, onChange:function(e){ setForm(Object.assign({},form,{price:formatPrice(e.target.value)})); } }),
            React.createElement("select", { className:"fi", style:{ width:"auto" }, value:form.currency, onChange:function(e){ setForm(Object.assign({},form,{currency:e.target.value})); } },
              React.createElement("option", { value:"ARS" }, "$ ARS"),
              React.createElement("option", { value:"USD" }, "U$S")
            )
          ),
          form.priceType==="consultar" && React.createElement("div", { style:{ background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#166534",fontWeight:600 } },
            "💬 El precio aparecerá como \"Consultar\"."
          )
        ),

        React.createElement("div", { style:{ marginBottom:18 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Descripción"),
          React.createElement("textarea", { className:"fi", rows:3, placeholder:"Describí tu artículo o servicio...", style:{ resize:"vertical" }, value:form.description, onChange:function(e){ setForm(Object.assign({},form,{description:e.target.value})); } })
        ),

        React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18 } },
          React.createElement("div", null,
            React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Ubicación"),
            React.createElement("input", { className:"fi", placeholder:"San Salvador de Jujuy", value:form.location, onChange:function(e){ setForm(Object.assign({},form,{location:e.target.value})); } })
          ),
          React.createElement("div", null,
            React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "WhatsApp"),
            React.createElement("input", { className:"fi", placeholder:"3884123456", inputMode:"numeric", value:form.contact, onChange:function(e){ setForm(Object.assign({},form,{contact:e.target.value.replace(/\D/g,"") })); } })
          )
        ),

        React.createElement("div", { style:{ marginBottom:24 } },
          React.createElement("div", { style:{ fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6 } }, "Fotos (" + form.files.length + "/8)"),
          React.createElement("label", { style:{ display:"block",border:"2px dashed #E5E7EB",borderRadius:12,padding:"20px",textAlign:"center",cursor:"pointer" },
            onMouseEnter:function(e){ e.currentTarget.style.borderColor="#FF6B35"; },
            onMouseLeave:function(e){ e.currentTarget.style.borderColor="#E5E7EB"; } },
            React.createElement("div", { style:{ fontSize:24,marginBottom:4 } }, "📷"),
            React.createElement("div", { style:{ fontSize:13,color:"#6B7280",fontWeight:600 } }, "Tocá para agregar fotos"),
            React.createElement("div", { style:{ fontSize:11,color:"#9CA3AF",marginTop:2 } }, "JPG, PNG · Máx. 8 · Se comprimen automáticamente"),
            React.createElement("input", { type:"file", accept:"image/*", multiple:true, style:{ display:"none" }, onChange:handleFiles })
          ),
          form.previews.length > 0 && React.createElement("div", { className:"ipg" },
            form.previews.map(function(src,idx) {
              return React.createElement("div", { key:idx, className:"ipi" },
                React.createElement("img", { src:src, alt:"foto "+(idx+1) }),
                React.createElement("button", { className:"irb", onClick:function(){ removeImage(idx); }, title:"Quitar foto" }, "×"),
                idx===0 && React.createElement("div", { style:{ position:"absolute",bottom:3,left:3,background:"rgba(0,0,0,.6)",color:"white",fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:4 } }, "PRINCIPAL")
              );
            })
          )
        ),

        publishMsg && React.createElement("div", { style:{ fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center",padding:"10px",background:publishMsg.startsWith("✅")?"#F0FDF4":"#FFF1F2",borderRadius:8 } }, publishMsg),

        React.createElement("button", { className:"pb", style:{ width:"100%",padding:16,fontSize:15,borderRadius:12,background:"linear-gradient(135deg,#E63946,#F4A261)",opacity:publishing?0.7:1 },
          onClick:handlePublish, disabled:publishing },
          publishing?"⏳ Publicando...":"🚀 Publicar anuncio GRATIS"
        )
      )
    ),

    /* MODAL CONSEJOS */
    securityModal && React.createElement("div", { className:"mo", onClick:function(e){ if(e.target===e.currentTarget) setSecurityModal(false); } },
      React.createElement("div", { className:"md", style:{ maxWidth:640 } },
        React.createElement("div", { style:{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 } },
          React.createElement("div", null,
            React.createElement("div", { style:{ fontSize:20,fontWeight:800,color:"#1A1A2E" } }, "🛡️ Consejos de Seguridad"),
            React.createElement("div", { style:{ fontSize:12,color:"#9CA3AF",marginTop:3 } }, "Leé esto antes de comprar o vender")
          ),
          React.createElement("button", { onClick:function(){ setSecurityModal(false); }, style:{ background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit" } }, "×")
        ),
        React.createElement("div", { style:{ display:"flex",flexDirection:"column",gap:16 } },
          securityTips.map(function(tip,i) {
            return React.createElement("div", { key:i, style:{ background:tip.bg,border:"1px solid "+tip.border,borderRadius:16,padding:"18px 20px" } },
              React.createElement("div", { style:{ fontWeight:700,fontSize:14,color:tip.color,marginBottom:12 } }, tip.titulo),
              React.createElement("ol", { style:{ paddingLeft:20,margin:0 } },
                tip.items.map(function(item,j) {
                  return React.createElement("li", { key:j, style:{ fontSize:13,color:tip.color,marginBottom:8,lineHeight:1.6 } }, item);
                })
              )
            );
          })
        )
      )
    )
  );
}

function ListingCard(props) {
  const l = props.listing;
  const cat = categories.find(function(c){ return c.id===l.category_id; });
  const img = l.listing_images && l.listing_images[0] && l.listing_images[0].url;
  return React.createElement("div", { className:"card" },
    React.createElement("div", { style:{ height:160,background:"linear-gradient(135deg,#FFF7ED,#FFEDD5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,position:"relative",overflow:"hidden" } },
      img ? React.createElement("img", { src:img, style:{ width:"100%",height:"100%",objectFit:"cover" } }) : React.createElement("span", null, cat?cat.icon:"📦"),
      React.createElement("span", { style:{ position:"absolute",top:10,left:10,background:"#FF6B35",color:"white",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6 } }, "🔥 " + l.views + " visitas"),
      cat && React.createElement("span", { style:{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,.55)",color:"white",fontSize:10,fontWeight:600,padding:"4px 8px",borderRadius:6 } }, cat.label)
    ),
    React.createElement("div", { style:{ padding:"14px 16px" } },
      React.createElement("div", { style:{ fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:6,lineHeight:1.35 } }, l.title),
      React.createElement("div", { style:{ fontSize:18,fontWeight:900,color:"#FF6B35",marginBottom:10 } }, l.price_label||"Consultar"),
      React.createElement("div", { style:{ display:"flex",justifyContent:"space-between" } },
        React.createElement("span", { style:{ fontSize:11,color:"#9CA3AF" } }, "📍 " + (l.location||"Jujuy")),
        React.createElement("span", { style:{ fontSize:11,color:"#9CA3AF" } }, "🕐 " + timeAgo(l.created_at))
      )
    )
  );
}

function AdBanner(props) {
  const slot = props.slot;
  if (!slot) return null;
  return React.createElement("div", { className:"ab", style:{ background:slot.bg_color||"linear-gradient(135deg,#7C3AED,#4338CA)" } },
    React.createElement("div", { style:{ display:"flex",alignItems:"center",gap:16 } },
      slot.image_url
        ? React.createElement("img", { src:slot.image_url, style:{ height:50,borderRadius:8,objectFit:"cover" } })
        : React.createElement("div", { style:{ fontSize:36 } }, "🎯"),
      React.createElement("div", null,
        React.createElement("div", { style:{ color:"white",fontWeight:700,fontSize:16 } }, slot.title||"Espacio publicitario"),
        React.createElement("div", { style:{ color:"rgba(255,255,255,.65)",fontSize:12,marginTop:2 } }, "Publicidad · Administrado desde Supabase")
      )
    ),
    React.createElement("a", { href:slot.link_url||"#", target:"_blank", rel:"noopener noreferrer" },
      React.createElement("button", { className:"ac" }, "Ver más →")
    )
  );
}

function SectionTitle(props) {
  return React.createElement("div", { style:{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:props.sub?4:22 } },
    React.createElement("div", null,
      React.createElement("div", { style:{ fontSize:22,fontWeight:800,color:"#1A1A2E" } }, props.title),
      props.sub && React.createElement("div", { style:{ fontSize:13,color:"#9CA3AF",marginBottom:22 } }, props.sub)
    ),
    props.link && React.createElement("a", { href:"#", style:{ fontSize:13,color:"#FF6B35",fontWeight:600,textDecoration:"none",marginTop:4,whiteSpace:"nowrap" } }, props.link)
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
