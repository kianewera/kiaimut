const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
async function loadStore(){
  const [settingsRes, productsRes] = await Promise.all([fetch("/api/settings"),fetch("/api/products")]);
  const settings = await settingsRes.json(); const products = await productsRes.json();
  document.title = `${settings.storeName || "TOKODIGITAL"} — Toko Produk Digital`;
  document.getElementById("tagline").textContent = settings.tagline || "Temukan produk pilihan dari toko kami.";
  document.getElementById("count").textContent = `${products.length} produk`;
  const root = document.getElementById("products");
  if(!products.length){root.innerHTML='<div class="empty">Belum ada produk tersedia. Silakan cek kembali nanti.</div>';return;}
  root.innerHTML = products.map(p=>`<article class="product-card"><div class="product-image">${p.image?`<img src="${escapeAttr(p.image)}" alt="">`:"✦"}</div><div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||"Produk digital pilihan TOKODIGITAL.")}</p><div class="product-bottom"><span class="price">${rupiah(p.price)}</span><span class="stock">Stok: ${p.stock}</span></div></div></article>`).join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return escapeHtml(s);}
loadStore().catch(()=>{document.getElementById("products").innerHTML='<div class="empty">Produk belum dapat dimuat. Pastikan backend TOKODIGITAL sudah berjalan.</div>';});
