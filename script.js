// CONFIGURACIÓN RÁPIDA: cambia aquí el enlace de Culqi y el número de WhatsApp.
const CULQI_PAYMENT_LINK = "https://express.culqi.com/pago/F7BA793F86";
const WHATSAPP_NUMBER = "51947227596";

// CATÁLOGO: precios, textos, categorías e imágenes se editan en este arreglo.
const PRODUCTS = [
  {id:'lucuma-mani',name:'Lúcuma & Maní',category:'proteicas',label:'ISO Whey',desc:'Lúcuma peruana y maní en una barra con 20 g de proteína.',price:13.50,bg:'#f2cf98',image:'./lucuma_y_mani_73gr.png'},
  {id:'menta-chocolate',name:'Menta & Chocolate',category:'proteicas',label:'ISO Whey',desc:'Cacao intenso con un final fresco y 20 g de proteína.',price:13.50,bg:'#f0c987',image:'./menta_y_chocolate.png'},
  {id:'cacao-cashew',name:'Cacao & Cashew',category:'proteicas',label:'Plant-Based',desc:'Chocolate profundo, cashews y 10 g de proteína vegetal.',price:13.50,bg:'#e8bd7d',image:'./cacao_y_cashew.png'},
  {id:'maras-chocolate',name:'Sal de Maras & Chocolate',category:'proteicas',label:'Plant-Based',desc:'El balance irresistible entre cacao y sal de Maras.',price:13.50,bg:'#f3d9ad',image:'./saldemaras_y_chocolate.png'},
  {id:'maca-lucuma-cacao',name:'Maca, Lúcuma & Cacao',category:'superfoods',label:'Superfoods',desc:'Tres superfoods peruanos reunidos en una barra práctica.',price:12.50,bg:'#e5a85c',image:'./maca_lucuma_y_cacao.png'},
  {id:'mini-iso-whey',name:'Mini ISO Whey',category:'mini',label:'Mini',desc:'Lúcuma y maní: tamaño práctico con 7 g de proteína.',price:8.50,bg:'#f6dfb8',image:'./lucuma_y_mani.png'}
];

const $ = (selector, scope=document) => scope.querySelector(selector);
const $$ = (selector, scope=document) => [...scope.querySelectorAll(selector)];
const money = value => `S/ ${value.toFixed(2)}`;
let cart = JSON.parse(localStorage.getItem('vitabars_cart') || '[]');
let toastTimer;

function renderProducts(filter='all') {
  const items = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  $('#productGrid').innerHTML = items.map(p => `
    <article class="product-card" style="--product-bg:${p.bg};--pack:${p.pack};--pack-text:${p.text}">
      <div class="product-visual"><span class="product-tag">${p.label}</span><img class="product-photo" src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><p>${p.desc}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-to-cart" data-id="${p.id}" aria-label="Agregar ${p.name} al carrito">+</button></div></div>
    </article>`).join('');
}

function saveCart(){localStorage.setItem('vitabars_cart',JSON.stringify(cart));renderCart()}
function addToCart(id){const item=cart.find(i=>i.id===id);item?item.qty++:cart.push({id,qty:1});saveCart();showToast('Agregado a tu carrito');openDrawer()}
function updateQty(id,change){const item=cart.find(i=>i.id===id);if(!item)return;item.qty+=change;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);saveCart()}
function removeFromCart(id){cart=cart.filter(i=>i.id!==id);saveCart();showToast('Producto eliminado')}
function cartData(){return cart.map(i=>({...PRODUCTS.find(p=>p.id===i.id),qty:i.qty})).filter(i=>i.id)}
function cartSubtotalValue(){return cartData().reduce((sum,i)=>sum+i.price*i.qty,0)}
function shippingCost(){const subtotal=cartSubtotalValue();return subtotal===0?0:(subtotal>100?0:10)}
function cartTotal(){return cartSubtotalValue()+shippingCost()}

function renderCart(){
  const data=cartData(),count=data.reduce((s,i)=>s+i.qty,0),subtotal=cartSubtotalValue(),shipping=shippingCost(),total=cartTotal();
  $('.cart-count').textContent=count;$('#drawerCount').textContent=`(${count})`;$('#cartEmpty').hidden=data.length>0;$('#cartFooter').hidden=!data.length;
  $('#cartItems').innerHTML=data.map(i=>`<div class="cart-item"><div class="cart-item-visual" style="--bg:${i.bg}"><img src="${i.image}" alt=""></div><div><h4>${i.name}</h4><small>${money(i.price)} c/u</small><div class="qty-control"><button data-action="minus" data-id="${i.id}" aria-label="Restar uno">−</button><span>${i.qty}</span><button data-action="plus" data-id="${i.id}" aria-label="Sumar uno">+</button></div></div><div class="cart-item-side"><b>${money(i.price*i.qty)}</b><button class="remove-item" data-action="remove" data-id="${i.id}">Eliminar</button></div></div>`).join('');
  $('#cartSubtotal').textContent=money(subtotal);$('#cartShipping').textContent=shipping===0&&subtotal>0?'Gratis':money(shipping);$('#cartTotal').textContent=money(total);
}

function toggleOverlay(show){$('.overlay').hidden=!show;document.body.classList.toggle('no-scroll',show)}
function openDrawer(){$('.cart-drawer').classList.add('open');$('.cart-drawer').setAttribute('aria-hidden','false');toggleOverlay(true)}
function closeDrawer(){$('.cart-drawer').classList.remove('open');$('.cart-drawer').setAttribute('aria-hidden','true');toggleOverlay(false)}
function openModal(selector){closeDrawer();toggleOverlay(true);$(selector).classList.add('open');$(selector).setAttribute('aria-hidden','false')}
function closeModals(){$$('.modal').forEach(m=>{m.classList.remove('open');m.setAttribute('aria-hidden','true')});toggleOverlay(false)}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}

function whatsappUrl(){
  const data=cartData();
  const lines=data.length?data.map(i=>`• ${i.name} x${i.qty} — ${money(i.price*i.qty)}`).join('\n'):'• Aún no elegí productos';
  const shipping=shippingCost()===0&&data.length?'Gratis':money(shippingCost());
  const msg=`¡Hola Vitabars! Quiero hacer un pedido:\n\n${lines}\n\nSubtotal: ${money(cartSubtotalValue())}\nEnvío: ${shipping}\n*Total: ${money(cartTotal())}*\n\n¿Me ayudan a coordinar la entrega?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
function openWhatsApp(){window.open(whatsappUrl(),'_blank','noopener')}
function openCulqi(){
  if(!CULQI_PAYMENT_LINK || CULQI_PAYMENT_LINK.includes('AQUI_PEGO')){showToast('Configura primero el enlace de Culqi');return}
  window.open(CULQI_PAYMENT_LINK,'_blank','noopener');
}

function validateField(input,test,message){const ok=test(input.value.trim());input.classList.toggle('invalid',!ok);input.nextElementSibling.textContent=ok?'':message;return ok}
function refreshUserView(){const user=JSON.parse(localStorage.getItem('vitabars_session')||'null');$('#loggedOutView').hidden=!!user;$('#loggedInView').hidden=!user;if(user)$('#userName').textContent=user.name}

function openCheckout(){
  if(!cart.length){showToast('Agrega un producto antes de pagar');return}
  const data=cartData();const shipping=shippingCost();$('#checkoutItems').innerHTML=data.map(i=>`<div class="checkout-summary-item"><span>${i.qty}× ${i.name}</span><b>${money(i.qty*i.price)}</b></div>`).join('')+`<div class="checkout-summary-item"><span>Envío</span><b>${shipping===0?'Gratis':money(shipping)}</b></div>`;$('#checkoutTotal').textContent=money(cartTotal());openModal('.checkout-modal');
}

document.addEventListener('click',e=>{
  const add=e.target.closest('.add-to-cart');if(add)addToCart(add.dataset.id);
  const filter=e.target.closest('.filter');if(filter){$$('.filter').forEach(f=>f.classList.remove('active'));filter.classList.add('active');renderProducts(filter.dataset.filter)}
  const cartAction=e.target.closest('[data-action]');if(cartAction){const {action,id}=cartAction.dataset;if(action==='plus')updateQty(id,1);if(action==='minus')updateQty(id,-1);if(action==='remove')removeFromCart(id)}
});

$('.cart-button').addEventListener('click',openDrawer);$('.drawer-close').addEventListener('click',closeDrawer);$('.close-and-shop').addEventListener('click',()=>{closeDrawer();location.hash='productos'});$('.overlay').addEventListener('click',()=>{$('.cart-drawer').classList.contains('open')?closeDrawer():closeModals()});
$$('.modal-close').forEach(b=>b.addEventListener('click',closeModals));$('.user-button').addEventListener('click',()=>{refreshUserView();openModal('.auth-modal')});
$('#checkoutButton').addEventListener('click',openCheckout);$('#cartWhatsApp').addEventListener('click',openWhatsApp);$('#whatsappFloat').addEventListener('click',openWhatsApp);
$('#culqiPayment').addEventListener('click',openCulqi);

$('.menu-toggle').addEventListener('click',()=>{const open=$('.nav-menu').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',open)});$$('.nav-menu a').forEach(a=>a.addEventListener('click',()=>$('.nav-menu').classList.remove('open')));
$$('.auth-tab').forEach(tab=>tab.addEventListener('click',()=>{$$('.auth-tab').forEach(t=>t.classList.toggle('active',t===tab));$$('.auth-form').forEach(f=>f.classList.toggle('active',f.id.toLowerCase().startsWith(tab.dataset.tab)))}));

$('#registerForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#registerName'),email=$('#registerEmail'),pass=$('#registerPassword');const valid=[validateField(name,v=>v.length>=2,'Ingresa al menos 2 caracteres.'),validateField(email,v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'Ingresa un correo válido.'),validateField(pass,v=>v.length>=6,'Usa al menos 6 caracteres.')].every(Boolean);if(!valid)return;const user={name:name.value.trim(),email:email.value.trim().toLowerCase(),password:pass.value};localStorage.setItem('vitabars_user',JSON.stringify(user));localStorage.setItem('vitabars_session',JSON.stringify({name:user.name,email:user.email}));refreshUserView();showToast('¡Cuenta creada correctamente!')});
$('#loginForm').addEventListener('submit',e=>{e.preventDefault();const email=$('#loginEmail'),pass=$('#loginPassword');const basics=[validateField(email,v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'Ingresa un correo válido.'),validateField(pass,v=>v.length>=6,'Usa al menos 6 caracteres.')].every(Boolean);if(!basics)return;const user=JSON.parse(localStorage.getItem('vitabars_user')||'null');if(!user||user.email!==email.value.trim().toLowerCase()||user.password!==pass.value){showToast('Correo o contraseña incorrectos');return}localStorage.setItem('vitabars_session',JSON.stringify({name:user.name,email:user.email}));refreshUserView();showToast(`¡Bienvenido, ${user.name}!`)});
$('#logoutButton').addEventListener('click',()=>{localStorage.removeItem('vitabars_session');refreshUserView();showToast('Sesión cerrada')});

$$('.payment-option').forEach(option=>option.addEventListener('click',()=>{$$('.payment-option').forEach(o=>{o.classList.toggle('selected',o===option);$('i',o).textContent=o===option?'●':'○'})}));
$('#simulatePayment').addEventListener('click',()=>{const method=$('input[name="payment"]:checked').value;if(method==='WhatsApp'){openWhatsApp();return}if(['Crédito','Débito','Culqi'].includes(method)){openCulqi();return}showToast(`Pedido simulado confirmado · ${method}`);cart=[];saveCart();closeModals()});

const cookieChoice=localStorage.getItem('vitabars_cookies');if(!cookieChoice)setTimeout(()=>$('#cookieBanner').hidden=false,600);$$('[data-cookie]').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem('vitabars_cookies',b.dataset.cookie);$('#cookieBanner').hidden=true;showToast(b.dataset.cookie==='accepted'?'Preferencias guardadas':'Cookies rechazadas')}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});$$('.reveal').forEach(el=>observer.observe(el));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('.cart-drawer').classList.contains('open')?closeDrawer():closeModals()}});

renderProducts();renderCart();refreshUserView();
