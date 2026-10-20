const $ = (selector) => document.querySelector(selector);
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100);
let cart = { items: [] };
let user = null;
let toastTimer;
let searchTimer;
let catalogVersion = 0;
const paths = {
  headphones: '<path d="M35 88V70a45 45 0 0 1 90 0v18" fill="none" stroke="#3e513e" stroke-width="14"/><rect x="24" y="76" width="29" height="54" rx="12" fill="#334833"/><rect x="107" y="76" width="29" height="54" rx="12" fill="#334833"/><path d="M35 78v43M125 78v43" stroke="#8b9a81" stroke-width="4"/>',
  keyboard: '<g transform="rotate(-8 80 80)"><rect x="12" y="49" width="136" height="72" rx="8" fill="#58604e"/><rect x="17" y="53" width="126" height="61" rx="5" fill="#aab09b"/><path d="M25 66h111M25 79h111M25 92h111" stroke="#d9ddc9" stroke-width="10" stroke-dasharray="8 4"/><rect x="51" y="102" width="57" height="7" rx="2" fill="#d9ddc9"/></g>',
  camera: '<rect x="25" y="45" width="110" height="62" rx="20" fill="#3d483e"/><circle cx="80" cy="76" r="25" fill="#1b2723"/><circle cx="80" cy="76" r="17" fill="#657e75"/><circle cx="80" cy="76" r="10" fill="#172a29"/><circle cx="84" cy="71" r="4" fill="#a8bbb5"/><circle cx="119" cy="66" r="3" fill="#d8f281"/><path d="M62 108v12h36v-12" stroke="#53634e" stroke-width="8" fill="none"/>',
  lamp: '<path d="M80 124V69l26-30" fill="none" stroke="#6b775a" stroke-width="8"/><ellipse cx="79" cy="128" rx="36" ry="8" fill="#465b3e"/><path d="m91 23 37 27-47 23Z" fill="#8b9b73"/><path d="m82 72 46-22" stroke="#e7e9ce" stroke-width="4"/>',
  speaker: '<rect x="40" y="27" width="80" height="112" rx="26" fill="#8e9a7b"/><rect x="47" y="34" width="66" height="98" rx="22" fill="#626e52"/><path d="M56 45h48M56 54h48M56 63h48M56 72h48M56 81h48M56 90h48M56 99h48M56 108h48M56 117h48" stroke="#a5b18e" stroke-width="3" stroke-dasharray="3 3"/><path d="M70 18v9h20v-9" stroke="#6b775d" stroke-width="4" fill="none"/>',
  monitor: '<path d="M50 132V66h27l27-27" stroke="#56664b" stroke-width="12" stroke-linejoin="round" fill="none"/><path d="m96 31 31 13-17 40-31-13Z" fill="#88977a"/><circle cx="78" cy="65" r="9" fill="#354b32"/><path d="M30 134h42" stroke="#354b32" stroke-width="10" stroke-linecap="round"/>',
};
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, body: options.body ? JSON.stringify(options.body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Something went wrong. Please try again.');
  return data;
}
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500); }
function errorAt(id, message = '') { $(id).textContent = message; $(id).hidden = !message; }
function showDialog(id) { $(id).showModal(); }
function updateCart(next) {
  cart = next;
  $('#cart-open').textContent = `Cart (${cart.items.reduce((sum, item) => sum + item.quantity, 0)})`;
  $('#cart-items').innerHTML = cart.items.length ? cart.items.map(item => `<article class="cart-item" aria-label="${escapeHTML(item.name)} in cart"><div><h3>${escapeHTML(item.name)}</h3><p>${money(item.price)} each</p><label>Qty <input aria-label="Quantity for ${escapeHTML(item.name)}" type="number" min="1" max="99" value="${item.quantity}" data-quantity="${item.productId}"></label></div><div class="cart-item-right"><strong>${money(item.lineTotal)}</strong><p><button class="remove-button" data-remove="${item.productId}" aria-label="Remove ${escapeHTML(item.name)}">Remove</button></p></div></article>`).join('') : '<div class="empty-state"><h3>Your cart is empty</h3><p>Good things are waiting in the collection.</p></div>';
  $('#cart-details').hidden = !cart.items.length;
  $('[data-testid="cart-subtotal"]').textContent = money(cart.subtotal || 0);
  $('[data-testid="cart-discount"]').textContent = `−${money(cart.discount || 0)}${cart.promoCode ? ' · SAVE10' : ''}`;
  $('[data-testid="cart-total"]').textContent = money(cart.total || 0);
}
function updateUser(next) { user = next; $('#login-open').textContent = user ? 'Sign out' : 'Sign in'; }
async function loadProducts() {
  const version = ++catalogVersion;
  $('#products').setAttribute('aria-busy', 'true');
  errorAt('#catalog-error');
  const params = new URLSearchParams({ search: $('#search').value, category: $('#category').value, sort: $('#sort').value });
  try {
    const data = await api(`/products?${params}`);
    if (version !== catalogVersion) return;
    $('#product-count').textContent = `${data.total} essentials`;
    $('#empty-products').hidden = data.products.length > 0;
    $('#products').innerHTML = data.products.map(p => `<article class="product-card" aria-label="${escapeHTML(p.name)}" data-testid="product-${escapeHTML(p.id)}"><div class="product-visual">${p.tag ? `<span class="product-tag">${escapeHTML(p.tag)}</span>` : ''}<svg viewBox="0 0 160 160" aria-hidden="true">${paths[p.icon] || paths.monitor}</svg></div><div class="product-info"><div><h3>${escapeHTML(p.name)}</h3><span class="category">${escapeHTML(p.category)}</span></div><span class="product-price">${money(p.price)}</span></div><p>${escapeHTML(p.description || '')}</p><button class="add-button" data-add="${escapeHTML(p.id)}" aria-label="Add ${escapeHTML(p.name)} to cart" ${p.stock === 0 ? 'disabled' : ''}>${p.stock === 0 ? 'Out of stock' : 'Add to cart'} <span aria-hidden="true">＋</span></button></article>`).join('');
  } catch (error) {
    if (version !== catalogVersion) return;
    $('#products').innerHTML = ''; $('#product-count').textContent = 'Collection unavailable';
    $('#empty-products').hidden = true;
    errorAt('#catalog-error', `${error.message} Change a filter to retry.`);
  } finally { if (version === catalogVersion) $('#products').setAttribute('aria-busy', 'false'); }
}
$('#search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadProducts, 180); });
$('#category').addEventListener('change', loadProducts);
$('#sort').addEventListener('change', loadProducts);
$('#clear-filters').addEventListener('click', () => { $('#search').value = ''; $('#category').value = 'All'; $('#sort').value = 'featured'; loadProducts(); });
$('#products').addEventListener('click', async event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  button.disabled = true;
  const quantity = (cart.items.find(i => i.productId === button.dataset.add)?.quantity || 0) + 1;
  try { updateCart(await api('/cart', { method: 'POST', body: { productId: button.dataset.add, quantity } })); toast('Added to your cart.'); }
  catch (error) { toast(error.message); }
  finally { button.disabled = false; }
});
$('#cart-open').addEventListener('click', async () => {
  errorAt('#cart-error'); showDialog('#cart-dialog');
  try { updateCart(await api('/cart')); } catch (error) { errorAt('#cart-error', error.message); }
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(`#${button.dataset.close}`).close()));
$('#cart-items').addEventListener('change', async event => {
  if (!event.target.matches('[data-quantity]')) return;
  errorAt('#cart-error');
  try { updateCart(await api('/cart', { method: 'POST', body: { productId: event.target.dataset.quantity, quantity: Number(event.target.value) } })); }
  catch (error) { updateCart(cart); errorAt('#cart-error', error.message); }
});
$('#cart-items').addEventListener('click', async event => {
  const button = event.target.closest('[data-remove]'); if (!button) return;
  errorAt('#cart-error');
  try { updateCart(await api(`/cart/${button.dataset.remove}`, { method: 'DELETE' })); }
  catch (error) { errorAt('#cart-error', error.message); }
});
$('#promo-form').addEventListener('submit', async event => {
  event.preventDefault(); errorAt('#cart-error');
  try { updateCart(await api('/cart/promo', { method: 'POST', body: { code: new FormData(event.target).get('code') } })); toast('SAVE10 applied. Enjoy 10% off.'); }
  catch (error) { errorAt('#cart-error', error.message); }
});
$('#login-open').addEventListener('click', async () => {
  if (user) {
    try { await api('/logout', { method: 'POST' }); updateUser(null); toast('You have signed out.'); }
    catch (error) { toast(error.message); }
  } else { errorAt('#login-error'); showDialog('#login-dialog'); }
});
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault(); errorAt('#login-error');
  const button = event.target.querySelector('button[type="submit"]'); button.disabled = true;
  try { const result = await api('/login', { method: 'POST', body: Object.fromEntries(new FormData(event.target)) }); updateUser(result.user); $('#login-dialog').close(); toast('Welcome back, Alex.'); event.target.reset(); }
  catch (error) { errorAt('#login-error', error.message); }
  finally { button.disabled = false; }
});
$('#checkout-open').addEventListener('click', () => {
  if (!user) { errorAt('#cart-error', 'Sign in before checkout. Close this cart and choose Sign in.'); return; }
  $('#cart-dialog').close(); errorAt('#checkout-error'); showDialog('#checkout-dialog');
});
$('#checkout-form').addEventListener('submit', async event => {
  event.preventDefault(); errorAt('#checkout-error');
  const button = event.target.querySelector('button[type="submit"]'); button.disabled = true;
  try {
    const { order } = await api('/orders', { method: 'POST', body: Object.fromEntries(new FormData(event.target)) });
    $('#checkout-dialog').close(); $('#order-id').textContent = order.id; $('#receipt').href = `/api/orders/${order.id}/receipt`;
    updateCart({ items: [], subtotal: 0, discount: 0, total: 0, promoCode: null }); event.target.reset(); showDialog('#success-dialog');
  } catch (error) { errorAt('#checkout-error', error.message); }
  finally { button.disabled = false; }
});
$('#reset').addEventListener('click', async () => {
  try { await api('/reset', { method: 'POST' }); updateUser(null); updateCart({ items: [] }); toast('Sandbox reset. A fresh start.'); }
  catch (error) { toast(error.message); }
});
async function init() {
  // Establish one cookie before starting parallel requests; otherwise first requests
  // could each create a different server session.
  try { updateUser((await api('/session')).user); updateCart(await api('/cart')); }
  catch (error) { toast(error.message); }
  await loadProducts();
}
init();
