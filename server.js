require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    products: [
      { id: 1, name: "Produk Digital Contoh", description: "Ganti dengan produk digital milik tokomu.", price: 15000, stock: 10, image: "", active: true }
    ],
    settings: { storeName: "TOKODIGITAL", tagline: "Belanja produk digital jadi lebih mudah.", apiKey: "" }
  }, null, 2));
}
function readStore() { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
function writeStore(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: "tokodigital.sid",
  secret: process.env.SESSION_SECRET || "development-only-change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, "public")));

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin === true) return next();
  return res.status(401).json({ error: "Silakan login sebagai admin." });
}

app.get("/api/products", (req, res) => {
  const store = readStore();
  res.json(store.products.filter(p => p.active).map(({ id, name, description, price, stock, image }) =>
    ({ id, name, description, price, stock, image })));
});
app.get("/api/settings", (req, res) => {
  const s = readStore().settings;
  res.json({ storeName: s.storeName, tagline: s.tagline });
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
    return res.status(503).json({ error: "Admin belum disetel. Atur ADMIN_EMAIL dan ADMIN_PASSWORD_HASH di environment backend." });
  }
  const emailOk = String(email || "").toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
  const passOk = await bcrypt.compare(String(password || ""), process.env.ADMIN_PASSWORD_HASH);
  if (!emailOk || !passOk) return res.status(401).json({ error: "Email atau password salah." });
  req.session.admin = true;
  res.json({ ok: true });
});
app.post("/api/logout", (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get("/api/admin/me", requireAdmin, (req, res) => res.json({ ok: true }));
app.get("/api/admin/products", requireAdmin, (req, res) => res.json(readStore().products));
app.post("/api/admin/products", requireAdmin, (req, res) => {
  const store = readStore();
  const b = req.body || {};
  const product = {
    id: Date.now(), name: String(b.name || "").trim(), description: String(b.description || "").trim(),
    price: Math.max(0, Number(b.price) || 0), stock: Math.max(0, Number(b.stock) || 0),
    image: String(b.image || "").trim(), active: b.active !== false
  };
  if (!product.name) return res.status(400).json({ error: "Nama produk wajib diisi." });
  store.products.push(product); writeStore(store); res.json(product);
});
app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const store = readStore();
  const p = store.products.find(x => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Produk tidak ditemukan." });
  const b = req.body || {};
  p.name = String(b.name ?? p.name).trim();
  p.description = String(b.description ?? p.description).trim();
  p.price = Math.max(0, Number(b.price ?? p.price) || 0);
  p.stock = Math.max(0, Number(b.stock ?? p.stock) || 0);
  p.image = String(b.image ?? p.image).trim();
  p.active = b.active !== false;
  writeStore(store); res.json(p);
});
app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const store = readStore();
  store.products = store.products.filter(x => x.id !== Number(req.params.id));
  writeStore(store); res.json({ ok: true });
});
app.get("/api/admin/settings", requireAdmin, (req, res) => {
  const s = readStore().settings;
  res.json({ storeName: s.storeName, tagline: s.tagline, apiKeyConfigured: Boolean(s.apiKey) });
});
app.put("/api/admin/settings", requireAdmin, (req, res) => {
  const store = readStore();
  const b = req.body || {};
  if (b.storeName !== undefined) store.settings.storeName = String(b.storeName).trim().slice(0, 60);
  if (b.tagline !== undefined) store.settings.tagline = String(b.tagline).trim().slice(0, 140);
  if (b.apiKey !== undefined) store.settings.apiKey = String(b.apiKey).trim();
  writeStore(store);
  res.json({ ok: true, apiKeyConfigured: Boolean(store.settings.apiKey) });
});

app.listen(PORT, () => console.log(`TOKODIGITAL running on port ${PORT}`));
