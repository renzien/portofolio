# Alif Rizki Portofolio

Website portofolio Android Apps dan Unity Games dengan admin pribadi, MongoDB, dan deployment Next.js di Vercel.

## Yang sudah tersedia

- Beranda responsif dengan tipografi editorial, navigasi melayang, dan gambar berefek liquid mengikuti kursor.
- Loading screen orisinal **Tiny World**: robot pixel melompati kubus, progress bar, dan transisi masuk. Muncul saat halaman publik dibuka/reload, bisa dilewati dengan tombol atau Escape, serta mengikuti preferensi gerakan terbatas. Intro normal sekitar 2–3 detik, memeriksa gambar hero dan font, dan memiliki batas tunggu 5 detik. Navigasi antarbagian dan halaman admin tidak memutar intro.
- Galeri dengan filter Android Apps / Unity Games.
- Android: ikon download dan GitHub. Unity: ikon play dan download. Tautan terbuka di tab baru.
- Profil, bio, keahlian, kontak email, GitHub, LinkedIn, dua gambar beranda, judul, dan efek liquid bisa diedit.
- Admin `/admin`: tambah, edit, hapus, urutkan proyek, simpan draft, dan publikasikan.
- Menu **Akun & keamanan** untuk mengubah email login dan password dengan konfirmasi password saat ini. Semua sesi lama dicabut setelah perubahan.
- Upload JPG/PNG/WebP sampai 3 MB; gambar dioptimalkan menjadi WebP dan disimpan di MongoDB.
- Akun admin di MongoDB, hash password scrypt, sesi acak dengan cookie HttpOnly/Secure/SameSite, pemeriksaan origin, dan pembatasan percobaan login.
- Akun awal pribadi disiapkan lewat seed lokal. Tidak ada endpoint pendaftaran publik atau bypass admin.

## Mulai di komputer

Gunakan **Node.js 24 LTS** dan npm. Jalankan perintah di folder yang berisi `package.json`.

```bash
npm ci
npm run dev
```

Buka URL yang dicetak terminal, biasanya `http://127.0.0.1:3000`.

Tanpa `MONGODB_URI`, website menampilkan **pratinjau proyek contoh**. Login dan penyimpanan belum aktif. Konten contoh bukan klaim proyek nyata milik Alif. Setelah MongoDB tersambung, galeri mengambil data database dan awalnya kosong sampai kamu menambah proyek.

## Hubungkan MongoDB dan buat admin

1. Buat cluster di [MongoDB Atlas](https://www.mongodb.com/atlas). Buat database user khusus dengan hak `readWrite` untuk database `alif_portfolio`.
2. Di Network Access, izinkan alamat IP komputer yang digunakan untuk membuat admin, dan akses keluar deployment Vercel. Sesuaikan daftar IP dengan konfigurasi jaringan Vercel yang kamu gunakan. Alamat IP keluar serverless biasa bisa berubah; lihat [panduan koneksi database Vercel](https://vercel.com/guides/how-to-allowlist-deployment-ip-address).
3. Pilih **Connect → Drivers → Node.js**, salin connection string MongoDB. Encode karakter khusus dalam username/password URI sesuai [dokumentasi MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/).
4. Salin `.env.example` menjadi `.env.local`.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env.local
   ```

5. Edit `.env.local`:

   ```dotenv
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=alif_portfolio
   APP_URL=http://127.0.0.1:3000
   ADMIN_EMAIL=alifrizki1011@gmail.com
   ADMIN_PASSWORD=
   ```

   ZIP ini menyertakan `.admin-bootstrap.json` berisi email di atas dan **hash password yang kamu minta**. Biarkan `ADMIN_PASSWORD` kosong untuk menggunakan akun awal tersebut. Password asli tidak ditulis di source atau ZIP. File bootstrap hanya dibaca oleh seed lokal, sudah dikecualikan dari Git dan deploy Vercel; jangan unggah file tersebut secara manual ke repositori publik.

   Jika ingin memilih password awal lain, isi `ADMIN_PASSWORD` (10–256 karakter). Apabila mengambil source dari Git tanpa file bootstrap, isi sendiri `ADMIN_EMAIL` dan `ADMIN_PASSWORD`. Simpan connection string dan file `.env.local` secara privat.

6. Buat akun dan indeks database:

   ```bash
   npm run seed
   ```

   Perintah ini bisa dijalankan lagi tanpa mengganti akun/password yang sudah ada. Jika email admin sudah diganti lewat dashboard, seed menolak membuat akun tambahan dengan email lama. Seed **tidak** membuat atau mempublikasikan proyek contoh. Password yang tersimpan di database berupa hash.

7. Restart `npm run dev`, buka `/admin`, dan masuk dengan akun yang barusan dibuat.
8. Isi **Profil & kontak**, **Beranda & tampilan**, lalu tambah karya di **Karya & proyek**. Centang **Publikasikan di portofolio** untuk menampilkannya. Angka urutan yang lebih kecil tampil lebih dulu.
9. Setelah setup, file `.admin-bootstrap.json` tidak diperlukan saat website berjalan. Jika mengisi `ADMIN_PASSWORD` sendiri, hapus nilainya dari `.env.local` setelah selesai.

## Deploy ke Vercel

Source ini menggunakan Next.js App Router dan Node.js runtime, sehingga bisa langsung menggunakan preset Next.js di Vercel. Tidak memerlukan Cloudflare, Sites hosting, atau layanan penyimpanan tambahan.

1. Push isi folder proyek ini ke repositori GitHub milikmu. Sertakan `package-lock.json`; jangan sertakan `.admin-bootstrap.json`, `.env.local`, `node_modules`, atau `.next`.
2. Di [Vercel](https://vercel.com/new), pilih **Add New → Project**, lalu import repositori.
3. Pilih framework **Next.js**. Jika folder proyek ada di dalam repo yang lebih besar, atur **Root Directory** ke folder berisi `package.json`.
4. Gunakan Node.js **24.x**, install command `npm ci`, build command `npm run build`, output directory default Next.js.
5. Masukkan environment variables di Project Settings:

   | Variabel      | Nilai                                                            |
   | ------------- | ---------------------------------------------------------------- |
   | `MONGODB_URI` | Connection string Atlas milikmu; simpan sebagai secret/sensitive |
   | `MONGODB_DB`  | `alif_portfolio`                                                 |
   | `APP_URL`     | URL production lengkap, misalnya `https://alif-rizki.vercel.app` |

   `ADMIN_EMAIL` dan `ADMIN_PASSWORD` **tidak diperlukan di Vercel**: akun sudah dibuat oleh seed di MongoDB. Jangan gunakan awalan `NEXT_PUBLIC_` untuk rahasia database.

6. Deploy. Jika domain final baru diketahui setelah deploy pertama, isi/perbaiki `APP_URL` dan redeploy. Domain deployment otomatis `VERCEL_URL` juga dikenali untuk pemeriksaan origin; untuk custom domain isi `APP_URL` dengan custom domain yang digunakan.
7. Buka website dan `/admin`. Periksa login, simpan satu draft, publikasikan, dan buka tautan karya. Jika belum membuat admin, jalankan `npm run seed` dari komputermu ke database Atlas yang sama.

Untuk deployment preview, gunakan database terpisah bila kamu tidak ingin preview mengedit isi production. Environment variables Vercel berlaku setelah redeploy.

## Gambar, APK, dan game

- Upload admin menerima JPG/PNG/WebP, maksimal **3 MB per file** dan 25 megapiksel. Batas ini berada di bawah [batas payload Vercel Functions](https://vercel.com/docs/functions/limitations). Gambar diperkecil maksimal 1600 px, diubah menjadi WebP, dan metadata dibuang.
- Alternatifnya, tempel URL gambar HTTPS dari hosting yang mengizinkan hotlink. File gambar unggahan tersimpan di koleksi `media`, bukan filesystem server Vercel.
- Gambar yang diunggah bisa diakses publik melalui URL media. Jangan unggah gambar rahasia.
- **APK, ZIP, executable, dan build Unity tidak diunggah melalui admin ini.** Taruh build di GitHub Releases, itch.io, atau hosting file milikmu, kemudian masukkan tautan download/play di editor.
- Link play menuju halaman game WebGL/itch.io yang sudah di-host. Website ini tidak menjalankan build Unity di dalam iframe.
- URL yang kosong ditampilkan sebagai ikon nonaktif; tidak ada link palsu. GitHub/LinkedIn/email profil disembunyikan jika belum diisi.
- Efek liquid menggunakan SVG displacement di atas gambar. Gerakan dimatikan untuk `prefers-reduced-motion` dan perangkat sentuh dengan pointer kasar.

## Mengganti email atau password admin

1. Buka `/admin` dan masuk.
2. Pilih **Akun & keamanan**.
3. Ubah email, isi password baru, atau keduanya. Kosongkan password baru dan konfirmasinya jika hanya mengganti email.
4. Masukkan password saat ini, lalu klik **Simpan akun**.
5. Masuk kembali memakai akun terbaru. Semua sesi sebelumnya, termasuk di perangkat lain, sudah berakhir.

Email login admin terpisah dari email kontak publik di **Profil & kontak**. Perubahan akun disimpan di MongoDB dan tidak membutuhkan redeploy.

Jika lupa password, isi `ADMIN_EMAIL` dengan **email login saat ini** dan `ADMIN_PASSWORD` dengan password baru di `.env.local`, lalu jalankan dari komputermu:

```bash
npm run seed -- --reset-password
```

Semua sesi akun itu akan dicabut. Hapus password dari file env setelah selesai. Tidak ada tombol reset password publik atau email otomatis.

## Struktur penting

```text
app/                       Halaman publik, admin, dan API routes
components/Portfolio.tsx    Tampilan portofolio
components/AdminEditor.tsx  Editor admin
components/AccountSettings.tsx  Pengaturan email login dan password
components/LiquidImage.tsx  Efek liquid dengan fallback gerakan terbatas
components/StartupScreen.tsx  Alur loading, pemuatan aset, skip, dan aksesibilitas
components/StartupScene.tsx   Maskot robot pixel dan visual loading
app/startup.css               Animasi intro Tiny World
app/globals.css             Desain publik dan breakpoint responsif
app/admin.css               Desain halaman admin
lib/db.ts                   Koneksi MongoDB yang dipakai ulang
lib/auth.ts                 Sesi, cookie, dan validasi origin
lib/validation.ts           Validasi semua data dari admin
lib/defaults.ts             Teks awal dan proyek demo lokal
scripts/seed.mjs            Pembuatan admin dan indeks
public/images/              Dua gambar orisinal untuk tampilan awal
```

Teks label navigasi dan struktur halaman tetap di source; konten profil, hero, gambar, sosial, dan semua proyek diedit lewat admin. MongoDB memakai koleksi `admins`, `sessions`, `loginAttempts`, `settings`, `projects`, dan `media`.

## Verifikasi

```bash
npm run typecheck
npm test
npm run build
npm run test:integration
```

Integration test menggunakan **MongoDB sungguhan sementara** melalui `mongodb-memory-server`, mengabaikan `MONGODB_URI` luar, dan menghapus proses/data uji setelah selesai. Run pertama mengunduh binary MongoDB (ukurannya bisa besar, terutama pada Windows). Uji mencakup login, cookie, origin/CSRF, akses tanpa login, CRUD, draft, publikasi, tautan, upload/read gambar, profil, perubahan email/password, pencabutan sesi, reset manual, logout, sesi kedaluwarsa, dan pembatasan percobaan. Build harus dijalankan sebelum integration test; port 3101 harus kosong.

## Jika menemui masalah

- **Database belum tersedia:** periksa connection string, password URI yang di-encode, Network Access Atlas, database user, dan `MONGODB_DB`. Error database tidak diam-diam dialihkan ke data contoh.
- **Login ditolak:** jalankan seed ke database yang sama. Setelah 10 percobaan dalam jendela 15 menit, tunggu sebelum mencoba lagi.
- **Origin tidak diizinkan:** pastikan `APP_URL` sama dengan alamat website yang dibuka, lalu restart atau redeploy.
- **Perubahan belum muncul:** pastikan menekan Simpan dan proyek berstatus Publik. Muat ulang halaman publik.
- **Upload ditolak:** perkecil gambar sampai di bawah 3 MB; gunakan JPG/PNG/WebP.
- **Gambar URL tidak muncul:** cek bahwa URL mengarah ke file gambar yang bisa diakses publik dan hosting mengizinkan pemakaian lintas situs.

## Aset dan referensi visual

Desain mengambil inspirasi tata letak dari [Lds Studio](https://www.lds.studio/) dan interaksi gambar dari [LiveMeFive](https://livemefive.com/). Implementasi, teks, dan visual portofolio dibuat untuk proyek ini; aset referensi tidak disalin. `liquid.webp` dan `valley.webp` adalah gambar orisinal hasil generasi AI. Ilustrasi antarmuka proyek contoh bukan screenshot aplikasi asli. Font DM Sans dan Instrument Serif disertakan lewat Fontsource; ikon antarmuka memakai Lucide.

Paket belum dipublikasikan ke akun Vercel atau dihubungkan ke Atlas milikmu. Kredensial layanan tersebut memang perlu kamu isi sendiri.
