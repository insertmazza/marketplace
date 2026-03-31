const { useState, useEffect } = React;

const categories = [
  { id:"vehiculos",    label:"Vehículos",   icon:"🚗", image:"./assets/vehiculos.jpeg",   subs:["Autos","Camionetas / SUV","Motos","Camiones","Náutica","Planes de Ahorro"] },
  { id:"inmuebles",    label:"Inmuebles",   icon:"🏠", image:"./assets/inmuebles.jpg",   subs:["Casas","Departamentos","Terrenos / Lotes","Locales","Campos / Quintas","Galpones"] },
  { id:"servicios",    label:"Servicios",   icon:"🔧", image:"./assets/servicios.jpg",   subs:["Mantenimiento Hogar","Profesionales","Eventos","Transporte","Capacitaciones","Técnicos"] },
  { id:"electronicos", label:"Electrónica", icon:"📱", image:"./assets/electronica.jpg", subs:["Celulares","Computación","Audio / Video","Cámaras","Consolas","Accesorios"] },
  { id:"hogar",        label:"Hogar",       icon:"🛋️", image:"./assets/hogar.jpg",       subs:["Muebles","Jardín","Decoración","Electrodomésticos","Herramientas","Arte"] },
  { id:"ropa",         label:"Ropa & Moda", icon:"👗", image:"./assets/ropaymoda.jpg",   subs:["Ropa Mujer","Ropa Hombre","Zapatillas","Joyas","Relojes","Accesorios"] },
  { id:"deportes",     label:"Deportes",    icon:"⚽", image:"./assets/deportes.jpg",    subs:["Fútbol","Ciclismo","Fitness","Camping","Natación","Artes Marciales","Volley","Básquet","Pesca","Caza"] },
  { id:"mascotas",     label:"Mascotas",    icon:"🐾", image:"./assets/mascotas.jpg",    subs:["Acuarios","Accesorios para mascotas","Alimentos para mascotas"] },
];

const securityTips = [
  { titulo:"Si vas a COMPRAR, desconfiá del vendedor cuando insiste en:", color:"var(--color-text-main)", bg:"var(--color-surface)", border:"var(--color-border)", items:["Pedirte el adelanto del pago del producto o del valor del envío.","Informarte una ubicación distinta a la que aparece en su anuncio.","Ofrecer promociones sumamente llamativas y/o precios sospechosamente bajos.","Ofrecer precios bajos siendo que el vendedor es nuevo en el sitio."] },
  { titulo:"Si vas a VENDER, desconfiá de un comprador cuando insiste en:", color:"var(--color-text-main)", bg:"var(--color-surface)", border:"var(--color-border)", items:["Abonarte a través de Western Union, Paypal, Moneygram u otros medios electrónicos.","Abonarte con moneda extranjera. Realizá la transacción en un banco para verificar la autenticidad.","Abonarte con cheques. Corroborá con tu banco si tiene fondos antes de enviar el producto.","Ofrecerte una seña via transferencia bancaria cuando en realidad te enviará una solicitud desde tu cuenta.","Ofrecerte comprobante falso por un monto mayor, exigiéndote la devolución de la diferencia.","Recibir el producto antes de pagar por él."] },
  { titulo:"En general tené en cuenta:", color:"var(--color-text-main)", bg:"var(--color-surface)", border:"var(--color-border)", items:["En lo posible realizá la transacción en persona y en lugar seguro.","Nunca envíes información personal: datos bancarios, número de tarjeta, etc.","Si un anuncio te resulta sospechoso, reportalo con el link 'Denunciar este anuncio'."] },
];

const defaultAdSlots = {
  banner_top:    { title:"¡Publicá tu negocio aquí!", link_url:"#", bg_color:"var(--color-surface-banner)" },
  banner_mid:    { title:"Contactanos para publicitar tu negocio", link_url:"#", bg_color:"var(--color-surface-banner)" },
  banner_bottom: { title:"Alcanzá miles de compradores en Jujuy", link_url:"#", bg_color:"var(--color-surface-banner)" },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters,          setFilters]          = useState({});
  const [scrolled,      setScrolled]      = useState(false);
  const [activeTab,     setActiveTab]     = useState("Todos");
  
  const [authModal,     setAuthModal]     = useState(false);
  const [authMode,      setAuthMode]      = useState("login");
  const [secModal,      setSecModal]      = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  
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

  // ✅ ESTADO DEL FORMULARIO DE PUBLICACIÓN (Expandido con campos dinámicos)
  const [form, setForm] = useState({
    title:"",desc:"",price:"",ptype:"valor",cur:"ARS",cat:"",sub:"",loc:"",phone:"",files:[],previews:[],
    condicion:"", km:"", anio:"", puertas:"", cilindrada:"", modalidad:"", parte:"", formato:"", dormitorios:"", ambientes:"", publica:"", area:"", talle:"", genero:"", movimiento:""
  });
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
      // ✅ NUEVA RUTA: PUBLICAR
      else if (path === '/publicar') {
        if (currentUser) {
          setCurrentView("publish");
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

  // ✅ ABRIR PÁGINA DE PUBLICAR
  function openPublish(e) {
    if(e) e.preventDefault();
    if(!user) {
      setAuthMode("login");
      setAuthModal(true);
      return;
    }
    setCurrentView("publish");
    window.history.pushState({}, '', '/publicar');
    window.scrollTo(0,0);
  }

  async function openListing(l, isDirectLoad = false){
    setCurrentListing(l);
    setCurrentView("listing");
    setActiveImageIdx(0);
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

  async function selectCat(id){
    if(activeCat===id){ setActiveCat(null); setActiveSubcat(null); setFilters({}); setCatListings([]); return; }
    setActiveCat(id); setActiveSubcat(null); setFilters({}); setCatListings([]); setCatLoading(true);
    if(currentView !== "home"){ goHome(); }
    setTimeout(function() {
      const el = document.getElementById("seccion-categorias");
      if (el) { window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth'}); }
    }, 50);
    try{
      const r=await db.from("listings").select("*,listing_images(url)").eq("status","active").eq("category_id",id).order("created_at",{ascending:false}).limit(20);
      setCatListings(r.data||[]);
    }catch(e){console.error(e);}
    setCatLoading(false);
  }

  async function selectSubcat(sub){
    const newSub = activeSubcat === sub ? null : sub;
    setActiveSubcat(newSub); setFilters({}); setCatListings([]); setCatLoading(true);
    try{
      let query = db.from("listings").select("*,listing_images(url)").eq("status","active").eq("category_id",activeCat);
      if (newSub) query = query.eq("subcategory", newSub);
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

  async function confirmDelete(){
    if(!deleteTarget) return;
    const id = deleteTarget; setDeleteTarget(null);
    try {
      const { error } = await db.from("listings").delete().eq("id", id);
      if (error) throw error;
      setMyListings(function(p){return p.filter(function(l){return l.id!==id;});});
      await loadData(); 
    } catch (err) {
      console.error("Error al eliminar:", err); alert("Hubo un error al eliminar el anuncio. Revisa la consola.");
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
    if(currentView === "profile" || currentView === "publish") goHome();
  }

  async function handlePublish(e){
    e.preventDefault();
    if(!user){setAuthMode("login");setAuthModal(true);return;}
    if(!form.title || !form.cat || !form.phone){
      setPubMsg("❌ Completá el título, la categoría y el teléfono de WhatsApp"); return;
    }
    setPubBusy(true); setPubMsg("");
    
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

      // Se inyectan las nuevas variables en la base de datos
      const ins=await db.from("listings").insert({
        title:form.title,description:form.desc,
        price:form.ptype==="consultar"?null:(parseFloat(raw)||null),
        currency:form.cur,price_label:label,
        category_id:form.cat,subcategory:form.sub||null,
        location:form.loc,contact_phone:form.phone,
        user_id:user.id,status:"active",
        
        condicion: form.condicion || null,
        kilometraje: form.km ? parseInt(form.km) : null,
        anio: form.anio ? parseInt(form.anio) : null,
        puertas: form.puertas || null,
        cilindrada: form.cilindrada || null,
        modalidad: form.modalidad || null,
        parte: form.parte || null,
        formato: form.formato || null,
        dormitorios: form.dormitorios || null,
        ambientes: form.ambientes || null,
        publica: form.publica || null,
        area: form.area ? parseFloat(form.area) : null,
        talle: form.talle || null,
        genero: form.genero || null,
        movimiento: form.movimiento || null
      }).select().single();
      
      if(ins.error)throw ins.error;

      if(uploadedImagesData.length > 0){
        const imgsToInsert = uploadedImagesData.map(function(img){
          return { listing_id: ins.data.id, url: img.url, r2_key: img.r2_key, position: img.position };
        });
        await db.from("listing_images").insert(imgsToInsert);
      }

      setPubMsg("✅ ¡Publicado con éxito!");
      setForm({title:"",desc:"",price:"",ptype:"valor",cur:"ARS",cat:"",sub:"",loc:"",phone:"",files:[],previews:[],condicion:"", km:"", anio:"", puertas:"", cilindrada:"", modalidad:"", parte:"", formato:"", dormitorios:"", ambientes:"", publica:"", area:"", talle:"", genero:"", movimiento:""});
      await loadData();
      
      setTimeout(async function(){
        setPubMsg("");
        const r = await db.from("listings").select("*,listing_images(url)").eq("id", ins.data.id).single();
        if(r.data) openListing(r.data);
      },1500);
      
    }catch(err){setPubMsg("❌ "+(err.message||"Error"));}
    setPubBusy(false);
  }

  // ✅ LOGICA DE FILTROS EN BÚSQUEDA
  function renderDynamicFilters() {
    const elements = [];
    const pushInput = (label, el) => { elements.push(React.createElement("div", { key: label, className: "filter-group" }, React.createElement("label", { className: "filter-label" }, label), el)); };

    if (activeCat === "vehiculos" && activeSubcat !== "Planes de Ahorro") {
      const currentYear = new Date().getFullYear(); const years = []; for (let y = currentYear; y >= 1970; y--) years.push(y);
      pushInput("Condición", React.createElement("div", { className: "filter-radio-group" }, ["Nuevo", "Usado"].map(c => React.createElement("label", { key: c, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "condicion", value: c, checked: filters.condicion === c, onChange: e => setFilters(Object.assign({}, filters, {condicion: e.target.value, kmMin: "", kmMax: ""})) }), c))));
      if (filters.condicion === "Usado" && ["Autos", "Camionetas / SUV", "Motos", "Camiones"].includes(activeSubcat)) {
        pushInput("Kilometraje", React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement("input", { type: "number", placeholder: "Mín.", className: "filter-input", value: filters.kmMin || "", onChange: e => setFilters(Object.assign({}, filters, {kmMin: e.target.value})) }), React.createElement("input", { type: "number", placeholder: "Máx.", className: "filter-input", value: filters.kmMax || "", onChange: e => setFilters(Object.assign({}, filters, {kmMax: e.target.value})) })));
      }
      if (["Autos", "Camionetas / SUV", "Camiones"].includes(activeSubcat)) {
        pushInput("Año", React.createElement("select", { className: "filter-input", value: filters.anio || "", onChange: e => setFilters(Object.assign({}, filters, {anio: e.target.value})) }, React.createElement("option", { value: "" }, "Cualquier año"), years.map(y => React.createElement("option", { key: y, value: y }, y))));
      }
      if (["Autos", "Camionetas / SUV"].includes(activeSubcat)) {
        pushInput("Cantidad de puertas", React.createElement("div", { className: "filter-radio-group" }, ["3", "5"].map(p => React.createElement("label", { key: p, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "puertas", value: p, checked: filters.puertas === p, onChange: e => setFilters(Object.assign({}, filters, {puertas: e.target.value})) }), p + " puertas"))));
      }
      if (activeSubcat === "Motos") {
        pushInput("Cilindrada", React.createElement("div", { className: "filter-radio-group" }, ["150cc o menos", "151cc a 399cc", "+400cc"].map(c => React.createElement("label", { key: c, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "cilindrada", value: c, checked: filters.cilindrada === c, onChange: e => setFilters(Object.assign({}, filters, {cilindrada: e.target.value})) }), c))));
      }
    }

    if (activeSubcat === "Ciclismo") {
      pushInput("Condición", React.createElement("div", { className: "filter-radio-group" }, ["Nuevo", "Usado"].map(c => React.createElement("label", { key: c, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "condicion_ciclismo", value: c, checked: filters.condicion === c, onChange: e => setFilters(Object.assign({}, filters, {condicion: e.target.value})) }), c))));
      pushInput("Modalidad", React.createElement("select", { className: "filter-input", value: filters.modalidad || "", onChange: e => setFilters(Object.assign({}, filters, {modalidad: e.target.value})) }, React.createElement("option", { value: "" }, "Cualquiera"), ["Ruta", "MTB", "Triatlón", "Fixie", "Playera"].map(m => React.createElement("option", { key: m, value: m }, m))));
      pushInput("Parte / Artículo", React.createElement("select", { className: "filter-input", value: filters.parte || "", onChange: e => setFilters(Object.assign({}, filters, {parte: e.target.value})) }, React.createElement("option", { value: "" }, "Cualquiera"), ["Bici completa", "Cuadro", "Frenos", "Cambios / Transmisión", "Cassette / Piñones", "Manubrio", "Ciclocomputador", "Ruedas / Llantas", "Horquilla / Suspensión", "Asiento", "Pedales", "Indumentaria / Cascos"].map(p => React.createElement("option", { key: p, value: p }, p))));
    }

    if (activeSubcat === "Computación") {
      pushInput("Formato", React.createElement("div", { className: "filter-radio-group" }, ["Escritorio", "Laptop"].map(f => React.createElement("label", { key: f, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "formato", value: f, checked: filters.formato === f, onChange: e => setFilters(Object.assign({}, filters, {formato: e.target.value})) }), f))));
    }

    if (activeSubcat === "Casas" || activeSubcat === "Departamentos") {
      pushInput("Dormitorios", React.createElement("select", { className: "filter-input", value: filters.dormitorios || "", onChange: e => setFilters(Object.assign({}, filters, {dormitorios: e.target.value})) }, React.createElement("option", { value: "" }, "Cualquiera"), ["1", "2", "3", "4", "5+"].map(d => React.createElement("option", { key: d, value: d }, d))));
      pushInput("Ambientes", React.createElement("select", { className: "filter-input", value: filters.ambientes || "", onChange: e => setFilters(Object.assign({}, filters, {ambientes: e.target.value})) }, React.createElement("option", { value: "" }, "Cualquiera"), ["Monoambiente", "2 ambientes", "3 ambientes", "4+ ambientes"].map(a => React.createElement("option", { key: a, value: a }, a))));
      pushInput("Publica", React.createElement("div", { className: "filter-radio-group" }, ["Inmobiliaria", "Dueño directo"].map(p => React.createElement("label", { key: p, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "publica", value: p, checked: filters.publica === p, onChange: e => setFilters(Object.assign({}, filters, {publica: e.target.value})) }), p))));
    }

    if (activeSubcat === "Terrenos / Lotes" || activeSubcat === "Galpones") {
      pushInput("Área (m²)", React.createElement("input", { type: "number", className: "filter-input", placeholder: "Ej. 300", value: filters.area || "", onChange: e => setFilters(Object.assign({}, filters, {area: e.target.value})) }));
      pushInput("Publica", React.createElement("div", { className: "filter-radio-group" }, ["Inmobiliaria", "Dueño directo"].map(p => React.createElement("label", { key: p, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "publica_lote", value: p, checked: filters.publica_lote === p, onChange: e => setFilters(Object.assign({}, filters, {publica_lote: e.target.value})) }), p))));
    }

    if (activeSubcat === "Ropa Mujer" || activeSubcat === "Ropa Hombre") {
       pushInput("Talle", React.createElement("div", { className: "filter-radio-group" }, ["XS", "S", "M", "L", "XL", "XXL"].map(t => React.createElement("button", { key: t, className: "sub-pill " + (filters.talle === t ? "active" : ""), style: { padding: "6px 12px", fontSize: "12px", margin: 0 }, onClick: (e) => { e.preventDefault(); setFilters(Object.assign({}, filters, {talle: t === filters.talle ? "" : t})); } }, t))));
    }

    if (activeSubcat === "Zapatillas") {
       pushInput("Talle", React.createElement("input", { type: "number", className: "filter-input", placeholder: "Ej. 40", value: filters.talleCalzado || "", onChange: e => setFilters(Object.assign({}, filters, {talleCalzado: e.target.value})) }));
       pushInput("Género", React.createElement("div", { className: "filter-radio-group" }, ["Hombre", "Mujer", "Unisex"].map(g => React.createElement("label", { key: g, className: "filter-radio-label" }, React.createElement("input", { type: "radio", name: "genero", value: g, checked: filters.genero === g, onChange: e => setFilters(Object.assign({}, filters, {genero: e.target.value})) }), g))));
    }

    if (activeSubcat === "Relojes") {
       pushInput("Movimiento", React.createElement("select", { className: "filter-input", value: filters.movimiento || "", onChange: e => setFilters(Object.assign({}, filters, {movimiento: e.target.value})) }, React.createElement("option", { value: "" }, "Cualquiera"), ["Cuarzo", "Automático", "A cuerda"].map(m => React.createElement("option", { key: m, value: m }, m))));
    }

    return elements;
  }

  // ✅ LOGICA DE GENERACIÓN DE REQUISITOS EN PUBLICACIÓN
  function renderPublishDynamicFields() {
    if (!form.cat) return null;
    const elements = [];
    const pushInput = (label, el) => {
      elements.push(React.createElement("div", { key: label, style:{marginBottom: 18} },
        React.createElement("div", { style:{fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6} }, label),
        el
      ));
    };

    if (form.cat === "vehiculos" && form.sub !== "Planes de Ahorro") {
      pushInput("Condición", React.createElement("select", { className: "fi", value: form.condicion, onChange: e => setForm({...form, condicion: e.target.value, km: ""}) },
        React.createElement("option", {value:""}, "Seleccionar..."), React.createElement("option", {value:"Nuevo"}, "Nuevo"), React.createElement("option", {value:"Usado"}, "Usado")
      ));
      if (form.condicion === "Usado" && ["Autos", "Camionetas / SUV", "Motos", "Camiones"].includes(form.sub)) {
        pushInput("Kilometraje", React.createElement("input", { type: "number", className: "fi", placeholder: "Ej. 50000", value: form.km, onChange: e => setForm({...form, km: e.target.value}) }));
      }
      if (["Autos", "Camionetas / SUV", "Camiones"].includes(form.sub)) {
        const currentYear = new Date().getFullYear(); const years = []; for (let y = currentYear; y >= 1970; y--) years.push(y);
        pushInput("Año", React.createElement("select", { className: "fi", value: form.anio, onChange: e => setForm({...form, anio: e.target.value}) },
          React.createElement("option", {value:""}, "Seleccionar..."), years.map(y => React.createElement("option", {key:y, value:y}, y))
        ));
      }
      if (["Autos", "Camionetas / SUV"].includes(form.sub)) {
        pushInput("Cantidad de puertas", React.createElement("select", { className: "fi", value: form.puertas, onChange: e => setForm({...form, puertas: e.target.value}) },
          React.createElement("option", {value:""}, "Seleccionar..."), React.createElement("option", {value:"3"}, "3 puertas"), React.createElement("option", {value:"5"}, "5 puertas")
        ));
      }
      if (form.sub === "Motos") {
        pushInput("Cilindrada", React.createElement("select", { className: "fi", value: form.cilindrada, onChange: e => setForm({...form, cilindrada: e.target.value}) },
          React.createElement("option", {value:""}, "Seleccionar..."), ["150cc o menos", "151cc a 399cc", "+400cc"].map(c => React.createElement("option", {key:c, value:c}, c))
        ));
      }
    }

    if (form.sub === "Ciclismo") {
      pushInput("Condición", React.createElement("select", { className: "fi", value: form.condicion, onChange: e => setForm({...form, condicion: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), React.createElement("option", {value:"Nuevo"}, "Nuevo"), React.createElement("option", {value:"Usado"}, "Usado")
      ));
      pushInput("Modalidad", React.createElement("select", { className: "fi", value: form.modalidad, onChange: e => setForm({...form, modalidad: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Ruta", "MTB", "Triatlón", "Fixie", "Playera"].map(m => React.createElement("option", {key:m, value:m}, m))
      ));
      pushInput("Parte / Artículo", React.createElement("select", { className: "fi", value: form.parte, onChange: e => setForm({...form, parte: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Bici completa", "Cuadro", "Frenos", "Cambios / Transmisión", "Cassette / Piñones", "Manubrio", "Ciclocomputador", "Ruedas / Llantas", "Horquilla / Suspensión", "Asiento", "Pedales", "Indumentaria / Cascos"].map(p => React.createElement("option", {key:p, value:p}, p))
      ));
    }

    if (form.sub === "Computación") {
      pushInput("Formato", React.createElement("select", { className: "fi", value: form.formato, onChange: e => setForm({...form, formato: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Escritorio", "Laptop"].map(f => React.createElement("option", {key:f, value:f}, f))
      ));
    }

    if (form.sub === "Casas" || form.sub === "Departamentos") {
      pushInput("Dormitorios", React.createElement("select", { className: "fi", value: form.dormitorios, onChange: e => setForm({...form, dormitorios: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["1", "2", "3", "4", "5+"].map(d => React.createElement("option", {key:d, value:d}, d))
      ));
      pushInput("Ambientes", React.createElement("select", { className: "fi", value: form.ambientes, onChange: e => setForm({...form, ambientes: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Monoambiente", "2 ambientes", "3 ambientes", "4+ ambientes"].map(a => React.createElement("option", {key:a, value:a}, a))
      ));
      pushInput("Publica", React.createElement("select", { className: "fi", value: form.publica, onChange: e => setForm({...form, publica: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Inmobiliaria", "Dueño directo"].map(p => React.createElement("option", {key:p, value:p}, p))
      ));
    }

    if (form.sub === "Terrenos / Lotes" || form.sub === "Galpones") {
      pushInput("Área (m²)", React.createElement("input", { type: "number", className: "fi", placeholder: "Ej. 300", value: form.area, onChange: e => setForm({...form, area: e.target.value}) }));
      pushInput("Publica", React.createElement("select", { className: "fi", value: form.publica, onChange: e => setForm({...form, publica: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Inmobiliaria", "Dueño directo"].map(p => React.createElement("option", {key:p, value:p}, p))
      ));
    }

    if (form.sub === "Ropa Mujer" || form.sub === "Ropa Hombre") {
      pushInput("Talle", React.createElement("select", { className: "fi", value: form.talle, onChange: e => setForm({...form, talle: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["XS", "S", "M", "L", "XL", "XXL"].map(t => React.createElement("option", {key:t, value:t}, t))
      ));
    }
    if (form.sub === "Zapatillas") {
      pushInput("Talle (Ej. 40)", React.createElement("input", { type: "number", className: "fi", placeholder: "Ej. 40", value: form.talle, onChange: e => setForm({...form, talle: e.target.value}) }));
      pushInput("Género", React.createElement("select", { className: "fi", value: form.genero, onChange: e => setForm({...form, genero: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Hombre", "Mujer", "Unisex"].map(g => React.createElement("option", {key:g, value:g}, g))
      ));
    }
    if (form.sub === "Relojes") {
      pushInput("Movimiento", React.createElement("select", { className: "fi", value: form.movimiento, onChange: e => setForm({...form, movimiento: e.target.value}) },
        React.createElement("option", {value:""}, "Seleccionar..."), ["Cuarzo", "Automático", "A cuerda"].map(m => React.createElement("option", {key:m, value:m}, m))
      ));
    }

    return elements.length > 0 ? React.createElement("div", {style:{padding: "20px", background: "var(--color-main-bg)", borderRadius: 12, border: "1px solid var(--color-border)", marginBottom: 24}}, 
      React.createElement("h3", {style:{fontSize: 16, fontWeight: 800, marginBottom: 16, color: "var(--color-text-main)"}}, "🛠️ Características Específicas"),
      React.createElement("div", {style:{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}, elements)
    ) : null;
  }

  const filtered=recent.filter(function(l){
    return (!search||l.title.toLowerCase().includes(search.toLowerCase()))&&(activeTab==="Todos"||l.category_id===activeTab);
  });
  const searchResults=recent.filter(function(l){
    return search && l.title.toLowerCase().includes(search.toLowerCase());
  });
  
  const catSubs=(getCat(form.cat)||{}).subs||[];
  const activeCatData=getCat(activeCat);

  return React.createElement("div",{style:{fontFamily:"'Sora','Nunito',sans-serif",background:"var(--color-main-bg)",minHeight:"100vh",color:"var(--color-text-main)",display:"flex",flexDirection:"column"}},
  
    React.createElement("style",null,`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
      
      :root {
        --color-hero-bg: #1B263B;
        --color-main-bg: #FBFBF9;
        --color-surface-banner: #415A77;
        --color-search-bg: rgba(255, 255, 255, 0.1);
        --color-accent: #E07A5F;
        --color-text-hero: #FFFFFF;
        --color-text-main: #22223B;
        --color-text-muted: #8D99AE;
        --color-surface: #FFFFFF;
        --color-border: #D8DEE9;
      }

      *{box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:var(--color-accent);border-radius:3px}
      
      ::placeholder { color: var(--color-text-muted); opacity: 0.8; }

      .nl{color:var(--color-text-hero);font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;background:none;border:none;font-family:inherit;transition:background .2s}
      .nl:hover{background:var(--color-search-bg)}
      .cp{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;background:var(--color-surface);border-radius:16px;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);border:2px solid transparent;box-shadow:0 2px 8px rgba(0,0,0,.04)}
      .cp:hover{transform:translateY(-5px) scale(1.04);box-shadow:0 12px 28px rgba(0,0,0,.08)}
      .card{background:var(--color-surface);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .25s;box-shadow:0 2px 10px rgba(0,0,0,.04);border:1px solid var(--color-border);display:flex;flex-direction:column}
      .card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(0,0,0,.08)}
      .rc{display:flex;gap:12px;align-items:center;background:var(--color-surface);border-radius:12px;padding:12px;cursor:pointer;transition:all .2s;border:1px solid var(--color-border)}
      .rc:hover{transform:translateX(4px);box-shadow:0 6px 20px rgba(0,0,0,.06)}
      .pb{background:var(--color-accent);color:var(--color-text-hero);border:none;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit}
      .pb:hover{filter: brightness(1.1); transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.15)}
      .tb{padding:8px 18px;border-radius:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
      .ta{background:var(--color-hero-bg);color:var(--color-text-hero)} 
      .ti{background:var(--color-surface);color:var(--color-text-muted);border:1px solid var(--color-border)}
      .ti:hover{border-color:var(--color-accent);color:var(--color-accent)}
      .ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
      .md{background:var(--color-surface);border-radius:24px;width:90%;max-width:520px;padding:32px;max-height:90vh;overflow-y:auto}
      .fi{background:var(--color-main-bg);color:var(--color-text-main);border:2px solid var(--color-border);border-radius:10px;padding:11px 14px;font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color .2s}
      .fi:focus{border-color:var(--color-accent)}
      .ab{border-radius:18px;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;margin:28px 0;gap:16px;flex-wrap:wrap}
      .ac{background:var(--color-surface);color:var(--color-text-main);border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
      .es{text-align:center;padding:60px 20px;color:var(--color-text-muted)}
      .pt{display:flex;border:2px solid var(--color-border);border-radius:10px;overflow:hidden;margin-bottom:10px}
      .pt button{flex:1;padding:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
      .pa{background:var(--color-accent);color:var(--color-text-hero)} 
      .pi{background:var(--color-surface);color:var(--color-text-muted)}
      .ipg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
      .ipi{position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden}
      .ipi img{width:100%;height:100%;object-fit:cover}
      .irb{position:absolute;top:3px;right:3px;background:var(--color-hero-bg);color:var(--color-text-hero);border:none;border-radius:50%;width:22px;height:22px;font-size:14px;cursor:pointer;font-family:inherit}
      .irb:hover{background:var(--color-accent)}
      .tag{font-size:10px;padding:3px 8px;border-radius:6px;font-weight:700}
      
      .page-container { flex: 1; max-width: 1200px; margin: 0 auto; padding: 40px 20px; width: 100%; }
      .listing-grid { display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
      @media(max-width: 900px){ .listing-grid { grid-template-columns: 1fr; } }
      @media(max-width: 600px){ .mg { grid-template-columns: repeat(2,1fr)!important; } }

      /* ESTILOS PARA CATEGORÍAS Y SUBCATEGORÍAS */
      .hs-container { display: flex; overflow-x: auto; gap: 16px; padding: 10px 0 24px 0; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
      .hs-container::-webkit-scrollbar { display: none; }
      .hs-container { -ms-overflow-style: none; scrollbar-width: none; }
      
      .cat-card { flex: 0 0 auto; width: 130px; cursor: pointer; display: flex; flex-direction: column; gap: 12px; transition: transform 0.2s ease; }
      @media(max-width: 600px){ .cat-card { width: 110px; } }
      .cat-card:hover { transform: translateY(-4px); }
      .cat-img-box { width: 100%; aspect-ratio: 1; border-radius: 16px; overflow: hidden; background: var(--color-surface); border: 2px solid transparent; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .cat-card.active .cat-img-box { border-color: var(--color-accent); transform: scale(0.98); box-shadow: 0 0 0 4px rgba(224, 122, 95, 0.15); }
      .cat-img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
      .cat-card:hover .cat-img-box img { transform: scale(1.08); }
      
      .cat-title { font-size: 15px; font-weight: 700; color: var(--color-text-main); text-align: left; position: relative; align-self: flex-start; }
      .cat-title::after { content: ''; position: absolute; width: 100%; transform: scaleX(0); height: 2px; bottom: -2px; left: 0; background-color: var(--color-text-main); transform-origin: bottom left; transition: transform 0.25s ease-out; }
      .cat-card:hover .cat-title::after, .cat-card.active .cat-title::after { transform: scaleX(1); }

      .subcat-wrapper { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
      .sub-pill { padding: 10px 20px; border-radius: 99px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: 1px solid var(--color-border); white-space: nowrap; font-family: inherit; }
      .sub-pill.active { background: var(--color-accent); color: var(--color-text-hero); border-color: var(--color-accent); box-shadow: 0 4px 10px rgba(224, 122, 95, 0.3); }
      .sub-pill:not(.active) { background: var(--color-surface); color: var(--color-text-main); }
      .sub-pill:not(.active):hover { border-color: var(--color-text-muted); background: var(--color-main-bg); }
      
      .fade-slide-down { animation: fadeSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
      .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; gap: 10px; height: 66px; width: 100%; overflow: hidden; }
      .logo-icon { width: 38px; height: 38px; font-size: 20px; }
      .logo-title { font-size: 16px; }
      .logo-sub { font-size: 10px; }
      .search-container { flex: 1; max-width: 480px; height: 42px; padding: 0 14px; }
      .mobile-only { display: none; }
      
      .hamburger { background: none; border: none; color: var(--color-text-hero); font-size: 28px; cursor: pointer; padding: 4px 0 4px 8px; line-height: 1; }
      .mobile-dropdown { position: absolute; top: 66px; right: 16px; background: var(--color-hero-bg); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 50; display: flex; flex-direction: column; min-width: 240px; }
      .mobile-dropdown-item { padding: 14px 16px; color: var(--color-text-hero); text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; transition: background 0.2s; text-align: left; background: transparent; border: none; font-family: inherit; cursor: pointer; width: 100%; display: block; }
      .mobile-dropdown-item:hover { background: var(--color-search-bg); }

      /* ESTILOS DEL MENÚ LATERAL (DRAWER) DE FILTROS */
      .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; opacity: 0; animation: fadeIn 0.3s forwards; backdrop-filter: blur(2px); }
      .drawer { position: fixed; top: 0; bottom: 0; left: 0; width: 320px; background: var(--color-surface); z-index: 2001; transform: translateX(-100%); animation: slideInLeft 0.3s forwards; display: flex; flex-direction: column; box-shadow: 4px 0 25px rgba(0,0,0,0.15); }
      .drawer-header { padding: 20px 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; background: var(--color-main-bg); }
      .drawer-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 24px; }
      .drawer-footer { padding: 20px 24px; border-top: 1px solid var(--color-border); background: var(--color-main-bg); }
      .filter-group { display: flex; flex-direction: column; gap: 10px; }
      .filter-label { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
      .filter-input { background: var(--color-surface); color: var(--color-text-main); border: 1px solid var(--color-border); border-radius: 10px; padding: 12px 14px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border-color 0.2s; }
      .filter-input:focus { border-color: var(--color-accent); }
      .filter-radio-group { display: flex; gap: 14px; flex-wrap: wrap; }
      .filter-radio-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-text-main); cursor: pointer; font-weight: 500; }
      .filter-radio-label input[type="radio"] { accent-color: var(--color-accent); width: 16px; height: 16px; cursor: pointer; }
      @keyframes fadeIn { to { opacity: 1; } }
      @keyframes slideInLeft { to { transform: translateX(0); } }
      
      @media(max-width: 768px) {
        .nav-container { padding: 0 12px; gap: 8px; }
        .logo-icon { width: 30px; height: 30px; font-size: 16px; }
        .logo-title { font-size: 13px; }
        .logo-sub { font-size: 8px; }
        .search-container { max-width: 170px; height: 36px; padding: 0 10px; }
        .desktop-only { display: none !important; }
        .mobile-only { display: flex !important; }
        .drawer { width: 85%; }
      }
      @media(max-width: 400px) {
        .search-container { max-width: 130px; }
        .logo-text-wrapper { display: none; }
      }
    `),


    // ─── HEADER / NAVBAR ──────────────────────────────────────────────
    React.createElement("nav",{style:{position:"sticky",top:0,zIndex:300,background:"var(--color-hero-bg)",boxShadow:scrolled?"0 4px 20px rgba(0,0,0,.15)":"none",transition:"all .3s"}},
      React.createElement("div",{className:"nav-container"},
        React.createElement("div",{onClick:goHome, style:{display:"flex",alignItems:"center",gap:8,marginRight:"auto",flexShrink:0,cursor:"pointer"}},
          React.createElement("div",{className:"logo-icon", style:{background:"var(--color-accent)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}},"🌵"),
          React.createElement("div",{className:"logo-text-wrapper"},
            React.createElement("div",{className:"logo-title", style:{color:"var(--color-text-hero)",fontWeight:800,lineHeight:1.1}},"Compra en Jujuy"),
            React.createElement("div",{className:"logo-sub", style:{color:"var(--color-text-muted)",letterSpacing:"1.5px",textTransform:"uppercase"}},"Clasificados")
          )
        ),
        React.createElement("div",{className:"search-container", style:{background:"var(--color-search-bg)",borderRadius:12,display:"flex",alignItems:"center",border:"1px solid rgba(255,255,255,.1)"}},
          React.createElement("span",{style:{marginRight:8,fontSize:16,color:"var(--color-text-hero)",opacity:.7}},"🔍"),
          React.createElement("input",{
            style:{flex:1,border:"none",outline:"none",fontSize:14,fontFamily:"inherit",background:"transparent",color:"var(--color-text-hero)", width:"100%"},
            placeholder:"Buscar...",
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
        React.createElement("div",{className:"desktop-only", style:{display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}},
          user
            ? React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                React.createElement("button",{className:"nl",onClick:openProfile,style:{display:"flex",alignItems:"center",gap:6,background:currentView==="profile"?"var(--color-search-bg)":"transparent"}},
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
          React.createElement("button",{className:"pb",onClick:openPublish},"✏️ Publicar")
        ),
        React.createElement("div",{className:"mobile-only", style:{alignItems:"center", marginLeft:"auto"}},
          React.createElement("button", {
            className: "hamburger",
            onClick: function() { setIsMobileMenuOpen(!isMobileMenuOpen); }
          }, "☰")
        )
      ),
      isMobileMenuOpen && React.createElement("div", { className: "mobile-dropdown" },
        React.createElement("button", {
          className: "mobile-dropdown-item",
          onClick: function() {
            setIsMobileMenuOpen(false);
            if (user) { openProfile(); } else { setAuthMode("login"); setAuthModal(true); }
          }
        }, "👤 Mi Perfil"),
        React.createElement("a", {
          className: "mobile-dropdown-item",
          href: "https://wa.me/5493886108072?text=Hola,%20me%20interesa%20adquirir%20un%20espacio%20publicitario",
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: function() { setIsMobileMenuOpen(false); }
        }, "📢 Adquirir espacio publicitario")
      ),
      megaOpen && React.createElement("div",{className:"desktop-only", style:{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:"var(--color-surface)",borderRadius:"0 0 20px 20px",boxShadow:"0 20px 60px rgba(0,0,0,.15)",zIndex:200,padding:28}},
        React.createElement("div",{className:"mg",style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,maxWidth:1200,margin:"0 auto"}},
          categories.map(function(cat){
            return React.createElement("div",{key:cat.id,onClick:function(){selectCat(cat.id);setMegaOpen(false);}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10,cursor:"pointer"}},
                React.createElement("span",{style:{fontSize:18}},cat.icon),
                React.createElement("div",null,
                  React.createElement("div",{style:{fontWeight:700,fontSize:14,color:"var(--color-text-main)"}},cat.label),
                  React.createElement("div",{style:{fontSize:11,color:"var(--color-text-muted)"}},fmtCount(counts[cat.id])+" anuncios")
                )
              ),
              cat.subs.map(function(s){return React.createElement("div",{key:s,style:{fontSize:12,color:"var(--color-text-muted)",padding:"3px 0 3px 26px",cursor:"pointer"},onMouseEnter:function(e){e.target.style.color="var(--color-accent)";},onMouseLeave:function(e){e.target.style.color="var(--color-text-muted)";}},s);})
            );
          })
        )
      )
    ),
    
    // ─── VISTA: HOME ──────────────────────────────────────────────
    currentView === "home" && React.createElement(React.Fragment, null,
      React.createElement("div",{style:{
        background: "linear-gradient(to bottom, rgba(27, 38, 59, 0.85), rgba(27, 38, 59, 0.5)), url('./assets/fondohero.jpg') center/cover no-repeat",
        padding:"52px 20px 60px",
        position:"relative",
        overflow:"hidden"
      }},
        React.createElement("div",{style:{position:"absolute",bottom:0,left:0,right:0,height:8,background:"var(--color-surface-banner)",opacity:.9}}),
        React.createElement("div",{style:{position:"absolute",bottom:8,left:0,right:0,height:4,background:"var(--color-accent)",opacity:.5}}),
        React.createElement("div",{style:{position:"absolute",bottom:24,left:20,fontSize:64,opacity:.12}},"🌵"),
        React.createElement("div",{style:{position:"absolute",bottom:24,right:20,fontSize:72,opacity:.12}},"🌵"),
        
        React.createElement("div",{style:{maxWidth:1200,margin:"0 auto",textAlign:"center", position: "relative", zIndex: 10}},
          React.createElement("div",{style:{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.35)",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 16px",marginBottom:18}},
            React.createElement("span",{style:{color:"var(--color-accent)",fontSize:12,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}},"🟢 Clasificados gratuitos de Jujuy")
          ),
          React.createElement("h1",{style:{color:"var(--color-text-hero)",fontSize:"clamp(28px,5vw,52px)",fontWeight:900,lineHeight:1.15,letterSpacing:"-1px",marginBottom:14, textShadow: "0 2px 15px rgba(0,0,0,0.6)"}},
            "Compra y vendé en",React.createElement("br"),
            React.createElement("span",{style:{color:"var(--color-accent)"}},"Jujuy 🌵")
          ),
          React.createElement("p",{style:{color:"var(--color-text-hero)",opacity: 0.95,fontSize:"clamp(13px,2vw,16px)",maxWidth:500,margin:"0 auto 32px", textShadow: "0 2px 10px rgba(0,0,0,0.6)"}},
            "Clasificados gratuitos para toda la provincia. Publicá en segundos, llegá a miles."
          ),
          React.createElement("div",{style:{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}},
            React.createElement("button",{className:"pb",style:{padding:"14px 32px",fontSize:15,borderRadius:14,background:"var(--color-accent)",boxShadow:"0 8px 24px rgba(0,0,0,.3)"},onClick:openPublish},"✏️ Publicar GRATIS")
          )
        )
      ),
      
      React.createElement("div",{style:{maxWidth:1200,margin:"0 auto",padding:"0 20px", width:"100%"}},
        React.createElement(AdBanner, null),
        
        React.createElement("div",{id:"seccion-categorias", style:{marginBottom:48}},
          React.createElement("div",{className:"hs-container"},
            categories.map(function(cat){
              const isActive = activeCat === cat.id;
              return React.createElement("div",{
                key: cat.id, 
                className: "cat-card " + (isActive ? "active" : ""),
                onClick: function(){ selectCat(cat.id); }
              },
                React.createElement("div", {className: "cat-img-box"},
                  React.createElement("img", {src: cat.image, alt: cat.label, loading: "lazy"})
                ),
                React.createElement("span", {className: "cat-title"}, cat.label)
              );
            })
          ),

          activeCat && React.createElement("div", {className: "fade-slide-down"},
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "32px" } },
              React.createElement("div", {className: "subcat-wrapper"},
                ((activeCatData||{}).subs||[]).map(function(s){
                  const isActive = activeSubcat === s;
                  return React.createElement("button", {
                    key: s,
                    className: "sub-pill " + (isActive ? "active" : ""),
                    onClick: function() { selectSubcat(s); }
                  }, s);
                })
              ),
              React.createElement("button", {
                className: "pb",
                style: { background: "var(--color-surface)", color: "var(--color-text-main)", border: "1px solid var(--color-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "8px" },
                onClick: function() { setIsFilterMenuOpen(true); }
              }, "⚙️ Filtros")
            ),
            
            catLoading ? React.createElement("div",{className:"es"},"⏳ Cargando anuncios...") : 
            catListings.length === 0 ? React.createElement("div",{className:"es"},"📭 No hay anuncios publicados en esta sección aún.") :
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}},
              catListings.map(function(l){
                return React.createElement(ListingCard,{key:l.id,listing:l,onOpen:openListing});
              })
            )
          )
        ),
      
        top.length>0 && React.createElement("div",{style:{marginBottom:36}},
          React.createElement(SecTitle,{title:"🔥 Populares",sub:"Boosteá tu publicidad contactandonos!"}),
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}},
            top.map(function(l){return React.createElement(ListingCard,{key:l.id,listing:l,onOpen:openListing});})
          )
        ),

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
                React.createElement("div",{style:{width:60,height:60,background:"var(--color-main-bg)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,overflow:"hidden"}},
                  img?React.createElement("img",{src:img,style:{width:"100%",height:"100%",objectFit:"cover"}}):(cat?cat.icon:"📦")
                ),
                React.createElement("div",{style:{flex:1,minWidth:0}},
                  React.createElement("div",{style:{fontSize:13,fontWeight:700,color:"var(--color-text-main)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},l.title),
                  React.createElement("div",{style:{fontSize:15,fontWeight:900,color:"var(--color-accent)"}},l.price_label||"Consultar"),
                  React.createElement("div",{style:{display:"flex",gap:8,marginTop:4}},
                    React.createElement("span",{style:{fontSize:10,color:"var(--color-text-main)",background:"var(--color-main-bg)",padding:"2px 7px",borderRadius:5,fontWeight:600}},(cat?cat.label:l.category_id)),
                    React.createElement("span",{style:{fontSize:10,color:"var(--color-text-muted)"}},"🕐 "+timeAgo(l.created_at))
                  )
                )
              );
            })
          )
        )
      )
    ),

    // ─── VISTA: PUBLICACIÓN ──────────────────────────────────────────────
    currentView === "listing" && currentListing && React.createElement("div", {className:"page-container"},
      React.createElement("div", {style:{marginBottom:20, fontSize:13, fontWeight:600}},
        React.createElement("a", {href:"#", onClick:goHome, style:{color:"var(--color-text-muted)", textDecoration:"none"}}, "Inicio"),
        React.createElement("span", {style:{color:"var(--color-text-muted)", margin:"0 8px"}}, "/"),
        React.createElement("span", {style:{color:"var(--color-accent)"}}, (getCat(currentListing.category_id)||{}).label||currentListing.category_id),
        currentListing.subcategory && React.createElement(React.Fragment, null,
          React.createElement("span", {style:{color:"var(--color-text-muted)", margin:"0 8px"}}, "/"),
          React.createElement("span", {style:{color:"var(--color-accent)"}}, currentListing.subcategory)
        )
      ),
      React.createElement("div", {className: "listing-grid"},
        React.createElement("div", null, 
          currentListing.listing_images && currentListing.listing_images.length > 0 ?
            React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:12}},
              React.createElement("div", {style:{borderRadius:20, overflow:"hidden", background:"var(--color-surface)", border:"1px solid var(--color-border)", aspectRatio:"4/3", display:"flex", alignItems:"center", justifyContent:"center"}},
                React.createElement("img", {src:currentListing.listing_images[activeImageIdx || 0].url, style:{width:"100%", height:"100%", objectFit:"contain"}})
              ),
              currentListing.listing_images.length > 1 && React.createElement("div", {style:{display:"flex", gap:10, overflowX:"auto", paddingBottom:8}},
                currentListing.listing_images.map(function(img, idx){
                  return React.createElement("div", {
                    key: idx,
                    onClick: function(){setActiveImageIdx(idx);},
                    style: {
                      width:80, height:80, borderRadius:12, overflow:"hidden", cursor:"pointer", flexShrink:0,
                      border: activeImageIdx === idx ? "3px solid var(--color-accent)" : "1px solid var(--color-border)",
                      opacity: activeImageIdx === idx ? 1 : 0.6,
                      transition: "all .2s"
                    }
                  }, React.createElement("img", {src:img.url, style:{width:"100%", height:"100%", objectFit:"cover"}}));
                })
              )
            ) : 
            React.createElement("div", {style:{borderRadius:20, background:"var(--color-main-bg)", aspectRatio:"4/3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:64}},
              (getCat(currentListing.category_id)||{}).icon||"📦"
            )
        ),
        React.createElement("div", null, 
          React.createElement("div", {style:{background:"var(--color-surface)", padding:32, borderRadius:20, border:"1px solid var(--color-border)", boxShadow:"0 4px 20px rgba(0,0,0,.04)"}},
            React.createElement("h1", {style:{fontSize:26, fontWeight:800, color:"var(--color-text-main)", marginBottom:12, lineHeight:1.3}}, currentListing.title),
            React.createElement("div", {style:{fontSize:36, fontWeight:900, color:"var(--color-accent)", marginBottom:24}}, currentListing.price_label||"Consultar"),
            
            React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:12, marginBottom:32, paddingBottom:24, borderBottom:"1px solid var(--color-border)"}},
              currentListing.location && React.createElement("div", {style:{display:"flex", alignItems:"center", gap:10, color:"var(--color-text-muted)", fontSize:14}}, React.createElement("span", {style:{fontSize:18}},"📍"), "Ubicación: " + currentListing.location),
              React.createElement("div", {style:{display:"flex", alignItems:"center", gap:10, color:"var(--color-text-muted)", fontSize:14}}, React.createElement("span", {style:{fontSize:18}},"🕐"), "Publicado hace " + timeAgo(currentListing.created_at)),
              React.createElement("div", {style:{display:"flex", alignItems:"center", gap:10, color:"var(--color-text-muted)", fontSize:14}}, React.createElement("span", {style:{fontSize:18}},"👁️"), currentListing.views + " personas vieron esto")
            ),
            
            currentListing.description && React.createElement("div", {style:{marginBottom:32}},
              React.createElement("h3", {style:{fontSize:16, fontWeight:800, marginBottom:12}}, "Descripción"),
              React.createElement("p", {style:{fontSize:15, color:"var(--color-text-muted)", lineHeight:1.7, whiteSpace:"pre-wrap"}}, currentListing.description)
            ),

            currentListing.contact_phone && React.createElement("a", {
              href:"https://wa.me/549"+currentListing.contact_phone.replace(/\D/g,"")+"?text=Hola, vi tu anuncio '"+encodeURIComponent(currentListing.title)+"' en Compra en Jujuy",
              target:"_blank", rel:"noopener noreferrer",
              style:{display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"var(--color-accent)", color:"var(--color-text-hero)", padding:"16px", borderRadius:14, fontWeight:800, fontSize:16, textDecoration:"none", transition:"transform .2s", boxShadow:"0 8px 20px rgba(0,0,0,.1)"}
            }, "💬 Contactar al vendedor")
          )
        )
      )
    ),

    // ─── VISTA: PERFIL ──────────────────────────────────────────────
    currentView === "profile" && React.createElement("div", {className:"page-container", style:{maxWidth:800}},
      React.createElement("div", {style:{background:"var(--color-surface)", borderRadius:20, padding:32, border:"1px solid var(--color-border)", marginBottom:24, display:"flex", alignItems:"center", gap:20}},
        React.createElement("div", {style:{width:72, height:72, borderRadius:20, background:"var(--color-hero-bg)", color:"var(--color-text-hero)", fontSize:32, display:"flex", alignItems:"center", justifyContent:"center"}}, "👤"),
        React.createElement("div", null,
          React.createElement("h1", {style:{fontSize:24, fontWeight:800, color:"var(--color-text-main)"}}, "Mi Perfil"),
          React.createElement("div", {style:{fontSize:15, color:"var(--color-text-muted)", marginTop:4}}, user && user.email)
        )
      ),
      React.createElement("div", {style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}},
        React.createElement("h2", {style:{fontSize:20, fontWeight:800, color:"var(--color-text-main)"}}, "Mis Publicaciones"),
        React.createElement("button", {className:"pb", onClick:openPublish}, "✏️ Nuevo Anuncio")
      ),
      myLoading ? React.createElement("div", {className:"es"}, "⏳ Cargando...") :
      myListings.length===0 ? React.createElement("div", {className:"es"}, "📭 No tienes publicaciones") :
      React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:12}},
        myListings.map(function(l){
          const img=l.listing_images&&l.listing_images[0]&&l.listing_images[0].url;
          const cat=getCat(l.category_id);
          return React.createElement("div", {key:l.id, style:{display:"flex", gap:16, alignItems:"center", background:"var(--color-surface)", borderRadius:16, padding:16, border:"1px solid var(--color-border)", boxShadow:"0 2px 8px rgba(0,0,0,.03)"}},
            React.createElement("div", {style:{width:70, height:70, borderRadius:12, overflow:"hidden", background:"var(--color-main-bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0}},
              img?React.createElement("img",{src:img,style:{width:"100%",height:"100%",objectFit:"cover"}}):(cat?cat.icon:"📦")
            ),
            React.createElement("div", {style:{flex:1, minWidth:0}},
              React.createElement("div", {style:{fontSize:15, fontWeight:800, color:"var(--color-text-main)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:4}}, l.title),
              React.createElement("div", {style:{fontSize:16, fontWeight:900, color:"var(--color-accent)", marginBottom:6}}, l.price_label||"Consultar"),
              React.createElement("div", {style:{display:"flex", gap:10, alignItems:"center"}},
                React.createElement("span", {style:{fontSize:11, padding:"3px 8px", borderRadius:6, fontWeight:700, background:"var(--color-main-bg)", color:"var(--color-text-main)"}}, l.status==="active"?"✅ Activo":"⏸ Pausado"),
                React.createElement("span", {style:{fontSize:12, color:"var(--color-text-muted)", fontWeight:600}}, "👁️ "+l.views+" visitas")
              )
            ),
            React.createElement("div", {style:{display:"flex", flexDirection:"column", gap:8, flexShrink:0}},
              React.createElement("button",{onClick:function(){pauseListing(l.id,l.status);}, style:{background:"var(--color-main-bg)",border:"none",padding:"8px 12px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:"var(--color-text-main)"}}, l.status==="active"?"⏸ Pausar":"▶️ Activar"),
              React.createElement("button",{onClick:function(){setDeleteTarget(l.id);}, style:{background:"var(--color-main-bg)",border:"none",padding:"8px 12px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",color:"var(--color-accent)",fontFamily:"inherit"}}, "🗑️ Eliminar")
            )
          );
        })
      )
    ),

    // ─── VISTA: PUBLICAR (NUEVA PÁGINA COMPLETA) ──────────────────────────────────
    currentView === "publish" && React.createElement("div", {className:"page-container", style:{maxWidth: 800}},
      React.createElement("div", {style:{marginBottom: 24}},
        React.createElement("button", {onClick: goHome, className: "nl", style:{color: "var(--color-text-muted)", padding: 0}}, "← Volver al inicio"),
        React.createElement("h1", {style:{fontSize: 28, fontWeight: 800, color: "var(--color-text-main)", marginTop: 16}}, "✏️ Publicar anuncio")
      ),
      React.createElement("div", {style:{background: "var(--color-surface)", padding: "32px 40px", borderRadius: 20, border: "1px solid var(--color-border)", boxShadow: "0 4px 20px rgba(0,0,0,.04)"}},
        
        React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},"Categoría *"),
          React.createElement("select",{className:"fi",value:form.cat,onChange:function(e){setForm(Object.assign({},form,{cat:e.target.value,sub:""}))}},
            React.createElement("option",{value:""},"Seleccioná una categoría..."),
            categories.map(function(c){return React.createElement("option",{key:c.id,value:c.id},c.icon+" "+c.label);})
          )
        ),
        form.cat&&React.createElement("div",{style:{marginBottom:24}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},"Subcategoría"),
          React.createElement("select",{className:"fi",value:form.sub,onChange:function(e){setForm(Object.assign({},form,{sub:e.target.value}));}},
            React.createElement("option",{value:""},"Sin subcategoría"),
            (getCat(form.cat)||{}).subs.map(function(s){return React.createElement("option",{key:s,value:s},s);})
          )
        ),

        // ✅ REQUISITOS DINÁMICOS BASADOS EN LOS FILTROS
        renderPublishDynamicFields(),

        React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},"Título del anuncio *"),
          React.createElement("input",{className:"fi",placeholder:"Ej: iPhone 15 Pro",value:form.title,onChange:function(e){setForm(Object.assign({},form,{title:e.target.value}));}})
        ),
        React.createElement("div",{style:{marginBottom:18}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:8}},"Precio"),
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
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},"Descripción"),
          React.createElement("textarea",{className:"fi",rows:4,placeholder:"Describí tu artículo...",style:{resize:"vertical"},value:form.desc,onChange:function(e){setForm(Object.assign({},form,{desc:e.target.value}));}})
        ),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},"Ubicación"),
            React.createElement("input",{className:"fi",placeholder:"Ciudad o Barrio",value:form.loc,onChange:function(e){setForm(Object.assign({},form,{loc:e.target.value}));}})
          ),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},"WhatsApp *"),
            React.createElement("input",{className:"fi",placeholder:"388...",inputMode:"numeric",value:form.phone,onChange:function(e){setForm(Object.assign({},form,{phone:e.target.value.replace(/\D/g,"")}));}})
          )
        ),
        React.createElement("div",{style:{marginBottom:32}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},"Fotos ("+form.files.length+"/8)"),
          React.createElement("label",{style:{display:"block",border:"2px dashed var(--color-border)",borderRadius:12,padding:"30px",textAlign:"center",cursor:"pointer",background:"var(--color-main-bg)", transition:"border .2s"}},
            React.createElement("div",{style:{fontSize:32,marginBottom:8}},"📷"),
            React.createElement("div",{style:{fontSize:14,color:"var(--color-text-muted)",fontWeight:600}},"Haz clic para agregar fotos"),
            React.createElement("input",{type:"file",accept:"image/*",multiple:true,style:{display:"none"},onChange:handleFiles})
          ),
          form.previews.length>0&&React.createElement("div",{className:"ipg", style:{marginTop: 16}},
            form.previews.map(function(src,idx){
              return React.createElement("div",{key:idx,className:"ipi"},
                React.createElement("img",{src:src,alt:"foto"}),
                React.createElement("button",{className:"irb",onClick:function(){removeImg(idx);}},  "×")
              );
            })
          )
        ),
        pubMsg&&React.createElement("div",{style:{fontSize:14,fontWeight:600,marginBottom:20,textAlign:"center",padding:"12px",background:"var(--color-main-bg)",border:"1px solid var(--color-border)",borderRadius:10,color:"var(--color-text-main)"}},pubMsg),
        React.createElement("button",{className:"pb",style:{width:"100%",padding:18,fontSize:16,borderRadius:14,opacity:pubBusy?0.7:1},onClick:handlePublish,disabled:pubBusy},
          pubBusy?"⏳ Publicando...":"🚀 Publicar anuncio"
        )
      )
    ),

    currentView === "search" && React.createElement("div", {className:"page-container"},
      React.createElement("div", {style:{marginBottom:32}},
        React.createElement("h1", {style:{fontSize:28, fontWeight:800, color:"var(--color-text-main)"}}, 'Resultados para "', React.createElement("span", {style:{color:"var(--color-accent)"}}, search), '"'),
        React.createElement("div", {style:{fontSize:14, color:"var(--color-text-muted)", marginTop:8}}, searchResults.length + " clasificados encontrados")
      ),
      searchResults.length === 0 ? 
        React.createElement("div", {className:"es", style:{background:"var(--color-surface)", borderRadius:20, padding:60}}, "📭 No encontramos nada que coincida con tu búsqueda. Intenta con otras palabras.") :
        React.createElement("div", {style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}},
          searchResults.map(function(l){return React.createElement(ListingCard,{key:l.id,listing:l,onOpen:openListing});})
        )
    ),

    React.createElement("footer",{style:{background:"var(--color-hero-bg)",color:"var(--color-text-muted)",padding:"40px 20px 24px", marginTop:"auto"}},
      React.createElement("div",{style:{maxWidth:1200,margin:"0 auto"}},
        React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:40,marginBottom:32}},
          React.createElement("div",{style:{flex:"1 1 220px"}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14}},
              React.createElement("div",{style:{width:36,height:36,background:"var(--color-accent)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}},"🌵"),
              React.createElement("div",{style:{color:"var(--color-text-hero)",fontWeight:800,fontSize:15}},"Compra en Jujuy")
            ),
            React.createElement("p",{style:{fontSize:12,lineHeight:1.7,opacity:0.8}},"Clasificados gratuitos para toda la provincia de Jujuy, Argentina."),
            React.createElement("div",{style:{marginTop:16,display:"flex",gap:8}},
              ["var(--color-accent)","var(--color-surface-banner)","var(--color-search-bg)","var(--color-main-bg)"].map(function(c,i){return React.createElement("div",{key:i,style:{width:18,height:18,background:c,borderRadius:4,opacity:.8}});})
            )
          ),
          [{title:"Publicar",links:["Publicar GRATIS"]},{title:"Cuenta",links:["Mi Perfil"]},{title:"Ayuda",links:["Consejos de Seguridad"]}].map(function(col){
            return React.createElement("div",{key:col.title,style:{flex:"1 1 140px"}},
              React.createElement("div",{style:{color:"var(--color-text-hero)",fontWeight:700,fontSize:13,marginBottom:14,textTransform:"uppercase",letterSpacing:".8px"}},col.title),
              col.links.map(function(l){
                return React.createElement("a",{key:l,href:"#",style:{display:"block",color:"var(--color-text-muted)",opacity:0.8,textDecoration:"none",fontSize:12,marginBottom:8},
                  onMouseEnter:function(e){e.target.style.color="var(--color-accent)";e.target.style.opacity=1;},
                  onMouseLeave:function(e){e.target.style.color="var(--color-text-muted)";e.target.style.opacity=0.8;},
                  onClick:l==="Consejos de Seguridad"?function(e){e.preventDefault();setSecModal(true);}:l==="Mi Perfil"?function(e){e.preventDefault();openProfile();}:openPublish},l);
              })
            );
          })
        ),
        React.createElement("div",{style:{borderTop:"1px solid var(--color-search-bg)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}},
          React.createElement("div",{style:{fontSize:12,opacity:0.8}},"© 2024–2026 Compra en Jujuy. Todos los derechos reservados.")
        )
      )
    ),

    (currentView === "home" || currentView === "search") && React.createElement("button",{onClick:openPublish,
      style:{position:"fixed",bottom:28,right:28,background:"var(--color-accent)",color:"var(--color-text-hero)",border:"none",width:60,height:60,borderRadius:"50%",fontSize:24,cursor:"pointer",boxShadow:"0 8px 24px rgba(0,0,0,.2)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}
    },"✏️"),

    // DRAWER LATERAL DE FILTROS DINÁMICOS
    isFilterMenuOpen && React.createElement("div", null,
      React.createElement("div", { className: "drawer-overlay", onClick: () => setIsFilterMenuOpen(false) }),
      React.createElement("div", { className: "drawer" },
        React.createElement("div", { className: "drawer-header" },
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 800, margin: 0, color: "var(--color-text-main)" } }, "Filtros"),
          React.createElement("button", { onClick: () => setIsFilterMenuOpen(false), style: { background: "none", border: "none", fontSize: 28, cursor: "pointer", color: "var(--color-text-main)", lineHeight: 1 } }, "×")
        ),
        React.createElement("div", { className: "drawer-body" },
          React.createElement("div", { className: "filter-group" },
            React.createElement("label", { className: "filter-label" }, "Precio"),
            React.createElement("div", { style: { display: "flex", gap: 10 } },
              React.createElement("input", { type: "number", placeholder: "Mínimo", className: "filter-input", value: filters.precioMin || "", onChange: (e) => setFilters(Object.assign({}, filters, {precioMin: e.target.value})) }),
              React.createElement("input", { type: "number", placeholder: "Máximo", className: "filter-input", value: filters.precioMax || "", onChange: (e) => setFilters(Object.assign({}, filters, {precioMax: e.target.value})) })
            )
          ),
          renderDynamicFilters()
        ),
        React.createElement("div", { className: "drawer-footer" },
          React.createElement("button", { className: "pb", style: { width: "100%", padding: "14px", fontSize: "14px" }, onClick: () => setIsFilterMenuOpen(false) }, "Aplicar Filtros")
        )
      )
    ),

    // Modales de UI Restantes
    deleteTarget && React.createElement("div",{className:"ov",onClick:function(e){if(e.target===e.currentTarget)setDeleteTarget(null);}},
      React.createElement("div",{className:"md",style:{maxWidth:400,textAlign:"center",padding:"40px 32px"}},
        React.createElement("div",{style:{fontSize:48,marginBottom:16}},"🗑️"),
        React.createElement("h3",{style:{fontSize:20,fontWeight:800,color:"var(--color-text-main)",marginBottom:12}},"¿Eliminar anuncio?"),
        React.createElement("p",{style:{fontSize:14,color:"var(--color-text-muted)",marginBottom:24,lineHeight:1.6}},"Esta acción no se puede deshacer. Tu clasificado será borrado permanentemente de la plataforma."),
        React.createElement("div",{style:{display:"flex",gap:12,justifyContent:"center"}},
          React.createElement("button",{onClick:function(){setDeleteTarget(null);},
            style:{flex:1,background:"var(--color-main-bg)",color:"var(--color-text-main)",border:"none",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}},
            "Cancelar"
          ),
          React.createElement("button",{onClick:confirmDelete,
            style:{flex:1,background:"var(--color-accent)",color:"var(--color-text-hero)",border:"none",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 16px rgba(0,0,0,.15)",transition:"transform .2s"}},
            "Sí, eliminar"
          )
        )
      )
    ),

    authModal && React.createElement("div",{className:"ov",onClick:function(e){if(e.target===e.currentTarget){setAuthModal(false);setAuthMsg("");}}},
      React.createElement("div",{className:"md",style:{maxWidth:440}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"var(--color-text-main)"}},authMode==="login"?"👤 Iniciar sesión":"✨ Crear cuenta"),
            React.createElement("div",{style:{fontSize:12,color:"var(--color-text-muted)",marginTop:3}},authMode==="login"?"Ingresá con tu email y contraseña":"Registrate gratis para publicar")
          ),
          React.createElement("button",{onClick:function(){setAuthModal(false);setAuthMsg("");},style:{background:"var(--color-main-bg)",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit",color:"var(--color-text-main)"}},"×")
        ),
        React.createElement("div",{style:{display:"flex",background:"var(--color-main-bg)",borderRadius:12,padding:4,marginBottom:24}},
          ["login","register"].map(function(m){
            return React.createElement("button",{key:m,onClick:function(){setAuthMode(m);setAuthMsg("");},
              style:{flex:1,padding:"10px",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                background:authMode===m?"var(--color-surface)":"transparent",color:authMode===m?"var(--color-text-main)":"var(--color-text-muted)",
                boxShadow:authMode===m?"0 2px 8px rgba(0,0,0,.04)":"none"}},
              m==="login"?"Iniciar sesión":"Registrarse"
            );
          })
        ),
        ["Email","Contraseña",authMode==="register"?"Confirmar contraseña":null].filter(Boolean).map(function(label){
          const key=label==="Email"?"email":label==="Contraseña"?"password":"confirm";
          const type=key==="email"?"email":"password";
          return React.createElement("div",{key:label,style:{marginBottom:18}},
            React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--color-text-muted)",marginBottom:6}},label),
            React.createElement("input",{className:"fi",type:type,value:authForm[key],onChange:function(e){setAuthForm(Object.assign({},authForm,{[key]:e.target.value}));}})
          );
        }),
        authMsg&&React.createElement("div",{style:{fontSize:13,fontWeight:600,marginBottom:16,textAlign:"center",padding:"10px",background:"var(--color-main-bg)",border:"1px solid var(--color-border)",borderRadius:8,color:"var(--color-text-main)"}},authMsg),
        React.createElement("button",{className:"pb",style:{width:"100%",padding:16,fontSize:15,borderRadius:12,opacity:authBusy?0.7:1},onClick:handleAuth,disabled:authBusy},
          authBusy?"⏳ Procesando...":authMode==="login"?"Ingresar":"Crear cuenta"
        )
      )
    ),

    secModal&&React.createElement("div",{className:"ov",onClick:function(e){if(e.target===e.currentTarget)setSecModal(false);}},
      React.createElement("div",{className:"md",style:{maxWidth:640}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:20,fontWeight:800,color:"var(--color-text-main)"}},"🛡️ Consejos de Seguridad"),
            React.createElement("div",{style:{fontSize:12,color:"var(--color-text-muted)",marginTop:3}},"Leé esto antes de comprar o vender")
          ),
          React.createElement("button",{onClick:function(){setSecModal(false);},style:{background:"var(--color-main-bg)",border:"none",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:18,fontFamily:"inherit",color:"var(--color-text-main)"}},"×")
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
    React.createElement("div",{style:{height:160,background:"var(--color-main-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,position:"relative",overflow:"hidden"}},
      img?React.createElement("img",{src:img,style:{width:"100%",height:"100%",objectFit:"cover"}}):React.createElement("span",null,cat?cat.icon:"📦"),
      React.createElement("span",{style:{position:"absolute",top:10,left:10,background:"var(--color-accent)",color:"var(--color-text-hero)",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6}},"🔥 "+(l.views||0)+" visitas"),
      cat&&React.createElement("span",{style:{position:"absolute",top:10,right:10,background:"var(--color-hero-bg)",color:"var(--color-text-hero)",fontSize:10,fontWeight:600,padding:"4px 8px",borderRadius:6}},cat.label)
    ),
    React.createElement("div",{style:{padding:"14px 16px", flex:1, display:"flex", flexDirection:"column"}},
      React.createElement("div",{style:{fontSize:14,fontWeight:700,color:"var(--color-text-main)",marginBottom:6,lineHeight:1.35}},l.title),
      React.createElement("div",{style:{fontSize:18,fontWeight:900,color:"var(--color-accent)",marginBottom:10, marginTop:"auto"}},l.price_label||"Consultar"),
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between"}},
        React.createElement("span",{style:{fontSize:11,color:"var(--color-text-muted)"}},"📍 "+(l.location||"Jujuy")),
        React.createElement("span",{style:{fontSize:11,color:"var(--color-text-muted)"}},"🕐 "+timeAgo(l.created_at))
      )
    )
  );
}

function AdBanner(){
  return React.createElement("div",{className:"ab",style:{background:"var(--color-surface-banner)"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:16}},
      React.createElement("div",{style:{fontSize:36}},"🎯"),
      React.createElement("div",null,
        React.createElement("div",{style:{color:"var(--color-text-hero)",fontWeight:700,fontSize:16}},"Adquirí tu espacio publicitario. Escribinos!"),
        React.createElement("div",{style:{color:"var(--color-surface)",opacity:0.8,fontSize:12,marginTop:2}},"Impulsá tu marca en Compra en Jujuy")
      )
    ),
    React.createElement("a",{
      href:"https://wa.me/5493886108072?text=Hola,%20me%20interesa%20adquirir%20un%20espacio%20publicitario",
      target:"_blank",
      rel:"noopener noreferrer"
    },
      React.createElement("button",{className:"ac"},"Contactar")
    )
  );

}function SecTitle(props){
  return React.createElement("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:props.sub?4:22}},
    React.createElement("div",null,
      React.createElement("div",{style:{fontSize:22,fontWeight:800,color:"var(--color-text-main)"}},props.title),
      props.sub&&React.createElement("div",{style:{fontSize:13,color:"var(--color-text-muted)",marginBottom:22}},props.sub)
    ),
    props.link&&React.createElement("a",{href:"#",style:{fontSize:13,color:"var(--color-accent)",fontWeight:600,textDecoration:"none",marginTop:4,whiteSpace:"nowrap"}},props.link)
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));