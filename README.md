# AP3 - Aplikasi Penyusunan Penelitian Perkara (Versi Node.js & TypeScript)

Aplikasi **AP3** (Aplikasi Penyusunan Penelitian Perkara) untuk Direktorat Jenderal Bea dan Cukai yang telah dimigrasikan dari arsitektur *client-side only* (vanilla JS & localStorage) menjadi aplikasi **Full-Stack berbasis Node.js, Express, TypeScript, dan basis data SQLite**, dengan **tampilan antarmuka (UI) 100% persis sama** dengan versi aslinya.

---

## Fitur & Peningkatan Utama

1. **Bahasa Pemrograman TypeScript Penuh (`.ts`):**
   - Seluruh logika bisnis, modul perkara, autentikasi, disposisi, editor formulir, formatters, dan template laporan telah dikonversi ke TypeScript dengan *strong typing* (`PerkaraRecord`, `UserAccount`, `DisposisiRecord`, `StoreState`, dll.).
2. **Penyimpanan Data Terpusat & Aman (SQLite):**
   - Menggantikan ketergantungan rapuh pada `localStorage` peramban dengan basis data relasional SQLite (`data/ap3.sqlite`) yang tersimpan di server.
   - Dilengkapi *fallback* file-based JSON storage yang otomatis aktif jika dependensi native binary belum dikompilasi.
3. **REST API Backend (Node.js & Express):**
   - `/api/auth/login` & `/api/auth/register`: Manajemen login dan pendaftaran akun pengguna berdasar peran (Admin, Staff Indak, Penyidik, dll.).
   - `/api/perkara`: CRUD berkas perkara, sinkronisasi massal (*bulk update*), dan pencadangan.
   - `/api/disposisi`: Pencatatan alur disposisi antarpetugas secara persisten.
4. **Tampilan Antarmuka (UI) 100% Identik:**
   - Seluruh formulir, modal, layout cetak dokumen (LPP, LPF, SPLIT, SPRIN CACAH, BA, LHP, BAST Pemilik, BA Segel, KEP BDN, SPSA, BAST Limpah), palet warna Kemenkeu/Bea Cukai, dan sistem paginasi cetak F4/A4 dipertahankan tanpa perubahan visual.

---

## Struktur Direktori Proyek

```text
ap3-typescript/
├── package.json              # Konfigurasi npm, dependensi Express & TypeScript
├── tsconfig.json             # Konfigurasi basis TypeScript
├── tsconfig.server.json      # Konfigurasi kompilasi backend (NodeNext)
├── tsconfig.client.json      # Konfigurasi kompilasi frontend (DOM & ESNext)
├── server.cjs                # Universal server launcher (siap jalan langsung)
├── data/                     # Lokasi penyimpanan basis data SQLite & berkas data
├── dist/                     # Hasil kompilasi JavaScript untuk backend
│   └── server/
└── src/
    ├── server/               # Kode sumber Backend (TypeScript)
    │   ├── index.ts          # Server Express, static serving & router
    │   ├── db/
    │   │   └── database.ts   # Layer basis data SQLite & migrasi tabel
    │   ├── routes/
    │   │   ├── auth.ts       # Endpoint autentikasi & sesi
    │   │   ├── perkara.ts    # Endpoint CRUD perkara
    │   │   └── disposisi.ts  # Endpoint disposisi
    │   └── types/
    │       └── index.ts      # Type definitions backend
    └── client/               # Kode sumber Frontend (TypeScript)
        ├── app.ts            # Entry point client & window binding
        ├── config/
        │   └── constants.ts  # Daftar cluster pasal & kantor
        ├── state/
        │   └── store.ts      # Store state dengan sinkronisasi REST API
        ├── types/
        │   └── index.ts      # Type definitions frontend
        ├── utils/
        │   └── formatters.ts # Formatting tanggal, rupiah, huruf terbilang
        ├── modules/
        │   ├── auth.ts       # Modul login, registrasi, profil
        │   ├── disposisi.ts  # Modul alur disposisi & notifikasi
        │   ├── editor.ts     # Modul live editor & paginasi
        │   ├── perkara.ts    # Modul CRUD perkara, validasi, ekspor
        │   └── ui.ts         # Toast, dialog konfirmasi, zoom, paper size
        └── templates/
            ├── laporan.ts    # Template dokumen LPP, LPF, SPLIT, SPRIN, BA, LHP
            └── tindaklanjut.ts # Template dokumen tindak lanjut (BAST, KEP BDN, SPSA)
└── public/                   # Aset statis asli
    ├── index.html            # File HTML utama (UI asli)
    ├── css/                  # Seluruh stylesheet asli (layout, components, print)
    └── js/                   # Hasil kompilasi ES Module client yang dimuat browser
```

---

## Panduan Menjalankan Aplikasi

### Cara 1: Menjalankan Langsung (Instan)
Aplikasi sudah dilengkapi dengan *compiled bundle* dan launcher bawaan Node.js sehingga dapat langsung dijalankan tanpa harus menginstal dependensi terlebih dahulu:

```bash
# Jalankan server
node server.cjs
```
Buka peramban (browser) dan akses:
```
http://localhost:3000
```

### Cara 2: Menjalankan dengan Ekosistem NPM & TypeScript Lengkap

Jika Anda ingin mengembangkan atau mengompilasi ulang kode TypeScript:

1. **Instal dependensi:**
   ```bash
   npm install
   ```

2. **Kompilasi TypeScript:**
   ```bash
   npm run build
   ```

3. **Jalankan Server:**
   ```bash
   npm start
   ```

4. **Mode Development (Hot-reload):**
   ```bash
   npm run dev
   ```

---

## Kredensial Default Sistem
Saat pertama kali dijalankan, sistem secara otomatis menyediakan akun administrator:
* **Email / Username:** `admin`
* **Password:** `admin`
* **Role:** `Admin`

Anda dapat menambahkan akun petugas baru (Peneliti, Penyidik, Kasi, Kasubsi) melalui form registrasi atau panel manajemen pengguna di dalam aplikasi.
