# Pemetaan Arsitektur MVC (Model-View-Controller)

Dokumen ini memetakan seluruh file dan folder pada project Website Portal Resmi Diskominfo PPU ke dalam konsep MVC (Model-View-Controller). Pemisahan file ini mempermudah pembacaan kode, pemeliharaan, serta proses pengembangan selanjutnya.

---

## Bagan Arsitektur MVC

```text
       ┌────────────────────────────────────────────────────────┐
       │                       HTTP REQUEST                     │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │          CONTROLLER           │
                   │    (Next.js Route & Page)     │
                   └──────┬─────────────────▲──────┘
                          │                 │
             Query / Save │                 │ Data Terformat
                          ▼                 │
      ┌─────────────────────────┐     ┌─────┴───────────────────┐
      │          MODEL          │     │          VIEW           │
      │   (Prisma / Database)   │     │    (React Components)   │
      └─────────────────────────┘     └─────────────────────────┘
```

---

## Pemetaan File dan Folder Berdasarkan Halaman

Setiap fitur atau halaman di website ini telah dipisahkan menjadi file yang terdedikasi sesuai perannya masing-masing dalam arsitektur MVC:

### 1. Halaman Berita (News Page)
*   **Model**:
    *   Tabel `News` di [prisma/schema.prisma](file:///e:/Kuliah/Semester%206/KP/tes/prisma/schema.prisma) (Definisi tipe data berita).
    *   Koneksi client database di [src/backend/config/db.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/backend/config/db.ts).
*   **View**:
    *   [src/app/berita/page.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/app/berita/page.tsx) (Halaman daftar seluruh berita).
    *   [src/app/berita/[year]/[month]/[slug]/page.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/app/berita/%5Byear%5D/%5Bmonth%5D/%5Bslug%5D/page.tsx) (Tampilan detail isi berita).
    *   Komponen kartu & list berita di [src/frontend/components/features/latest-news.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/frontend/components/features/latest-news.tsx).
*   **Controller**:
    *   API handler di [src/app/api/news/route.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/app/api/news/route.ts).
    *   Logic query database di [src/backend/controllers/NewsController.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/backend/controllers/NewsController.ts).

### 2. Halaman Informasi dan Pengumuman (Announcement Page)
*   **Model**:
    *   Tabel `Announcement` di [prisma/schema.prisma](file:///e:/Kuliah/Semester%206/KP/tes/prisma/schema.prisma) (Definisi tipe data pengumuman).
    *   Koneksi client database di [src/backend/config/db.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/backend/config/db.ts).
*   **View**:
    *   [src/app/informasi/pengumuman/page.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/app/informasi/pengumuman/page.tsx) (Halaman daftar pengumuman).
    *   [src/app/informasi/pengumuman/[id]/page.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/app/informasi/pengumuman/%5Bid%5D/page.tsx) (Tampilan detail pengumuman + inline edit).
    *   Komponen widget pengumuman di [src/frontend/components/features/announcements.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/frontend/components/features/announcements.tsx).
*   **Controller**:
    *   API handler di [src/app/api/announcements/route.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/app/api/announcements/route.ts).
    *   Logic query database di [src/backend/controllers/AnnouncementController.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/backend/controllers/AnnouncementController.ts).

### 3. Halaman Peta Interaktif (Map Portal Page)
*   **Model**:
    *   Tabel `MapPoint` di [prisma/schema.prisma](file:///e:/Kuliah/Semester%206/KP/tes/prisma/schema.prisma) (Definisi lokasi Wifi, CCTV, & BTS).
*   **View**:
    *   [src/app/peta/page.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/app/peta/page.tsx) (Tampilan peta interaktif Leaflet JS).
*   **Controller**:
    *   [src/app/api/mappoints/route.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/app/api/mappoints/route.ts) (API Controller untuk CRUD titik lokasi peta).

### 4. Halaman Profil Dinamis (Profile Page)
*   **Model**:
    *   Tabel `PageContent` di [prisma/schema.prisma](file:///e:/Kuliah/Semester%206/KP/tes/prisma/schema.prisma) (Menyimpan isi teks halaman secara dinamis).
*   **View**:
    *   [src/app/profil/[slug]/page.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/app/profil/%5Bslug%5D/page.tsx) (Tampilan dinamis visi-misi, organisasi, dsb).
    *   Header halaman di [src/frontend/components/layout/page-header.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/frontend/components/layout/page-header.tsx).
    *   Alat pengeditan inline di [src/frontend/components/shared/inline-edit-toolbar.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/frontend/components/shared/inline-edit-toolbar.tsx) dan [src/frontend/components/shared/editable-text.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/frontend/components/shared/editable-text.tsx).
*   **Controller**:
    *   [src/app/api/pages/route.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/app/api/pages/route.ts) (API Controller untuk meng-update teks halaman secara inline).

### 5. Halaman Manajemen Pengguna (User Management Page)
*   **Model**:
    *   Tabel `User` di [prisma/schema.prisma](file:///e:/Kuliah/Semester%206/KP/tes/prisma/schema.prisma) (Detail user admin).
    *   Utilitas enkripsi kata sandi dan sesi di [src/backend/utils/auth.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/backend/utils/auth.ts).
*   **View**:
    *   [src/app/admin/users/page.tsx](file:///e:/Kuliah/Semester%206/KP/tes/src/app/admin/users/page.tsx) (Tampilan CRUD admin khusus Superadmin).
*   **Controller**:
    *   [src/app/api/users/route.ts](file:///e:/Kuliah/Semester%206/KP/tes/src/app/api/users/route.ts) (API Controller untuk manajemen user admin).

---

## Manfaat Pembagian File MVC

1.  **Troubleshooting Lebih Mudah:** Jika ada error di tampilan halaman, Anda cukup mencari file di bagian View (`src/app/` atau `src/frontend/components/`). Jika data database yang salah, silakan cek bagian Model (`prisma/schema.prisma` atau `src/backend/config/`).
2.  **Kode Lebih Rapi dan Teratur:** Menambahkan fitur baru tidak akan mengganggu fitur yang sudah ada karena setiap halaman memiliki controller dan tampilannya sendiri-sendiri.
3.  **Kesesuaian Standar Pengembangan:** Struktur ini memenuhi kriteria desain perangkat lunak yang bersih (Clean Code) sehingga mudah dipahami oleh dosen penguji, tim developer lain, maupun pihak luar.
