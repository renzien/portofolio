# Memasang tema baru di website yang sudah berjalan

Database MongoDB tetap dipakai. Email/password admin, profil, proyek, tautan, dan gambar unggahan tersimpan di database, sehingga tidak perlu dibuat ulang.

## 1. Ekstrak paket

Ekstrak ZIP tema terbaru. Buka folder `alif-rizki-portfolio` yang berisi `package.json`, `app`, `components`, dan `public`.

## 2. Perbarui repositori GitHub yang sama

1. Buka repositori `portofolio` yang sudah terhubung ke Vercel.
2. Pilih **Add file → Upload files** pada root repositori.
3. Tarik **isi folder** hasil ekstrak ke halaman upload, bukan folder pembungkus `alif-rizki-portfolio`.
4. Sertakan `app`, `components`, `lib`, `public`, `scripts`, `tests`, `package.json`, `package-lock.json`, dan berkas konfigurasi lain di paket. Ilustrasi kolase baru ada di `public/images/pastel-objects.webp`.
5. Commit ke branch yang digunakan Vercel, biasanya `main`.

Root Directory Vercel harus tetap mengarah ke folder yang berisi `package.json`. Paket tidak menyertakan file `.env.local` dan `.admin-bootstrap.json`. Jangan unggah file tersebut dari salinan lama.

Jika memakai Git di komputer, salin source baru ke checkout lama, pertahankan `.git` dan `.env.local`, tinjau perubahan, lalu commit dan push seperti biasa.

## 3. Pertahankan konfigurasi Vercel

Tetap gunakan proyek Vercel dan integrasi MongoDB yang sama. Jangan menghapus atau mengganti variabel yang sudah bekerja:

| Variabel      | Nilai                                                           |
| ------------- | --------------------------------------------------------------- |
| `MONGODB_URI` | Koneksi MongoDB yang sudah terpasang                            |
| `MONGODB_DB`  | `alif_portfolio`, atau nama database lama jika kamu mengubahnya |
| `APP_URL`     | `https://alifrizki.vercel.app`, jika domain itu yang dipakai    |

**Tidak perlu menjalankan seed, reset password, atau membuat cluster baru.** Seluruh perubahan tema ada di source. Akun admin lama tetap dipakai.

## 4. Tunggu deployment selesai

Vercel biasanya melakukan deploy setelah commit ke branch production. Periksa menu Deployments. Jika belum berjalan otomatis, gunakan Redeploy pada deployment proyek yang sama.

Setelah status Ready, buka website dan lakukan refresh. Jika browser masih menampilkan desain lama, gunakan Ctrl+F5. Login ke `/admin` menggunakan akun yang sudah ada.

## Konten pada desain baru

- Lima proyek publik pertama, sesuai angka urutan admin, menjadi kolase beranda.
- Kartu yang belum berisi proyek memakai gambar/ilustrasi visual; tidak menambah proyek ke database.
- Jumlah karya dihitung dari proyek yang berstatus Publik.
- Judul dan intro lama tetap ditampilkan di blok perkenalan; profil dan kontak tetap dapat diedit dari admin.
- Kedua gambar hero dari admin mengisi slot pendamping di kolase.
- Bagian Tentang memuat maskot kecil yang bergerak saat masuk layar. Bio dan keahlian diambil dari pengaturan admin.
- Tombol Android tetap download dan GitHub. Tombol Unity tetap play dan download.
- Kategori App tersedia pada filter publik dan pilihan kategori di admin. Gunakan untuk aplikasi umum, desktop, atau web. App mendukung tautan download, repositori GitHub, dan URL buka aplikasi opsional.
- Proyek lama tidak diubah kategorinya secara otomatis. Untuk mengelompokkan ulang, edit proyek di admin, pilih App, lalu simpan.
- Kartu kategori membuka galeri dengan filter yang sesuai. Panel kontak mengambil Email, GitHub, dan LinkedIn dari data profil.
- Animasi ikon, lambaian maskot, dan transisi mengikuti preferensi gerakan terbatas dari perangkat. Loading robot tetap bisa dilewati.

## Menjalankan di komputer (opsional)

Gunakan Node.js 24. Dari folder yang berisi `package.json`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Untuk melihat isi MongoDB lama di komputer, gunakan `.env.local` milikmu dengan koneksi yang sama. Tanpa koneksi database, halaman menampilkan proyek contoh sebagai pratinjau lokal.
