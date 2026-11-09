# TOKODIGITAL — Website toko digital + admin

Starter website responsif dengan tema biru-putih modern, halaman toko, login admin, CRUD produk, pengaturan toko, dan kolom API Key.

## Penting sebelum digunakan
- Paket ini **bukan clone persis** dari dripclientofficial.dev; desainnya adalah tema original bernuansa toko digital modern.
- GitHub Pages hanya bisa meng-host file statis. Login admin, pengelolaan produk, dan penyimpanan API Key memerlukan backend Node.js.
- Jangan masukkan password atau API Key ke file HTML/JS dan jangan commit file `.env` ke GitHub.
- Kolom API Key hanya menyimpan nilai di file data backend. Hubungkan API milikmu ke backend sebelum menganggap integrasi API sudah berjalan.
- Jangan gunakan website ini untuk meminta PIN, OTP, password, atau kredensial dompet digital pelanggan. Website ini bukan situs resmi DANA.

## Menjalankan di komputer / hosting Node.js
1. Install Node.js 18 atau lebih baru.
2. Ekstrak ZIP ini.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`.
5. Isi `ADMIN_EMAIL` dengan email admin milikmu.
6. Buat hash password baru:
   ```bash
   node -e "require('bcryptjs').hash('PASSWORD_BARU_KAMU', 12).then(console.log)"
   ```
   Tempel hasilnya ke `ADMIN_PASSWORD_HASH` di `.env`. Jangan memakai password yang pernah dikirim di chat; buat password baru.
7. Isi `SESSION_SECRET` dengan string acak panjang.
8. Jalankan `npm start`.
9. Buka `http://localhost:3000`, lalu pilih Admin.

## Deploy
Deploy seluruh folder ini ke hosting yang mendukung Node.js (misalnya layanan aplikasi Node). Atur environment variables di dashboard hosting, bukan di GitHub. Jangan deploy hanya folder `public` jika ingin fitur admin bekerja.

## Data
Produk dan pengaturan disimpan di `data/store.json` yang dibuat otomatis saat server pertama berjalan. Pastikan hosting menyediakan persistent storage/volume agar data tidak hilang saat redeploy.

## Integrasi API
Form API Key menyimpan key di backend. Endpoint API spesifik belum dihubungkan karena membutuhkan dokumentasi API provider (URL, autentikasi, dan format request). Jangan pernah menaruh secret API key di browser.
