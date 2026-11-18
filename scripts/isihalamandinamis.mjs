import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');

const defaultSections = [
  {
    slug: 'quick-services',
    title: 'Layanan Cepat',
    fields: {
      services_list: JSON.stringify([
        { icon: "Wifi", name: "Perbaikan Jaringan Internet", desc: "Lapor gangguan internet", color: "from-blue-500 to-blue-600", href: "https://www.lapor.go.id/", external: true },
        { icon: "Database", name: "SATU DATA", desc: "Portal data terbuka", color: "from-green-500 to-green-600", href: "https://data.penajamkab.go.id/", external: true },
        { icon: "Globe", name: "Website PPU", desc: "Portal resmi kabupaten", color: "from-indigo-500 to-indigo-600", href: "https://penajamkab.go.id/", external: true },
        { icon: "Megaphone", name: "Info Publik", desc: "Informasi untuk masyarakat", color: "from-orange-500 to-orange-600", href: "/informasi/pengumuman", external: false },
        { icon: "BarChart3", name: "Aplikasi SiStada", desc: "Sistem statistik daerah", color: "from-purple-500 to-purple-600", href: "https://diskominfo.penajamkab.go.id/", external: true },
        { icon: "Shield", name: "PPID", desc: "Pejabat pengelola informasi", color: "from-red-500 to-red-600", href: "https://ppidppu.penajamkab.go.id/", external: true },
        { icon: "BookOpen", name: "Layanan Kominfo", desc: "Layanan Kemenkominfo", color: "from-teal-500 to-teal-600", href: "/layanan", external: false },
        { icon: "ClipboardList", name: "Buku Tamu", desc: "Buku tamu digital", color: "from-pink-500 to-pink-600", href: "/kontak", external: false }
      ])
    }
  },
  {
    slug: 'statistics',
    title: 'Statistik Angka',
    fields: {
      stats_list: JSON.stringify([
        { icon: "Building2", value: 42, suffix: "+", label: "OPD Terhubung", color: "from-[#1E6F3D] to-[#3CB371]" },
        { icon: "Wifi", value: 120, suffix: "+", label: "Titik Internet Desa", color: "from-blue-500 to-blue-600" },
        { icon: "Newspaper", value: 390, suffix: "+", label: "Artikel Berita", color: "from-orange-500 to-orange-600" },
        { icon: "MonitorSmartphone", value: 50, suffix: "+", label: "Layanan Online", color: "from-purple-500 to-purple-600" }
      ])
    }
  },
  {
    slug: 'faq',
    title: 'Pertanyaan yang Sering Diajukan',
    fields: {
      faqs_list: JSON.stringify([
        {
          question: "Bagaimana cara mengajukan permohonan informasi melalui PPID?",
          answer: "Anda dapat mengajukan permohonan informasi publik melalui website PPID Kabupaten Penajam Paser Utara di ppidppu.penajamkab.go.id. Isi formulir permohonan informasi secara lengkap dan tunggu respon dari petugas PPID dalam waktu maksimal 10 hari kerja."
        },
        {
          question: "Bagaimana cara melaporkan gangguan jaringan internet pemerintah?",
          answer: "Laporan gangguan jaringan internet dapat dilakukan melalui Formulir Perbaikan Jaringan Internet yang tersedia di website Diskominfo PPU. Isi data lokasi, jenis gangguan, dan kontak yang dapat dihubungi. Tim teknis kami akan merespon dalam 1x24 jam kerja."
        },
        {
          question: "Apa itu Satu Data Indonesia dan bagaimana cara mengaksesnya?",
          answer: "Satu Data Indonesia adalah kebijakan tata kelola data pemerintah yang bertujuan menghasilkan data yang akurat, mutakhir, terpadu, dan dapat dipertanggungjawabkan. Portal Satu Data PPU dapat diakses di data.penajamkab.go.id untuk mengunduh dataset publik secara gratis."
        },
        {
          question: "Bagaimana prosedur pengajuan domain go.id untuk perangkat daerah?",
          answer: "Perangkat daerah yang memerlukan domain go.id dapat mengajukan permohonan melalui Diskominfo PPU dengan melampirkan surat permohonan resmi dari kepala OPD, proposal penggunaan domain, dan data teknis yang diperlukan. Proses verifikasi membutuhkan waktu 5-14 hari kerja."
        },
        {
          question: "Apa saja layanan yang disediakan oleh Diskominfo PPU?",
          answer: "Diskominfo PPU menyediakan berbagai layanan termasuk: pengelolaan jaringan internet pemerintah, pengelolaan data statistik daerah (SiStada), pelayanan informasi publik (PPID), pengelolaan website dan media sosial pemerintah, pengelolaan infrastruktur TIK, dan persandian."
        },
        {
          question: "Bagaimana cara menghubungi Diskominfo PPU?",
          answer: "Anda dapat menghubungi kami melalui: Alamat kantor di Jl. Propinsi KM.09 Nipah-nipah, Penajam, Kab. Penajam Paser Utara, Kalimantan Timur. Atau melalui Instagram @diskominfoppu, YouTube channel Diskominfo PPU, atau langsung datang ke kantor kami pada jam kerja (Senin-Jumat, 08:00-16:00 WITA)."
        }
      ])
    }
  },
  {
    slug: 'videos',
    title: 'Galeri Video',
    fields: {
      videos_list: JSON.stringify([
        {
          title: "Profil Diskominfo Kabupaten Penajam Paser Utara",
          thumbnail: "/uploads/banner-kominfo.jpg",
          duration: "5:30",
          date: "2026"
        },
        {
          title: "Sosialisasi Satu Data Indonesia di PPU",
          thumbnail: "/uploads/1782951464879-whatsapp-image-2026-06-08-at-21-58-192-534x462.jpeg",
          duration: "12:45",
          date: "2026"
        },
        {
          title: "Safari Jumat Bupati PPU 2026",
          thumbnail: "/uploads/1782951463952-whatsapp-image-2026-06-15-at-07-57-40-2-534x462.jpeg",
          duration: "8:20",
          date: "2026"
        },
        {
          title: "Raker KIM se-Kalimantan Timur",
          thumbnail: "/uploads/1782951463567-whatsapp-image-2026-06-18-at-16-16-15-534x462.jpeg",
          duration: "15:10",
          date: "2026"
        }
      ])
    }
  },
  {
    slug: 'gallery',
    title: 'Galeri Foto',
    fields: {
      gallery_list: JSON.stringify([
        {
          src: "/uploads/1782951463162-whatsapp-image-2026-06-24-at-20-29-37-534x462.jpeg",
          title: "Penanaman Kelapa Genjah di Nenang",
          category: "Kegiatan"
        },
        {
          src: "/uploads/1782951463567-whatsapp-image-2026-06-18-at-16-16-15-534x462.jpeg",
          title: "Raker KIM se-Kaltim",
          category: "Rapat"
        },
        {
          src: "/uploads/1782951463952-whatsapp-image-2026-06-15-at-07-57-40-2-534x462.jpeg",
          title: "Safari Jumat Bupati PPU",
          category: "Kegiatan"
        },
        {
          src: "/uploads/1782951464366-desain-tanpa-judul-46-534x462.jpg",
          title: "Safari Jumat di Maridan",
          category: "Kegiatan"
        },
        {
          src: "/uploads/1782951464879-whatsapp-image-2026-06-08-at-21-58-192-534x462.jpeg",
          title: "Sosialisasi Satu Data Indonesia",
          category: "Sosialisasi"
        },
        {
          src: "/uploads/banner-kominfo.jpg",
          title: "Kantor Diskominfo PPU",
          category: "Kantor"
        }
      ])
    }
  },
  {
    slug: 'partners',
    title: 'Mitra & Instansi',
    fields: {
      partners_list: JSON.stringify([
        {
          name: "Kementerian Kominfo RI",
          url: "https://www.kominfo.go.id/",
          color: "bg-blue-50 hover:bg-blue-100",
          initial: "Kominfo",
          bgColor: "from-blue-600 to-blue-700"
        },
        {
          name: "Pemerintah Kab. PPU",
          url: "https://penajamkab.go.id/",
          color: "bg-green-50 hover:bg-green-100",
          initial: "PPU",
          bgColor: "from-green-600 to-green-700"
        },
        {
          name: "Pemprov Kalimantan Timur",
          url: "https://kaltimprov.go.id/",
          color: "bg-orange-50 hover:bg-orange-100",
          initial: "Kaltim",
          bgColor: "from-orange-600 to-orange-700"
        },
        {
          name: "BSSN",
          url: "https://bssn.go.id/",
          color: "bg-red-50 hover:bg-red-100",
          initial: "BSSN",
          bgColor: "from-red-600 to-red-700"
        },
        {
          name: "BPS Kab. PPU",
          url: "https://penajamkab.bps.go.id/",
          color: "bg-purple-50 hover:bg-purple-100",
          initial: "BPS",
          bgColor: "from-purple-600 to-purple-700"
        },
        {
          name: "PPID Kab. PPU",
          url: "https://ppidppu.penajamkab.go.id/",
          color: "bg-teal-50 hover:bg-teal-100",
          initial: "PPID",
          bgColor: "from-teal-600 to-teal-700"
        }
      ])
    }
  }
];

async function run() {
  console.log('Seeding remaining dynamic sections to db.json...');
  
  let db;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    db = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read db.json:', err.message);
    process.exit(1);
  }

  if (!db.pageContents) {
    db.pageContents = [];
  }

  let addedCount = 0;
  for (const sect of defaultSections) {
    const exists = db.pageContents.some(p => p.slug === sect.slug);
    if (!exists) {
      db.pageContents.push(sect);
      console.log(`  + Seeding: ${sect.slug}`);
      addedCount++;
    } else {
      console.log(`  - Already exists: ${sect.slug}`);
    }
  }

  if (addedCount > 0) {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Seeding completed. Added ${addedCount} sections to local db.json.`);
  } else {
    console.log('No new sections needed seeding.');
  }
}

run();
