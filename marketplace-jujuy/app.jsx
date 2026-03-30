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
  { titulo:"Si vas a COMPRAR, desconfiá del vendedor cuando insiste en:", color:"#92400E", bg:"#FFFBEB", border:"#F59E0B",
    items:["Pedirte el adelanto del pago del producto o del valor del envío.","Informarte una ubicación distinta a la que aparece en su anuncio.","Ofrecer promociones sumamente llamativas y/o precios sospechosamente bajos.","Ofrecer precios bajos siendo que el vendedor es nuevo en el sitio."] },
  { titulo:"Si vas a VENDER, desconfiá de un comprador cuando insiste en:", color:"#065F46", bg:"#F0FDF4", border:"#10B981",
    items:["Abonarte a través de Western Union, Paypal, Moneygram u otros medios electrónicos.","Abonarte con moneda extranjera. Realizá la transacción en un banco para verificar la autenticidad.","Abonarte con cheques. Corroborá con tu banco si tiene fondos antes de enviar el producto.","Ofrecerte una seña via transferencia bancaria cuando en realidad te enviará una solicitud desde tu cuenta.","Ofrecerte comprobante falso por un monto mayor, exigiéndote la devolución de la diferencia.","Recibir el producto antes de pagar por él."] },
  { titulo:"En general tené en cuenta:", color:"#1E3A5F", bg:"#EFF6FF", border:"#3B82F6",
    items:["En lo posible realizá la transacción en persona y en lugar seguro.","Nunca envíes información personal: datos bancarios, número de tarjeta, etc.","Si un anuncio te resulta sospechoso, reportalo con el link 'Denunciar este anuncio'."] },
];

const defaultAdSlots = {
  banner_top:    { title:"¡Publicá tu negocio aquí!", link_url:"#", bg_color:"linear-gradient(135deg,#7C3AED,#4338CA)" },
  banner_mid:    { title:"Contactanos para publicitar tu negocio", link_url:"#", bg_color:"linear-gradient(135deg,#F97316,#DC2626)" },
  banner_bottom: { title:"Alcanzá miles de compradores en Jujuy", link_url:"#", bg_color:"linear-gradient(135deg,#0F766E,#0369A1)" },
};

function timeAgo(d) {
  const s = Math.floor((Date.now()-new Date(d))/1000);
  if(s<60) return s+"s"; if(s<3600) return Math.floor(s/60)+"min";
  if(s<86400) return Math.floor(s/3600)+"h"; return Math.floor(s/86400)+"d";
}
function fmtCount(n) { if(!n&&n!==0) return "..."; if(n>=1000) return (n/1000).toFixed(1)+"k"; return String(n); }
function fmtPrice(v) { return v.replace(/\D/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,"."); }
function getCat(id) { return categories.find(function(c){return c.id===id;}); }

// ─── App ─────────────────────────────────────────────────────
function App() {
  const [currentView,   setCurrentView]   = useState("home"); 
  const [currentListing,setCurrentListing]= useState(null); 
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [search,        setSearch]        = useState("");
  const [activeCat,     setActiveCat]     = useState(null);
  const [activeSubcat,  setActiveSubcat]  = useState(null);
  const [catListings,   setCatListings]   = useState([]);
  const [catLoading,    setCatLoading]    = useState(false);
  const [megaOpen,      setMegaOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [activeTab,     setActiveTab]     = useState("Todos");
  
  const [publishModal,  setPublishModal]  = useState(false);
  const [authModal,     setAuthModal]     = useState(false);
  const [authMode,      setAuthMode]      = useState("login");
  const [secModal,      setSecModal]      = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null); // ✅ ESTADO CORREGIDO
  
  const [myListings,    setMyListings]    = useState([]);
  const [myLoading,     setMyLoading]     = useState(false);

  const [user,        setUser]        = useState(null);
  const [authForm,    setAuthForm]    = useState({email:"",password:"",confirm:""});
  const [authMsg,     setAuthMsg]     = useState("");
  const [authBusy,    setAuthBusy]    = useState(false);

  const [total,    setTotal]    = useState(null);
  const [counts,   setCounts]   = useState({});
  const [recent,   setRecent]   = useState([]);
  const [top,      setTop]      = useState([]);
  const [ads,      setAds]      = useState(defaultAdSlots);
  const [loading,  setLoading]  = useState(true);

  const [form,    setForm]    = useState({title:"",desc:"",price:"",ptype:"valor",cur:"ARS",cat:"",sub:"",loc:"",phone:"",files:[],previews:[]});
  const [pubBusy, setPubBusy] = useState(false);
  const [pubMsg,  setPubMsg]  = useState("");

  useEffect(function(){
    window.addEventListener("scroll",function(){ setScrolled(window.scrollY>60); });

    const handleRoute = async (currentUser) => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);

      if (path.startsWith('/publicacion/')) {
        const id = path.split('/')[2];
        if (id) {
          const r = await db.from("listings").select("*,listing_images(url)").eq("id", id).single();
          if (r.data) {
            setCurrentListing(r.data);
            setCurrentView("listing");
            setActiveImageIdx(0);
            db.from("listings").update({views:(r.data.views||0)+1}).eq("id",id).then();
            window.scrollTo(0,0);
          }
        }
      } 
      else if (path === '/perfil') {
        if (currentUser) {
          setCurrentView("profile");
          setMyLoading(true);
          const r = await db.from("listings").select("*,listing_images(url)").eq("user_id", currentUser.id).order("created_at",{ascending:false});
          setMyListings(r.data||[]);
          setMyLoading(false);
          window.scrollTo(0,0);
        } else {
          window.history.replaceState({}, '', '/');
          setCurrentView("home");
          setAuthMode("login");
          setAuthModal(true);
        }
      } 
      else if (path === '/busqueda') {
        const q = params.get('q') || "";
        setSearch(q);
        setCurrentView("search");
        window.scrollTo(0,0);
      } 
      else {
        setCurrentView("home");
        setCurrentListing(null);
        setSearch("");
        window.scrollTo(0,0);
      }
    };

    db.auth.getUser().then(function(r){ 
      const currentUser = r.data && r.data.user ? r.data.user : null;
      setUser(currentUser); 
      handleRoute(currentUser);
    });

    db.auth.onAuthStateChange(function(_,session){ setUser(session?session.user:null); });
    loadData();

    window.addEventListener('popstate', function() {
      db.auth.getUser().then(r => handleRoute(r.data?.user));
    });
  },[]);

  async function loadData(){
    try{
      const t = await db.from("listings").select("*",{count:"exact",head:true}).eq("status","active");
      setTotal(t.count||0);
      const c={};
      await Promise.all(categories.map(async function(cat){
        const r=await db.from("listings").select("*",{count:"exact",head:true}).eq("status","active").eq("category_id",cat.id);
        c[cat.id]=r.count||0;
      }));
      setCounts(c);
      const tp=await db.from("listings").select("*,listing_images(url)").eq("status","active").order("views",{ascending:false}).limit(6);
      setTop(tp.data||[]);
      const rc=await db.from("listings").select("*,listing_images(url)").eq("status","active").order("created_at",{ascending:false}).limit(12);
      setRecent(rc.data||[]);
      const ad=await db.from("ad_slots").select("*").eq("active",true);
      if(ad.data&&ad.data.length){
        const s=ad.data.reduce(function(a,x){a[x.slot_id]=x;return a;},{});
        setAds(function(p){return Object.assign({},p,s);});
      }
    }catch(e){console.error(e);}
    setLoading(false);
  }

  function goHome(e) {
    if(e) e.preventDefault();
    setSearch("");
    setCurrentView("home");
    window.history.pushState({}, '', '/');
    window.scrollTo(0,0);
  }

async function openListing(l, isDirectLoad = false){
    setCurrentListing(l);
    setCurrentView("listing");
    setActiveImageIdx(0); // <-- NUEVO: Reinicia a la foto 1
    if (!isDirectLoad) { window.history.pushState({}, '', `/publicacion/${l.id}`); }
    window.scrollTo(0,0);
    try{ await db.from("listings").update({views:(l.views||0)+1}).eq("id",l.id); }catch(e){}
  }

  async function openProfile(){
    if(!user) return;
    setCurrentView("profile");
    window.history.pushState({}, '', '/perfil');
    window.scrollTo(0,0);
    setMyLoading(true);
    try{
      const r=await db.from("listings").select("*,listing_images(url)").eq("user_id",user.id).order("created_at",{ascending:false});
      setMyListings(r.data||[]);
    }catch(e){console.error(e);}
    setMyLoading(false);
  }

  // ── Seleccionar categoría → cargar sus listings ──────────
// ── Seleccionar categoría → cargar sus anuncios ──────────
  async function selectCat(id){
    if(activeCat===id){ setActiveCat(null); setActiveSubcat(null); setCatListings([]); return; }
    setActiveCat(id); setActiveSubcat(null); setCatListings([]); setCatLoading(true);
    
    if(currentView !== "home"){ goHome(); }

    // Scroll automático
    setTimeout(function() {
      const el = document.getElementById("seccion-categorias");
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80; 
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    }, 50);

    try{
      const r=await db.from("listings").select("*,listing_images(url)").eq("status","active").eq("category_id",id).order("created_at",{ascending:false}).limit(20);
      setCatListings(r.data||[]);
    }catch(e){console.error(e);}
    setCatLoading(false);
  }

  // ── Seleccionar SUBCATEGORÍA → filtrar listado ──────────
  async function selectSubcat(sub){
    // Si toca la que ya está activa, la deselecciona
    const newSub = activeSubcat === sub ? null : sub;
    setActiveSubcat(newSub);
    setCatListings([]); setCatLoading(true);
    try{
      let query = db.from("listings").select("*,listing_images(url)").eq("status","active").eq("category_id",activeCat);
      
      // Filtro de base de datos
      if (newSub) {
        query = query.eq("subcategory", newSub);
      }
      
      const r = await query.order("created_at",{ascending:false}).limit(20);
      setCatListings(r.data||[]);
    }catch(e){console.error(e);}
    setCatLoading(false);
  }

  async function pauseListing(id,current){
    const ns=current==="active"?"paused":"active";
    await db.from("listings").update({status:ns}).eq("id",id);
    setMyListings(function(p){return p.map(function(l){return l.id===id?Object.assign({},l,{status:ns}):l;});});
  }

  // ✅ NUEVA LÓGICA DE ELIMINACIÓN
  // ✅ NUEVA LÓGICA DE ELIMINACIÓN CORREGIDA
  async function confirmDelete(){
    if(!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    
    try {
      // 1. Mandamos la orden a Supabase y esperamos confirmación
      const { error } = await db.from("listings").delete().eq("id", id);
      if (error) throw error;
      
      // 2. Solo si no hubo error, lo quitamos de la pantalla del perfil
      setMyListings(function(p){return p.filter(function(l){return l.id!==id;});});
      
      // 3. Recargamos los datos globales (Inicio) para que desaparezca de ahí también
      await loadData(); 
      
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Hubo un error al eliminar el anuncio. Revisa la consola.");
    }
  }

  function handleFiles(e){
    const nf=Array.from(e.target.files);
    const combined=form.files.concat(nf).slice(0,8);
    setForm(Object.assign({},form,{files:combined,previews:combined.map(function(f){return URL.createObjectURL(f);})}));
  }
  function removeImg(i){
    const f=form.files.filter(function(_,j){return j!==i;});
    setForm(Object.assign({},form,{files:f,previews:f.map(function(x){return URL.createObjectURL(x);})}));
  }

  async function handleAuth(e){
    e.preventDefault(); setAuthMsg(""); setAuthBusy(true);
    if(!authForm.email||!authForm.password){setAuthMsg("❌ Completá todos los campos");setAuthBusy(false);return;}
    try{
      if(authMode==="register"){
        if(authForm.password!==authForm.confirm){setAuthMsg("❌ Las contraseñas no coinciden");setAuthBusy(false);return;}
        if(authForm.password.length<6){setAuthMsg("❌ Mínimo 6 caracteres");setAuthBusy(false);return;}
        const r=await db.auth.signUp({email:authForm.email,password:authForm.password});
        if(r.error)throw r.error;
        setAuthMsg("✅ ¡Registrado! Revisá tu email para confirmar.");
      }else{
        const r=await db.auth.signInWithPassword({email:authForm.email,password:authForm.password});
        if(r.error)throw r.error;
        setAuthMsg("✅ ¡Bienvenido!");
        setTimeout(function(){setAuthModal(false);setAuthMsg("");setAuthForm({email:"",password:"",confirm:""});},900);
      }
    }catch(err){
      setAuthMsg("❌ "+(err.message&&err.message.includes("Invalid login")?"Email o contraseña incorrectos":err.message||"Error"));
    }
    setAuthBusy(false);
  }
  
  async function handleLogout(){ 
    await db.auth.signOut(); 
    if(currentView === "profile") goHome();
  }

  async function handlePublish(e){
    e.preventDefault();
    if(!user){setPublishModal(false);setAuthModal(true);setAuthMode("login");return;}
    if(!form.title || !form.cat || !form.phone){
      setPubMsg("❌ Completá el título, la categoría y el teléfono");
      return;
    }
    setPubBusy(true);setPubMsg("");
    
    try{
      const raw=form.price.replace(/\./g,"");
      const label=form.ptype==="consultar"?"Consultar":(raw?(( form.cur==="USD"?"U$S":"$")+" "+form.price):"Consultar");
      
      let uploadedImagesData = [];
      if(form.files.length && typeof uploadImage === "function"){
        uploadedImagesData = await Promise.all(form.files.map(async function(file, i){
          const r = await uploadImage(file);
          return { url: r.url, r2_key: r.key, position: i };
        }));
      }

      const ins=await db.from("listings").insert({
        title:form.title,description:form.desc,
        price:form.ptype==="consultar"?null:(parseFloat(raw)||null),
        currency:form.cur,price_label:label,
        category_id:form.cat,subcategory:form.sub||null,
        location:form.loc,contact_phone:form.phone,
        user_id:user.id,status:"active",
      }).select().single();
      if(ins.error)throw ins.error;

      if(uploadedImagesData.length > 0){
        const imgsToInsert = uploadedImagesData.map(function(img){
          return { listing_id: ins.data.id, url: img.url, r2_key: img.r2_key, position: img.position };
        });
        await db.from("listing_images").insert(imgsToInsert);
      }

      setPubMsg("✅ ¡Publicado con éxito!");
      setForm({title:"",desc:"",price:"",ptype:"valor",cur:"ARS",cat:"",sub:"",loc:"",phone:"",files:[],previews:[]});
      await loadData();
      
      setTimeout(async function(){
        setPublishModal(false); setPubMsg("");
        const r = await db.from("listings").select("*,listing_images(url)").eq("id", ins.data.id).single();
        if(r.data) openListing(r.data);
      },1500);
      
    }catch(err){setPubMsg("❌ "+(err.message||"Error"));}
    setPubBusy(false);
  }

  const filtered=recent.filter(function(l){
    return (!search||l.title.toLowerCase().includes(search.toLowerCase()))&&(activeTab==="Todos"||l.category_id===activeTab);
  });
  const searchResults=recent.filter(function(l){
    return search && l.title.toLowerCase().includes(search.toLowerCase());
  });
  
  const catSubs=(getCat(form.cat)||{}).subs||[];
  const activeCatData=getCat(activeCat);

  return React.createElement("div",{style:{fontFamily:"'Sora','Nunito',sans-serif",background:"#F8F7F4",minHeight:"100vh",color:"#1A1A2E",display:"flex",flexDirection:"column"}},
    React.createElement("style",null,`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#FF6B35;border-radius:3px}
      .nl{color:white;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;background:none;border:none;font-family:inherit;transition:background .2s}
      .nl:hover{background:rgba(255,255,255,.18)}
      .cp{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;background:white;border-radius:16px;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);border:2px solid transparent;box-shadow:0 2px 8px rgba(0,0,0,.06)}
      .cp:hover{transform:translateY(-5px) scale(1.04);box-shadow:0 12px 28px rgba(0,0,0,.12)}
      .card{background:white;border-radius:16px;overflow:hidden;cursor:pointer;transition:all .25s;box-shadow:0 2px 10px rgba(0,0,0,.06);border:1px solid #F0EDE8;display:flex;flex-direction:column}
      .card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(0,0,0,.12)}
      .rc{display:flex;gap:12px;align-items:center;background:white;border-radius:12px;padding:12px;cursor:pointer;transition:all .2s;border:1px solid #F0EDE8}
      .rc:hover{transform:translateX(4px);box-shadow:0 6px 20px rgba(0,0,0,.09)}
      .pb{background:#FF6B35;color:white;border:none;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit}
      .pb:hover{background:#E55520;transform:translateY(-1px);box-shadow:0 6px 16px rgba(255,107,53,.4)}
      .tb{padding:8px 18px;border-radius:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
      .ta{background:#1A1A2E;color:white} .ti{background:white;color:#6B7280;border:1px solid #E5E7EB}
      .ti:hover{border-color:#FF6B35;color:#FF6B35}
      .ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
      .md{background:white;border-radius:24px;width:90%;max-width:520px;padding:32px;max-height:90vh;overflow-y:auto}
      .fi{border:2px solid #E5E7EB;border-radius:10px;padding:11px 14px;font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color .2s}
      .fi:focus{border-color:#FF6B35}
      .ab{border-radius:18px;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;margin:28px 0;gap:16px;flex-wrap:wrap}
      .ac{background:white;color:#1A1A2E;border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
      .es{text-align:center;padding:60px 20px;color:#9CA3AF}
      .pt{display:flex;border:2px solid #E5E7EB;border-radius:10px;overflow:hidden;margin-bottom:10px}
      .pt button{flex:1;padding:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
      .pa{background:#FF6B35;color:white} .pi{background:white;color:#6B7280}
      .ipg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
      .ipi{position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden}
      .ipi img{width:100%;height:100%;object-fit:cover}
      .irb{position:absolute;top:3px;right:3px;background:rgba(0,0,0,.6);color:white;border:none;border-radius:50%;width:22px;height:22px;font-size:14px;cursor:pointer;font-family:inherit}
      .irb:hover{background:rgba(220,38,38,.85)}
      .tag{font-size:10px;padding:3px 8px;border-radius:6px;font-weight:700}
      
      .page-container { flex: 1; max-width: 1200px; margin: 0 auto; padding: 40px 20px; width: 100%; }
      .listing-grid { display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
      @media(max-width: 900px){ .listing-grid { grid-template-columns: 1fr; } }
      @media(max-width: 600px){ .mg { grid-template-columns: repeat(2,1fr)!important; } }
    `),

    React.createElement("nav",{style:{position:"sticky",top:0,zIndex:300,background:scrolled?"#1A1A2E":"linear-gradient(135deg,#1A0A2E,#2D1B6B)",boxShadow:scrolled?"0 4px 20px rgba(0,0,0,.25)":"none",transition:"all .3s"}},
      React.createElement("div",{style:{maxWidth:1200,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:10,height:66}},
        React.createElement("div",{onClick:goHome, style:{display:"flex",alignItems:"center",gap:10,marginRight:16,flexShrink:0,cursor:"pointer"}},
          React.createElement("div",{style:{width:38,height:38,background:"linear-gradient(135deg,#E63946,#F4A261)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},"🌵"),
          React.createElement("div",{style:{display:window.innerWidth<600?"none":"block"}},
            React.createElement("div",{style:{color:"white",fontWeight:800,fontSize:16,lineHeight:1.1}},"Compra en Jujuy"),
            React.createElement("div",{style:{color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:"1.5px",textTransform:"uppercase"}},"Clasificados")
          )
        ),
        React.createElement("div",{style:{flex:1,maxWidth:480,background:"rgba(255,255,255,.1)",borderRadius:12,display:"flex",alignItems:"center",padding:"0 14px",height:42,border:"1px solid rgba(255,255,255,.15)"}},
          React.createElement("span",{style:{marginRight:8,fontSize:16,opacity:.7}},"🔍"),
          React.createElement("input",{
            style:{flex:1,border:"none",outline:"none",fontSize:15,fontFamily:"inherit",background:"transparent",color:"white"},
            placeholder:"Buscar clasificados...",
            value:search,
            onChange:function(e){
              const val = e.target.value;
              setSearch(val);
              if (val.trim() !== "") {
                window.history.replaceState({}, '', '/busqueda?q=' + encodeURIComponent(val));
                setCurrentView("search");
              } else {
                window.history.pushState({}, '', '/');
                setCurrentView("home");
              }
            }
          })
        ),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}},
          user
            ? React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                React.createElement("button",{className:"nl",onClick:openProfile,style:{display:"flex",alignItems:"center",gap:6,background:currentView==="profile"?"rgba(255,255,255,.18)":"transparent"}},
                  React.createElement("span",null,"👤"),
                  React.createElement("span",null,user.email.split("@")[0])
                ),
                React.createElement("button",{className:"nl",onClick:handleLogout},"Salir")
              )
            : React.createElement(React.Fragment,null,
                React.createElement("button",{className:"nl",onClick:function(){setAuthMode("login");setAuthModal(true);}},"Ingresar"),
                React.createElement("button",{className:"nl",onClick:function(){setAuthMode("register");setAuthModal(true);}},"Registrarse")
              ),
          React.createElement("button",{className:"nl",style:{display:"flex",alignItems:"center",gap:5},onClick:function(){setMegaOpen(!megaOpen);}},"Categorías ",React.createElement("span",{style:{fontSize:10,display:"inline-block",transform:megaOpen?"rotate(180deg)":"none",transition:"transform .2s"}},"▼")),
          React.createElement("button",{className:"pb",onClick:function(){setPublishModal(true);}},"✏️ Publicar")
        )
      ),
      megaOpen && React.createElement("div",{style:{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:"white",borderRadius:"0 0 20px 20px",boxShadow:"0 20px 60px rgba(0,0,0,.15)",zIndex:200,padding:28}},
        React.createElement("div",{className:"mg",style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,maxWidth:1200,margin:"0 auto"}},
          categories.map(function(cat){
            return React.createElement("div",{key:cat.id,onClick:function(){selectCat(cat.id);setMegaOpen(false);}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10,cursor:"pointer"}},
                React.createElement("span",{style:{fontSize:18}},cat.icon),
                React.createElement("div",null,
                  React.createElement("div",{style:{fontWeight:700,fontSize:14,color:"#1A1A2E"}},cat.label),
                  React.createElement("div",{style:{fontSize:11,color:"#9CA3AF"}},fmtCount(counts[cat.id])+" anuncios")
                )
              ),
              cat.subs.map(function(s){return React.createElement("div",{key:s,style:{fontSize:12,color:"#6B7280",padding:"3px 0 3px 26px",cursor:"pointer"},onMouseEnter:function(e){e.target.style.color="#FF6B35";},onMouseLeave:function(e){e.target.style.color="#6B7280";}},s);})
            );
          })
        )
      )
    ),

    currentView === "home" && React.createElement(React.Fragment, null,
      React.createElement("div",{style:{background:"linear-gradient(135deg,#1A0A2E 0%,#3D1A6B 40%,#6B2D1A 70%,#1A0A2E 100%)",padding:"52px 20px 60px",position:"relative",overflow:"hidden"}},
        React.createElement("div",{style:{position:"absolute",bottom:0,left:0,right:0,height:8,background:"linear-gradient(90deg,#E63946,#F4A261,#F7D060,#8BC34A,#2EC4B6,#4A90D9,#9B5DE5)",opacity:.9}}),
        React.createElement("div",{style:{position:"absolute",bottom:8,left:0,right:0,height:4,background:"linear-gradient(90deg,#F4A261,#E63946,#F7D060,#2EC4B6,#8BC34A,#9B5DE5,#4A90D9)",opacity:.5}}),
        React.createElement("div",{style:{position:"absolute",bottom:24,left:20,fontSize:64,opacity:.12}},"🌵"),
        React.createElement("div",{style:{position:"absolute",bottom:24,right:20,fontSize:72,opacity:.12}},"🌵"),
        React.createElement("div",{style:{maxWidth:1200,margin:"0 auto",textAlign:"center"}},
          React.createElement("div",{style:{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(244,162,97,.2)",border:"1px solid rgba(244,162,97,.4)",borderRadius:20,padding:"6px 16px",marginBottom:18}},
            React.createElement("span",{style:{color:"#F4A261",fontSize:12,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}},"🟢 Clasificados gratuitos de Jujuy")
          ),
          React.createElement("h1",{style:{color:"white",fontSize:"clamp(28px,5vw,52px)",fontWeight:900,lineHeight:1.15,letterSpacing:"-1px",marginBottom:14}},
            "Compra y vendé en",React.createElement("br"),
            React.createElement("span",{style:{background:"linear-gradient(90deg,#E63946,#F4A261,#F7D060,#8BC34A,#2EC4B6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}},"Jujuy 🌵")
          ),
          React.createElement("p",{style:{color:"rgba(255,255,255,.65)",fontSize:"clamp(13px,2vw,16px)",maxWidth:500,margin:"0 auto 32px"}},"Clasificados gratuitos para toda la provincia. Publicá en segundos, llegá a miles."),
          React.createElement("div",{style:{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}},
            React.createElement("button",{className:"pb",style:{padding:"14px 32px",fontSize:15,borderRadius:14,background:"linear-gradient(135deg,#E63946,#F4A261)",boxShadow:"0 8px 24px rgba(230,57,70,.4)"},onClick:function(){setPublishModal(true);}},"✏️ Publicar GRATIS")
          )
        )
      ),
      React.createElement("div",{style:{maxWidth:1200,margin:"0 auto",padding:"0 20px", width:"100%"}},
        React.createElement(AdBanner,{slot:ads.banner_top}),
        
// CATEGORÍAS
      React.createElement("div",{id:"seccion-categorias", style:{marginBottom:36}},
        React.createElement(SecTitle,{title:"Explorar por categoría",sub:"Seleccioná una para ver sus anuncios"}),          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:12}},
            categories.map(function(cat){
              return React.createElement("div",{key:cat.id,className:"cp",
                style:{borderColor:activeCat===cat.id?cat.color:"transparent",background:activeCat===cat.id?(cat.color+"18"):"white"},
                onClick:function(){selectCat(cat.id);}},
                React.createElement("div",{style:{fontSize:28,lineHeight:1}},cat.icon),
                React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"#1A1A2E",textAlign:"center",lineHeight:1.3}},cat.label),
                React.createElement("div",{style:{fontSize:10,color:"#9CA3AF"}},fmtCount(counts[cat.id]))
              );
            })
          ),
          activeCat && React.createElement("div",{style:{marginTop:16,background:"white",borderRadius:16,border:"1px solid #F0EDE8",overflow:"hidden"}},
            React.createElement("div",{style:{padding:"16px 20px",borderBottom:"1px solid #F0EDE8",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},
                React.createElement("span",{style:{fontSize:24}},(activeCatData||{}).icon||""),
                React.createElement("div",null,
                  React.createElement("div",{style:{fontWeight:800,fontSize:16,color:"#1A1A2E"}},(activeCatData||{}).label||""),
                  React.createElement("div",{style:{fontSize:12,color:"#9CA3AF"}},fmtCount(counts[activeCat])+" anuncios")
                )
              ),
              React.createElement("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
                ((activeCatData||{}).subs||[]).map(function(s){
                const isActive = activeSubcat === s;
                return React.createElement("span",{
                  key: s,
                  onClick: function() { selectSubcat(s); },
                  style: {
                    background: isActive ? "#FF6B35" : "#F3F4F6",
                    color: isActive ? "white" : "#374151",
                    padding: "5px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .2s"
                  },
                  onMouseEnter: function(e){ if(!isActive){ e.target.style.background="#FF6B35"; e.target.style.color="white"; } },
                  onMouseLeave: function(e){ if(!isActive){ e.target.style.background="#F3F4F6"; e.target.style.color="#374151"; } }
                }, s);
              })
              )
            ),
            catLoading ? React.createElement("div",{className:"es"},"⏳ Cargando...") : 
            catListings.length===0 ? React.createElement("div",{className:"es"},"📭 No hay anuncios") :
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:0}},
              catListings.map(function(l){
                const img=l.listing_images&&l.listing_images[0]&&l.listing_images[0].url;
                return React.createElement("div",{key:l.id, style:{display:"flex",gap:12,alignItems:"center",padding:"14px 20px",borderBottom:"1px solid #F0EDE8",cursor:"pointer"}, onClick:function(){openListing(l);}},
                  React.createElement("div",{style:{width:52,height:52,borderRadius:10,overflow:"hidden",background:"#FFF7ED",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}},
                    img?React.createElement("img",{src:img,style:{width:"100%",height:"100%",objectFit:"cover"}}):(activeCatData||{}).icon||"📦"
                  ),
                  React.createElement("div",{style:{flex:1,minWidth:0}},
                    React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#1A1A2E",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},(l.title||"")),
                    React.createElement("div",{style:{fontSize:14,fontWeight:900,color:"#FF6B35"}},(l.price_label||"Consultar"))
                  )
                );
              })
            )
          )
        ),

        top.length>0 && React.createElement("div",{style:{marginBottom:36}},
          React.createElement(SecTitle,{title:"🔥 Más vistos",sub:"Ordenados por tráfico real"}),
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}},
            top.map(function(l){return React.createElement(ListingCard,{key:l.id,listing:l,onOpen:openListing});})
          )
        ),

        React.createElement(AdBanner,{slot:ads.banner_mid}),

        React.createElement("div",{style:{marginBottom:36}},
          React.createElement(SecTitle,{title:"🕐 Últimos Publicados",sub:"Actualizados en tiempo real"}),
          React.createElement("div",{style:{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}},
            React.createElement("button",{className:"tb "+(activeTab==="Todos"?"ta":"ti"),onClick:function(){setActiveTab("Todos");}},"Todos"),
            categories.map(function(c){return React.createElement("button",{key:c.id,className:"tb "+(activeTab===c.id?"ta":"ti"),onClick:function(){setActiveTab(c.id);}},c.label);})
          ),
          loading ? React.createElement("div",{className:"es"},"⏳ Cargando...") :
          filtered.length===0 ? React.createElement("div",{className:"es"},"📭 No hay anuncios") :
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}},
            filtered.map(function(l){
              const cat=getCat(l.category_id);
              const img=l.listing_images&&l.listing_images[0]&&l.listing_images[0].url;
              return React.createElement("div",{key:l.id,className:"rc",onClick:function(){openListing(l);}},
                React.createElement("div",{style:{width:60,height:60,background:"#FFF7ED",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,overflow:"hidden"}},
                  img?React.createElement("img",{src:img,style:{width:"100%",height:"100%",objectFit:"cover"}}):(cat?cat.icon:"📦")
                ),
                React.createElement("div",{style:{flex:1,minWidth:0}},
                  React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"#1A1A2E",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},l.title),
                  React.createElement("div",{style:{fontSize:15,fontWeight:900,color:"#FF6B35"}},l.price_label||"Consultar"),
                  React.createElement("div",{style:{display:"flex",gap:8,marginTop:4}},
                    React.createElement("span",{style:{fontSize:10,color:"#9CA3AF",background:"#F3F4F6",padding:"2px 7px",borderRadius:5,fontWeight:600}},(cat?cat.label:l.category_id)),
                    React.createElement("span",{style:{fontSize:10,color:"#9CA3AF"}},"🕐 "+timeAgo(l.created_at))
                  )
                )
              );
            })
          )
        ),
        React.createElement(AdBanner,{slot:ads.banner_bottom})
      )
    ),

// =======================================================================
    // ── VISTA 2: PUBLICACIÓN A PÁGINA COMPLETA ─────────────────────────────
    // =======================================================================
    currentView === "listing" && currentListing && React.createElement("div", {className:"page-container"},
      // Migas de pan (Breadcrumbs)
      React.createElement("div", {style:{marginBottom:20, fontSize:13, fontWeight:600}},
        React.createElement("a", {href:"#", onClick:goHome, style:{color:"#6B7280", textDecoration:"none"}}, "Inicio"),
        React.createElement("span", {style:{color:"#D1D5DB", margin:"0 8px"}}, "/"),
        React.createElement("span", {style:{color:"#FF6B35"}}, (getCat(currentListing.category_id)||{}).label||currentListing.category_id),
        // ✅ CORRECCIÓN 1: Mostrar la subcategoría si existe
        currentListing.subcategory && React.createElement(React.Fragment, null,
          React.createElement("span", {style:{color:"#D1D5DB", margin:"0 8px"}}, "/"),
          React.createElement("span", {style:{color:"#FF6B35"}}, currentListing.subcategory)
        )
      ),
      React.createElement("div", {className: "listing-grid"},
        // Izquierda: Fotos (GALERÍA)
        React.createElement("div", null, 
          currentListing.listing_images && currentListing.listing_images.length > 0 ?
            React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:12}},
              // Imagen Principal
              React.createElement("div", {style:{borderRadius:20, overflow:"hidden", background:"white", border:"1px solid #F0EDE8", aspectRatio:"4/3", display:"flex", alignItems:"center", justifyContent:"center"}},
                React.createElement("img", {src:currentListing.listing_images[activeImageIdx || 0].url, style:{width:"100%", height:"100%", objectFit:"contain"}})
              ),
              // ✅ CORRECCIÓN 2: Miniaturas (solo aparecen si hay más de 1 imagen)
              currentListing.listing_images.length > 1 && React.createElement("div", {style:{display:"flex", gap:10, overflowX:"auto", paddingBottom:8}},
                currentListing.listing_images.map(function(img, idx){
                  return React.createElement("div", {
                    key: idx,
                    onClick: function(){setActiveImageIdx(idx);},
                    style: {
                      width:80, height:80, borderRadius:12, overflow:"hidden", cursor:"pointer", flexShrink:0,
                      border: activeImageIdx === idx ? "3px solid #FF6B35" : "1px solid #F0EDE8",
                      opacity: activeImageIdx === idx ? 1 : 0.6,
                      transition: "all .2s"
                    }
                  }, React.createElement("img", {src:img.url, style:{width:"100%", height:"100%", objectFit:"cover"}}));
                })
              )
            ) : 
            React.createElement("div", {style:{borderRadius:20, background:"#F3F4F6", aspectRatio:"4/3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:64}},
              (getCat(currentListing.category_id)||{}).icon||"📦"
            )
        ),
        // Derecha: Info
        React.createElement("div", null, 
          React.createElement("div", {style:{background:"white", padding:32, borderRadius:20, border:"1px solid #F0EDE8", boxShadow:"0 4px 20px rgba(0,0,0,.04)"}},
            React.createElement("h1", {style:{fontSize:26, fontWeight:800, color:"#1A1A2E", marginBottom:12, lineHeight:1.3}}, currentListing.title),
            React.createElement("div", {style:{fontSize:36, fontWeight:900, color:"#FF6B35", marginBottom:24}}, currentListing.price_label||"Consultar"),
            
            React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:12, marginBottom:32, paddingBottom:24, borderBottom:"1px solid #F3F4F6"}},
              currentListing.location && React.createElement("div", {style:{display:"flex", alignItems:"center", gap:10, color:"#4B5563", fontSize:14}}, React.createElement("span", {style:{fontSize:18}},"📍"), "Ubicación: " + currentListing.location),
              React.createElement("div", {style:{display:"flex", alignItems:"center", gap:10, color:"#4B5563", fontSize:14}}, React.createElement("span", {style:{fontSize:18}},"🕐"), "Publicado hace " + timeAgo(currentListing.created_at)),
              React.createElement("div", {style:{display:"flex", alignItems:"center", gap:10, color:"#4B5563", fontSize:14}}, React.createElement("span", {style:{fontSize:18}},"👁️"), currentListing.views + " personas vieron esto")
            ),
            
            currentListing.description && React.createElement("div", {style:{marginBottom:32}},
              React.createElement("h3", {style:{fontSize:16, fontWeight:800, marginBottom:12}}, "Descripción"),
              React.createElement("p", {style:{fontSize:15, color:"#4B5563", lineHeight:1.7, whiteSpace:"pre-wrap"}}, currentListing.description)
            ),

            currentListing.contact_phone && React.createElement("a", {
              href:"https://wa.me/549"+currentListing.contact_phone.replace(/\D/g,"")+"?text=Hola, vi tu anuncio '"+encodeURIComponent(currentListing.title)+"' en Compra en Jujuy",
              target:"_blank", rel:"noopener noreferrer",
              style:{display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"#25D366", color:"white", padding:"16px", borderRadius:14, fontWeight:800, fontSize:16, textDecoration:"none", transition:"transform .2s", boxShadow:"0 8px 20px rgba(37,211,102,.3)"}
            }, "💬 Contactar al vendedor")
          )
        )
      )
    ),


    currentView === "profile" && React.createElement("div", {className:"page-container", style:{maxWidth:800}},
      React.createElement("div", {style:{background:"white", borderRadius:20, padding:32, border:"1px solid #F0EDE8", marginBottom:24, display:"flex", alignItems:"center", gap:20}},
        React.createElement("div", {style:{width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#E63946,#F4A261)", color:"white", fontSize:32, display:"flex", alignItems:"center", justifyContent:"center"}}, "👤"),
        React.createElement("div", null,
          React.createElement("h1", {style:{fontSize:24, fontWeight:800, color:"#1A1A2E"}}, "Mi Perfil"),
          React.createElement("div", {style:{fontSize:15, color:"#6B7280", marginTop:4}}, user && user.email)
        )
      ),
      React.createElement("div", {style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}},
        React.createElement("h2", {style:{fontSize:20, fontWeight:800}}, "Mis Publicaciones"),
        React.createElement("button", {className:"pb", onClick:function(){setPublishModal(true);}}, "✏️ Nuevo Anuncio")
      ),
      myLoading ? React.createElement("div", {className:"es"}, "⏳ Cargando...") :
      myListings.length===0 ? React.createElement("div", {className:"es"}, "📭 No tienes publicaciones") :
      React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:12}},
        myListings.map(function(l){
          const img=l.listing_images&&l.listing_images[0]&&l.listing_images[0].url;
          const cat=getCat(l.category_id);
          return React.createElement("div", {key:l.id, style:{display:"flex", gap:16, alignItems:"center", background:"white", borderRadius:16, padding:16, border:"1px solid #F0EDE8", boxShadow:"0 2px 8px rgba(0,0,0,.03)"}},
            React.createElement("div", {style:{width:70, height:70, borderRadius:12, overflow:"hidden", background:"#FFF7ED", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0}},
              img?React.createElement("img",{src:img,style:{width:"100%",height:"100%",objectFit:"cover"}}):(cat?cat.icon:"📦")
            ),
            React.createElement("div", {style:{flex:1, minWidth:0}},
              React.createElement("div", {style:{fontSize:15, fontWeight:800, color:"#1A1A2E", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:4}}, l.title),
              React.createElement("div", {style:{fontSize:16, fontWeight:900, color:"#FF6B35", marginBottom:6}}, l.price_label||"Consultar"),
              React.createElement("div", {style:{display:"flex", gap:10, alignItems:"center"}},
                React.createElement("span", {style:{fontSize:11, padding:"3px 8px", borderRadius:6, fontWeight:700, background:l.status==="active"?"#DCFCE7":"#F3F4F6", color:l.status==="active"?"#166534":"#6B7280"}}, l.status==="active"?"✅ Activo":"⏸ Pausado"),
                React.createElement("span", {style:{fontSize:12, color:"#9CA3AF", fontWeight:600}}, "👁️ "+l.views+" visitas")
              )
            ),
            React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:8, flexShrink:0}},
              React.createElement("button",{onClick:function(){pauseListing(l.id,l.status);}, style:{background:"#F3F4F6",border:"none",padding:"8px 12px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}, l.status==="active"?"⏸ Pausar":"▶️ Activar"),
              // Llama al modal de eliminar
              React.createElement("button",{onClick:function(){setDeleteTarget(l.id);}, style:{background:"#FEE2E2",border:"none",padding:"8px 12px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",color:"#DC2626",fontFamily:"inherit"}}, "🗑️ Eliminar")
            )
          );
        })
      )
    ),

    currentView === "search" && React.createElement("div", {className:"page-container"},
      React.createElement("div", {style:{marginBottom:32}},
        React.createElement("h1", {style:{fontSize:28, fontWeight:800, color:"#1A1A2E"}}, 'Resultados para "', React.createElement("span", {style:{color:"#FF6B35"}}, search), '"'),
        React.createElement("div", {style:{fontSize:14, color:"#6B7280", marginTop:8}}, searchResults.length + " clasificados encontrados")
      ),
      searchResults.length === 0 ? 
        React.createElement("div", {className:"es", style:{background:"white", borderRadius:20, padding:60}}, "📭 No encontramos nada que coincida con tu búsqueda. Intenta con otras palabras.") :
        React.createElement("div", {style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}},
          searchResults.map(function(l){return React.createElement(ListingCard,{key:l.id,listing:l,onOpen:openListing});})
        )
    ),

    // ── FOOTER
    React.createElement("footer",{style:{background:"#1A0A2E",color:"rgba(255,255,255,.65)",padding:"40px 20px 24px", marginTop:"auto"}},
      React.createElement("div",{style:{maxWidth:1200,margin:"0 auto"}},
        React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:40,marginBottom:32}},
          React.createElement("div",{style:{flex:"1 1 220px"}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14}},
              React.createElement("div",{style:{width:36,height:36,background:"linear-gradient(135deg,#E63946,#F4A261)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}},"🌵"),
              React.createElement("div",{style:{color:"white",fontWeight:800,fontSize:15}},"Compra en Jujuy")
            ),
            React.createElement("p",{style:{fontSize:12,lineHeight:1.7}},"Clasificados gratuitos para toda la provincia de Jujuy, Argentina."),
            React.createElement("div",{style:{marginTop:16,display:"flex",gap:8}},
              ["#E63946","#F4A261","#F7D060","#8BC34A","#2EC4B6","#4A90D9","#9B5DE5"].map(function(c,i){return React.createElement("div",{key:i,style:{width:18,height:18,background:c,borderRadius:4,opacity:.8}});})
            )
          ),
          [{title:"Publicar",links:["Publicar GRATIS"]},{title:"Cuenta",links:["Mi Perfil"]},{title:"Ayuda",links:["Consejos de Seguridad"]}].map(function(col){
            return React.createElement("div",{key:col.title,style:{flex:"1 1 140px"}},
              React.createElement("div",{style:{color:"white",fontWeight:700,fontSize:13,marginBottom:14,textTransform:"uppercase",letterSpacing:".8px"}},col.title),
              col.links.map(function(l){
                return React.createElement("a",{key:l,href:"#",style:{display:"block",color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12,marginBottom:8},
                  onMouseEnter:function(e){e.target.style.color="#F4A261";},
                  onMouseLeave:function(e){e.target.style.color="rgba(255,255,255,.5)";},
                  onClick:l==="Consejos de Seguridad"?function(e){e.preventDefault();setSecModal(true);}:l==="Mi Perfil"?function(e){e.preventDefault();openProfile();}:function(e){e.preventDefault();setPublishModal(true);}},l);
              })
            );
          })
        ),
        React.createElement("div",{style:{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}},
          React.createElement("div",{style:{fontSize:12}},"© 2024–2026 Compra en Jujuy. Todos los derechos reservados.")
        )
      )
    ),

    (currentView === "home" || currentView === "search") && React.createElement("button",{onClick:function(){setPublishModal(true);},
      style:{position:"fixed",bottom:28,right:28,background:"linear-gradient(135deg,#E63946,#F4A261)",color:"white",border:"none",width:60,height:60,borderRadius:"50%",fontSize:24,cursor:"pointer",boxShadow:"0 8px 24px rgba(230,57,70,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}
    },"✏️"),

    // ── MODALES ───────────────────────────────────────────────────────────
    
    // Modal Confirmar Eliminación ✅
    deleteTarget && React.createElement("div",{className:"ov",onClick:function(e){if(e.target===e.currentTarget)setDeleteTarget(null);}},
      React.createElement("div",{className:"md",style:{maxWidth:400,textAlign:"center",padding:"40px 32px"}},
        React.createElement("div",{style:{fontSize:48,marginBottom:16}},"🗑️"),
        React.createElement("h3",{style:{fontSize:20,fontWeight:800,color:"#1A1A2E",marginBottom:12}},"¿Eliminar anuncio?"),
        React.createElement("p",{style:{fontSize:14,color:"#6B7280",marginBottom:24,lineHeight:1.6}},"Esta acción no se puede deshacer. Tu clasificado será borrado permanentemente de la plataforma."),
        React.createElement("div",{style:{display:"flex",gap:12,justifyContent:"center"}},
          React.createElement("button",{onClick:function(){setDeleteTarget(null);},
            style:{flex:1,background:"#F3F4F6",color:"#4B5563",border:"none",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}},
            "Cancelar"
          ),
          React.createElement("button",{onClick:confirmDelete,
            style:{flex:1,background:"#EF4444",color:"white",border:"none",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 16px rgba(239,68,68,.25)",transition:"transform .2s"}},
            "Sí, eliminar"
          )
        )
      )
    ),

    authModal && React.createElement("div",{className:"ov",onClick:function(e){if(e.target===e.currentTarget){setAuthModal(false);setAuthMsg("");}}},
      React.createElement("div",{className:"md",style:{maxWidth:440}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#1A1A2E"}},authMode==="login"?"👤 Iniciar sesión":"✨ Crear cuenta"),
            React.createElement("div",{style:{fontSize:12,color:"#9CA3AF",marginTop:3}},authMode==="login"?"Ingresá con tu email y contraseña":"Registrate gratis para publicar")
          ),
          React.createElement("button",{onClick:function(){setAuthModal(false);setAuthMsg("");},style:{background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit"}},"×")
        ),
        React.createElement("div",{style:{display:"flex",background:"#F3F4F6",borderRadius:12,padding:4,marginBottom:24}},
          ["login","register"].map(function(m){
            return React.createElement("button",{key:m,onClick:function(){setAuthMode(m);setAuthMsg("");},
              style:{flex:1,padding:"10px",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                background:authMode===m?"white":"transparent",color:authMode===m?"#1A1A2E":"#9CA3AF",
                boxShadow:authMode===m?"0 2px 8px rgba(0,0,0,.08)":"none"}},
              m==="login"?"Iniciar sesión":"Registrarse"
            );
          })
        ),
        ["Email","Contraseña",authMode==="register"?"Confirmar contraseña":null].filter(Boolean).map(function(label){
          const key=label==="Email"?"email":label==="Contraseña"?"password":"confirm";
          const type=key==="email"?"email":"password";
          return React.createElement("div",{key:label,style:{marginBottom:18}},
            React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},label),
            React.createElement("input",{className:"fi",type:type,value:authForm[key],onChange:function(e){setAuthForm(Object.assign({},authForm,{[key]:e.target.value}));}})
          );
        }),
        authMsg&&React.createElement("div",{style:{fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center",padding:"10px",background:authMsg.startsWith("✅")?"#F0FDF4":"#FFF1F2",borderRadius:8}},authMsg),
        React.createElement("button",{className:"pb",style:{width:"100%",padding:16,fontSize:15,borderRadius:12,opacity:authBusy?0.7:1},onClick:handleAuth,disabled:authBusy},
          authBusy?"⏳ Procesando...":authMode==="login"?"Ingresar":"Crear cuenta"
        )
      )
    ),

    publishModal && React.createElement("div",{className:"ov",onClick:function(e){if(e.target===e.currentTarget)setPublishModal(false);}},
      React.createElement("div",{className:"md"},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#1A1A2E"}},"✏️ Publicar anuncio"),
            React.createElement("div",{style:{fontSize:12,color:"#9CA3AF",marginTop:3}},user?("Publicando como "+user.email):"Necesitás una cuenta para publicar")
          ),
          React.createElement("button",{onClick:function(){setPublishModal(false);},style:{background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit"}},"×")
        ),
        !user&&React.createElement("div",{style:{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"center"}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#92400E",marginBottom:8}},"Necesitás iniciar sesión para publicar"),
          React.createElement("div",{style:{display:"flex",gap:8,justifyContent:"center"}},
            React.createElement("button",{className:"pb",style:{padding:"8px 16px",fontSize:12},onClick:function(){setPublishModal(false);setAuthMode("login");setAuthModal(true);}},"Ingresar"),
            React.createElement("button",{style:{background:"white",color:"#FF6B35",border:"2px solid #FF6B35",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},onClick:function(){setPublishModal(false);setAuthMode("register");setAuthModal(true);}},"Registrarse gratis")
          )
        ),
        React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},"Categoría *"),
          React.createElement("select",{className:"fi",value:form.cat,onChange:function(e){setForm(Object.assign({},form,{cat:e.target.value,sub:""}))}},
            React.createElement("option",{value:""},"Seleccioná una categoría..."),
            categories.map(function(c){return React.createElement("option",{key:c.id,value:c.id},c.icon+" "+c.label);})
          )
        ),
        form.cat&&React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},"Subcategoría"),
          React.createElement("select",{className:"fi",value:form.sub,onChange:function(e){setForm(Object.assign({},form,{sub:e.target.value}));}},
            React.createElement("option",{value:""},"Sin subcategoría"),
            catSubs.map(function(s){return React.createElement("option",{key:s,value:s},s);})
          )
        ),
        React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},"Título *"),
          React.createElement("input",{className:"fi",placeholder:"Ej: iPhone 15 Pro",value:form.title,onChange:function(e){setForm(Object.assign({},form,{title:e.target.value}));}})
        ),
        React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:8}},"Precio"),
          React.createElement("div",{className:"pt"},
            React.createElement("button",{className:form.ptype==="valor"?"pa":"pi",onClick:function(){setForm(Object.assign({},form,{ptype:"valor"}));}},"$ Poner un valor"),
            React.createElement("button",{className:form.ptype==="consultar"?"pa":"pi",onClick:function(){setForm(Object.assign({},form,{ptype:"consultar",price:""}));}},"💬 Consultar")
          ),
          form.ptype==="valor"&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr auto",gap:8}},
            React.createElement("input",{className:"fi",placeholder:"100.000",inputMode:"numeric",value:form.price,onChange:function(e){setForm(Object.assign({},form,{price:fmtPrice(e.target.value)}));}}),
            React.createElement("select",{className:"fi",style:{width:"auto"},value:form.cur,onChange:function(e){setForm(Object.assign({},form,{cur:e.target.value}));}},
              React.createElement("option",{value:"ARS"},"$ ARS"),
              React.createElement("option",{value:"USD"},"U$S")
            )
          )
        ),
        React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},"Descripción"),
          React.createElement("textarea",{className:"fi",rows:3,placeholder:"Describí tu artículo...",style:{resize:"vertical"},value:form.desc,onChange:function(e){setForm(Object.assign({},form,{desc:e.target.value}));}})
        ),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},"Ubicación"),
            React.createElement("input",{className:"fi",placeholder:"Ciudad",value:form.loc,onChange:function(e){setForm(Object.assign({},form,{loc:e.target.value}));}})
          ),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},"WhatsApp *"),
            React.createElement("input",{className:"fi",placeholder:"388...",inputMode:"numeric",value:form.phone,onChange:function(e){setForm(Object.assign({},form,{phone:e.target.value.replace(/\D/g,"")}));}})
          )
        ),
        React.createElement("div",{style:{marginBottom:24}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#6B7280",marginBottom:6}},"Fotos ("+form.files.length+"/8)"),
          React.createElement("label",{style:{display:"block",border:"2px dashed #E5E7EB",borderRadius:12,padding:"20px",textAlign:"center",cursor:"pointer"}},
            React.createElement("div",{style:{fontSize:24,marginBottom:4}},"📷"),
            React.createElement("div",{style:{fontSize:13,color:"#6B7280",fontWeight:600}},"Agregar fotos"),
            React.createElement("input",{type:"file",accept:"image/*",multiple:true,style:{display:"none"},onChange:handleFiles})
          ),
          form.previews.length>0&&React.createElement("div",{className:"ipg"},
            form.previews.map(function(src,idx){
              return React.createElement("div",{key:idx,className:"ipi"},
                React.createElement("img",{src:src,alt:"foto"}),
                React.createElement("button",{className:"irb",onClick:function(){removeImg(idx);}},  "×")
              );
            })
          )
        ),
        pubMsg&&React.createElement("div",{style:{fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center",padding:"10px",background:pubMsg.startsWith("✅")?"#F0FDF4":"#FFF1F2",borderRadius:8}},pubMsg),
        React.createElement("button",{className:"pb",style:{width:"100%",padding:16,fontSize:15,borderRadius:12,opacity:pubBusy?0.7:1},onClick:handlePublish,disabled:pubBusy},
          pubBusy?"⏳ Publicando...":"🚀 Publicar anuncio"
        )
      )
    ),

    secModal&&React.createElement("div",{className:"ov",onClick:function(e){if(e.target===e.currentTarget)setSecModal(false);}},
      React.createElement("div",{className:"md",style:{maxWidth:640}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"#1A1A2E"}},"🛡️ Consejos de Seguridad"),
            React.createElement("div",{style:{fontSize:12,color:"#9CA3AF",marginTop:3}},"Leé esto antes de comprar o vender")
          ),
          React.createElement("button",{onClick:function(){setSecModal(false);},style:{background:"#F3F4F6",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit"}},"×")
        ),
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:16}},
          securityTips.map(function(tip,i){
            return React.createElement("div",{key:i,style:{background:tip.bg,border:"1px solid "+tip.border,borderRadius:16,padding:"18px 20px"}},
              React.createElement("div",{style:{fontWeight:700,fontSize:14,color:tip.color,marginBottom:12}},tip.titulo),
              React.createElement("ol",{style:{paddingLeft:20,margin:0}},
                tip.items.map(function(item,j){return React.createElement("li",{key:j,style:{fontSize:13,color:tip.color,marginBottom:8,lineHeight:1.6}},item);})
              )
            );
          })
        )
      )
    )
  );
}

function ListingCard(props){
  const l=props.listing, cat=getCat(l.category_id), img=l.listing_images&&l.listing_images[0]&&l.listing_images[0].url;
  return React.createElement("div",{className:"card",onClick:function(){if(props.onOpen)props.onOpen(l);}},
    React.createElement("div",{style:{height:160,background:"#FFF7ED",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,position:"relative",overflow:"hidden"}},
      img?React.createElement("img",{src:img,style:{width:"100%",height:"100%",objectFit:"cover"}}):React.createElement("span",null,cat?cat.icon:"📦"),
      React.createElement("span",{style:{position:"absolute",top:10,left:10,background:"#FF6B35",color:"white",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6}},"🔥 "+(l.views||0)+" visitas"),
      cat&&React.createElement("span",{style:{position:"absolute",top:10,right:10,background:"rgba(0,0,0,.55)",color:"white",fontSize:10,fontWeight:600,padding:"4px 8px",borderRadius:6}},cat.label)
    ),
    React.createElement("div",{style:{padding:"14px 16px", flex:1, display:"flex", flexDirection:"column"}},
      React.createElement("div",{style:{fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:6,lineHeight:1.35}},l.title),
      React.createElement("div",{style:{fontSize:18,fontWeight:900,color:"#FF6B35",marginBottom:10, marginTop:"auto"}},l.price_label||"Consultar"),
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between"}},
        React.createElement("span",{style:{fontSize:11,color:"#9CA3AF"}},"📍 "+(l.location||"Jujuy")),
        React.createElement("span",{style:{fontSize:11,color:"#9CA3AF"}},"🕐 "+timeAgo(l.created_at))
      )
    )
  );
}

function AdBanner(props){
  const slot=props.slot;
  if(!slot)return null;
  return React.createElement("div",{className:"ab",style:{background:slot.bg_color||"linear-gradient(135deg,#7C3AED,#4338CA)"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:16}},
      slot.image_url?React.createElement("img",{src:slot.image_url,style:{height:50,borderRadius:8,objectFit:"cover"}}):React.createElement("div",{style:{fontSize:36}},"🎯"),
      React.createElement("div",null,
        React.createElement("div",{style:{color:"white",fontWeight:700,fontSize:16}},slot.title||"Espacio publicitario"),
        React.createElement("div",{style:{color:"rgba(255,255,255,.65)",fontSize:12,marginTop:2}},"Publicidad · Administrado desde Supabase")
      )
    ),
    React.createElement("a",{href:slot.link_url||"#",target:"_blank",rel:"noopener noreferrer"},
      React.createElement("button",{className:"ac"},"Ver más →")
    )
  );
}

function SecTitle(props){
  return React.createElement("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:props.sub?4:22}},
    React.createElement("div",null,
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"#1A1A2E"}},props.title),
      props.sub&&React.createElement("div",{style:{fontSize:13,color:"#9CA3AF",marginBottom:22}},props.sub)
    ),
    props.link&&React.createElement("a",{href:"#",style:{fontSize:13,color:"#FF6B35",fontWeight:600,textDecoration:"none",marginTop:4,whiteSpace:"nowrap"}},props.link)
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));