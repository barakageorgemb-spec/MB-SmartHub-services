/* MB SmartHub Services. Set your Supabase project URL and anon key below. */
const SUPABASE_URL = "https://zjssnjjmuzgcddzgzxgv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r3V1WqHZQBfUf2U9lRMM4w_4r5xA66s";creating the Admin account in Authentication > Userscreating the Admin account in Authentication > Users.
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = (s) => document.querySelector(s);
const money = n => "TZS " + Number(n || 0).toLocaleString("en-US");
let products = [], cart = {}, lang = "sw", adminUser = null;
const translations = {
 sw:{welcome:"KARIBU MB SMARTHUB SERVICES",heroTitle:"Ubora wa kuku na bidhaa zake, kwa urahisi.",heroText:"Agiza kuku wa nyama, kuku wa mayai, mayai na nyama ya kuku.",shopNow:"Angalia bidhaa",ourProducts:"BIDHAA ZETU",shopTitle:"Chagua unachohitaji",yourOrder:"ODA YAKO",cartTitle:"Kikapu cha bidhaa",emptyCart:"Bado hujaongeza bidhaa.",total:"Jumla",checkout:"MALIZIA ODA",detailsTitle:"Taarifa za mteja",fullName:"Jina kamili",phone:"Namba ya simu",area:"Eneo / Mtaa",address:"Anuani ya kufikishia",deliveryDate:"Tarehe ya kuhitaji bidhaa",notes:"Maelezo ya ziada (si lazima)",placeOrder:"Tuma oda",track:"FUATILIA ODA",trackTitle:"Angalia hali ya oda",orderNumber:"Namba ya oda",trackBtn:"Fuatilia",payment:"MALIPO",paymentTitle:"Lipa kwa Vodacom",payInstruction:"Tumia Lipa Namba iliyo hapa. Thibitisha malipo na biashara kabla ya kutuma fedha.",manualPayment:"Kwa sasa malipo yanathibitishwa na Admin; mfumo huu hauunganishwi moja kwa moja na Vodacom.",feedback:"MAONI YA WATEJA",feedbackTitle:"Tupe maoni yako",yourName:"Jina lako",rating:"Alama (1 hadi 5)",comment:"Maoni",sendFeedback:"Tuma maoni",contact:"WASILIANA NASI",contactTitle:"Tuko tayari kukuhudumia",add:"Ongeza",outOfStock:"Bidhaa imeisha",loading:"Inapakia bidhaa...",noProducts:"Hakuna bidhaa kwa sasa.",orderSuccess:"Oda yako imepokelewa! Namba ya oda:",emptyWarning:"Tafadhali ongeza bidhaa kwenye kikapu kwanza.",setup:"Tovuti bado haijaunganishwa na database. Fuata maelekezo ya README."},
 en:{welcome:"WELCOME TO MB SMARTHUB SERVICES",heroTitle:"Quality poultry and poultry products, made easy.",heroText:"Order broiler chickens, layer chickens, eggs and chicken meat.",shopNow:"Browse products",ourProducts:"OUR PRODUCTS",shopTitle:"Choose what you need",yourOrder:"YOUR ORDER",cartTitle:"Shopping cart",emptyCart:"You have not added any products yet.",total:"Total",checkout:"CHECKOUT",detailsTitle:"Customer details",fullName:"Full name",phone:"Phone number",area:"Area / Street",address:"Delivery address",deliveryDate:"Required delivery date",notes:"Additional notes (optional)",placeOrder:"Submit order",track:"ORDER TRACKING",trackTitle:"Check your order status",orderNumber:"Order number",trackBtn:"Track order",payment:"PAYMENT",paymentTitle:"Pay with Vodacom",payInstruction:"Use the Lipa Namba below. Confirm payment details with the business before sending money.",manualPayment:"Payments are currently verified by the Admin; this website is not directly integrated with Vodacom.",feedback:"CUSTOMER FEEDBACK",feedbackTitle:"Share your feedback",yourName:"Your name",rating:"Rating (1 to 5)",comment:"Comment",sendFeedback:"Send feedback",contact:"CONTACT US",contactTitle:"We are ready to serve you",add:"Add",outOfStock:"Out of stock",loading:"Loading products...",noProducts:"No products available yet.",orderSuccess:"Your order was received! Order number:",emptyWarning:"Please add products to your cart first.",setup:"The website is not connected to a database yet. Follow the README instructions."}
};
function msg(el,text,type=""){el.textContent=text;el.className="message "+type}
function tr(k){return translations[lang][k]||k}
function setLanguage(){document.documentElement.lang=lang;document.querySelectorAll("[data-i18n]").forEach(e=>e.textContent=tr(e.dataset.i18n));$("#languageBtn").textContent=lang==="sw"?"English":"Kiswahili";renderProducts();renderCart()}
$("#languageBtn").addEventListener("click",()=>{lang=lang==="sw"?"en":"sw";setLanguage()});
$("#year").textContent=new Date().getFullYear();
function categoryName(c){const names={broiler:lang==="sw"?"Kuku wa nyama (Broiler)":"Broiler chickens",layers:lang==="sw"?"Kuku wa mayai":"Layer chickens",eggs:lang==="sw"?"Mayai":"Eggs",chicken_meat:lang==="sw"?"Nyama ya kuku":"Chicken meat"};return names[c]||c}
async function loadProducts(){
 if(!db){$("#productGrid").innerHTML='<p class="muted">'+tr("setup")+'</p>';return}
 const {data,error}=await db.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
 if(error){$("#productGrid").textContent=error.message;return} products=data||[];renderProducts();
}
function renderProducts(){
 const grid=$("#productGrid");if(!products.length){grid.innerHTML='<p class="muted">'+tr("noProducts")+'</p>';return}
 grid.innerHTML=products.map(p=>`<article class="product-card"><span class="eyebrow">${categoryName(p.category)}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||"")}</p><div class="price">${money(p.price)}</div><div class="stock">${lang==="sw"?"Stock iliyobaki":"Stock remaining"}: ${p.stock}</div><button class="primary" data-add="${p.id}" ${p.stock<1?"disabled":""}>${p.stock<1?tr("outOfStock"):tr("add")}</button></article>`).join("");
 grid.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.add;cart[id]=(cart[id]||0)+1;renderCart()}));
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderCart(){
 const entries=Object.entries(cart).filter(([id,q])=>q>0);$("#cartCount").textContent=entries.reduce((s,[,q])=>s+q,0);
 if(!entries.length){$("#cartItems").innerHTML='<p class="muted">'+tr("emptyCart")+'</p>';$("#cartTotal").textContent=money(0);return}
 let total=0;$("#cartItems").innerHTML=entries.map(([id,q])=>{const p=products.find(x=>x.id===id);if(!p)return "";total+=p.price*q;return `<div class="cart-line"><span>${escapeHtml(p.name)}<br><small>${money(p.price)} × ${q}</small></span><span class="cart-controls"><button data-minus="${id}" aria-label="Decrease">−</button>${q}<button data-plus="${id}" aria-label="Increase">+</button></span></div>`}).join("");
 $("#cartTotal").textContent=money(total);
 $("#cartItems").querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>{const id=b.dataset.minus;cart[id]--;if(cart[id]<=0)delete cart[id];renderCart()});
 $("#cartItems").querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>{const id=b.dataset.plus;cart[id]++;renderCart()});
}
$("#checkoutForm").addEventListener("submit",async e=>{
 e.preventDefault();const out=$("#checkoutMessage");if(!db){msg(out,tr("setup"),"error");return}
 const items=Object.entries(cart).map(([product_id,quantity])=>({product_id,quantity}));
 if(!items.length){msg(out,tr("emptyWarning"),"error");return}
 const f=Object.fromEntries(new FormData(e.currentTarget).entries());
 const {data,error}=await db.rpc("place_customer_order",{p_customer:f,p_items:items});
 if(error){msg(out,error.message,"error");return}
 msg(out,tr("orderSuccess")+" "+data.order_number,"success");cart={};renderCart();e.currentTarget.reset();loadProducts();
});
$("#trackForm").addEventListener("submit",async e=>{
 e.preventDefault();const out=$("#trackResult");if(!db){msg(out,tr("setup"),"error");return}
 const f=Object.fromEntries(new FormData(e.currentTarget).entries());
 const {data,error}=await db.rpc("track_customer_order",{p_order_number:f.order_number.trim(),p_phone:f.phone.trim()});
 if(error||!data){msg(out,lang==="sw"?"Oda haijapatikana. Hakikisha namba ya oda na simu ni sahihi.":"Order not found. Check the order number and phone number.","error");return}
 const d=data;msg(out,`${lang==="sw"?"Hali":"Status"}: ${d.status}\n${lang==="sw"?"Malipo":"Payment"}: ${d.payment_status}\n${lang==="sw"?"Jumla":"Total"}: ${money(d.total)}\n${lang==="sw"?"Tarehe ya kuwasilisha":"Delivery date"}: ${d.delivery_date||"-"}`,"success");
});
$("#reviewForm").addEventListener("submit",async e=>{
 e.preventDefault();const out=$("#reviewMessage");if(!db){msg(out,tr("setup"),"error");return}
 const f=Object.fromEntries(new FormData(e.currentTarget).entries());f.rating=Number(f.rating);
 const {error}=await db.from("reviews").insert(f);if(error){msg(out,error.message,"error");return}
 msg(out,lang==="sw"?"Asante! Maoni yako yatasomwa kabla ya kuonekana.":"Thank you! Your review will be checked before publication.","success");e.currentTarget.reset();
});
$("#adminLoginForm").addEventListener("submit",async e=>{
 e.preventDefault();const out=$("#adminMessage");if(!db){msg(out,tr("setup"),"error");return}
 const f=Object.fromEntries(new FormData(e.currentTarget).entries());const {data,error}=await db.auth.signInWithPassword({email:f.email,password:f.password});
 if(error){msg(out,error.message,"error");return}adminUser=data.user;await checkAdmin();
});
async function checkAdmin(){
 const {data,error}=await db.from("admin_users").select("user_id").eq("user_id",adminUser.id).maybeSingle();
 if(error||!data){await db.auth.signOut();adminUser=null;msg($("#adminMessage"),"This account is not registered as an administrator.","error");return}
 $("#adminPanel").hidden=false;$("#adminLoginForm").hidden=true;msg($("#adminMessage"),"Admin signed in.","success");loadAdmin();
}
$("#logoutBtn").onclick=async()=>{await db.auth.signOut();adminUser=null;$("#adminPanel").hidden=true;$("#adminLoginForm").hidden=false};
async function loadAdmin(){await Promise.all([loadAdminOrders(),loadAdminProducts(),loadAdminReviews()])}
async function loadAdminOrders(){
 const box=$("#adminOrders");const {data,error}=await db.from("orders").select("id,order_number,customer_name,phone,total,status,payment_status,delivery_date,created_at").order("created_at",{ascending:false}).limit(100);
 if(error){box.textContent=error.message;return}if(!data.length){box.textContent="No orders yet.";return}
 box.innerHTML=`<div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Delivery</th></tr></thead><tbody>${data.map(o=>`<tr><td>${escapeHtml(o.order_number)}</td><td>${escapeHtml(o.customer_name)}<br>${escapeHtml(o.phone)}</td><td>${money(o.total)}</td><td><select data-status="${o.id}">${["pending","confirmed","processing","ready","delivered","cancelled"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}</select></td><td><select data-payment="${o.id}">${["unpaid","pending_verification","paid","refunded"].map(s=>`<option ${o.payment_status===s?"selected":""}>${s}</option>`).join("")}</select></td><td><input data-date="${o.id}" type="date" value="${o.delivery_date||""}"></td></tr>`).join("")}</tbody></table></div>`;
 box.querySelectorAll("[data-status]").forEach(s=>s.onchange=()=>updateOrder(s.dataset.status,{status:s.value}));
 box.querySelectorAll("[data-payment]").forEach(s=>s.onchange=()=>updateOrder(s.dataset.payment,{payment_status:s.value}));
 box.querySelectorAll("[data-date]").forEach(s=>s.onchange=()=>updateOrder(s.dataset.date,{delivery_date:s.value||null}));
}
async function updateOrder(id,patch){const {error}=await db.from("orders").update(patch).eq("id",id);if(error)alert(error.message);else loadAdminOrders()}
async function loadAdminProducts(){
 const box=$("#adminProducts");const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});
 if(error){box.textContent=error.message;return}
 box.innerHTML=data.map(p=>`<div class="admin-item"><span><strong>${escapeHtml(p.name)}</strong><br><small>${categoryName(p.category)} · ${money(p.price)} · Stock ${p.stock}</small></span><span><button class="outline" data-edit="${p.id}">Edit</button><button class="outline" data-active="${p.id}" data-value="${p.active}">${p.active?"Deactivate":"Activate"}</button></span></div>`).join("");
 box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const p=data.find(x=>x.id===b.dataset.edit);Object.entries({id:p.id,name:p.name,category:p.category,price:p.price,stock:p.stock,description:p.description||""}).forEach(([k,v])=>$("#productForm").elements[k].value=v);$("#productForm").scrollIntoView({behavior:"smooth"})});
 box.querySelectorAll("[data-active]").forEach(b=>b.onclick=async()=>{const {error}=await db.from("products").update({active:b.dataset.value!=="true"}).eq("id",b.dataset.active);if(error)alert(error.message);else{loadAdminProducts();loadProducts()}});
}
$("#productForm").addEventListener("submit",async e=>{
 e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget).entries());const id=f.id;delete f.id;f.price=Number(f.price);f.stock=Number(f.stock);f.active=true;
 const result=id?await db.from("products").update(f).eq("id",id):await db.from("products").insert(f);
 if(result.error){alert(result.error.message);return}e.currentTarget.reset();loadAdminProducts();loadProducts();
});
async function loadAdminReviews(){
 const box=$("#adminReviews");const {data,error}=await db.from("reviews").select("*").order("created_at",{ascending:false}).limit(100);
 if(error){box.textContent=error.message;return}
 box.innerHTML=data.map(r=>`<div class="admin-item"><span><strong>${escapeHtml(r.customer_name)} · ${r.rating}/5</strong><br>${escapeHtml(r.comment)}<br><small>${r.approved?"Approved":"Pending"}</small></span><button class="outline" data-review="${r.id}" data-approved="${r.approved}">${r.approved?"Hide":"Approve"}</button></div>`).join("");
 box.querySelectorAll("[data-review]").forEach(b=>b.onclick=async()=>{const {error}=await db.from("reviews").update({approved:b.dataset.approved!=="true"}).eq("id",b.dataset.review);if(error)alert(error.message);else loadAdminReviews()});
}
if(db){db.auth.getSession().then(({data})=>{if(data.session){adminUser=data.session.user;checkAdmin()}});loadProducts()}else{$("#productGrid").innerHTML='<p class="muted">'+tr("setup")+'</p>'}
