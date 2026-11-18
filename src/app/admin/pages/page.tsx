"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { 
  FileEdit, Save, Loader2, ArrowLeft, CheckCircle2,
  Globe, Eye, LayoutDashboard, Target, Phone, Footprints,
  ChevronRight, Trash2, Plus, X, Camera, Play, AlertTriangle,
  ShieldAlert, CircleCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface PageContent {
  slug: string;
  title: string;
  fields: Record<string, string>;
}

const PAGE_ICONS: Record<string, any> = {
  hero: Globe,
  'visi-misi': Target,
  kontak: Phone,
  footer: Footprints,
  'quick-services': Globe,
  statistics: Target,
  faq: Globe,
  videos: Globe,
  gallery: Globe,
  partners: Globe,
  'header-topbar': Globe,
  'navigation-menu': Globe,
};

const FIELD_LABELS: Record<string, Record<string, string>> = {
  hero: {
    badge: 'Badge Selamat Datang',
    heading: 'Judul Utama',
    subheading: 'Subjudul',
    tagline: 'Tagline (pisahkan dengan koma)',
    description: 'Deskripsi',
    stat1_value: 'Statistik 1 - Nilai',
    stat1_label: 'Statistik 1 - Label',
    stat2_value: 'Statistik 2 - Nilai',
    stat2_label: 'Statistik 2 - Label',
    stat3_value: 'Statistik 3 - Nilai',
    stat3_label: 'Statistik 3 - Label',
    bg_image_1: 'Gambar Background Slide 1 (URL)',
    bg_image_2: 'Gambar Background Slide 2 (URL)',
    bg_image_3: 'Gambar Background Slide 3 (URL)',
  },
  'visi-misi': {
    visi: 'Teks Visi',
    visi_deskripsi: 'Deskripsi Visi',
    misi_1: 'Misi ke-1',
    misi_2: 'Misi ke-2',
    misi_3: 'Misi ke-3',
    misi_4: 'Misi ke-4',
    misi_5: 'Misi ke-5',
  },
  kontak: {
    alamat: 'Alamat Lengkap',
    telepon: 'Nomor Telepon',
    email: 'Email',
    jam_kerja: 'Jam Kerja',
  },
  footer: {
    deskripsi: 'Deskripsi Footer',
    alamat_line1: 'Alamat Baris 1',
    alamat_line2: 'Alamat Baris 2',
    facebook: 'Link Facebook',
    instagram: 'Link Instagram',
    twitter: 'Link X (Twitter)',
    youtube: 'Link YouTube',
    website: 'Link Website Resmi',
  },
  'quick-services': {
    services_list: 'Daftar Layanan Cepat (JSON Format)',
  },
  statistics: {
    stats_list: 'Daftar Angka Statistik (JSON Format)',
  },
  faq: {
    faqs_list: 'Daftar FAQ Tanya-Jawab (JSON Format)',
  },
  videos: {
    videos_list: 'Daftar Galeri Video (JSON Format)',
  },
  gallery: {
    gallery_list: 'Daftar Galeri Foto (JSON Format)',
  },
  partners: {
    partners_list: 'Daftar Mitra Instansi (JSON Format)',
  },
  'header-topbar': {
    location: 'Teks Lokasi Kiri',
    weather_label: 'Teks Cuaca Default (Kanan)',
    show_live_weather: 'Aktifkan Cuaca Real-Time (true / false)'
  },
  'navigation-menu': {
    profil_links: 'Menu Dropdown Profil',
    ppid_links: 'Menu Dropdown PPID',
    informasi_links: 'Menu Dropdown Informasi',
    gallery_links: 'Menu Dropdown Galeri',
    layanan_links: 'Menu Dropdown Layanan',
    download_links: 'Menu Dropdown Download',
  },
};



const categoryLabels: Record<string, string> = {
  profil: 'Profil',
  ppid: 'PPID',
  informasi: 'Informasi',
  layanan: 'Layanan',
  download: 'Download',
  gallery: 'Galeri',
  none: 'Halaman Mandiri'
};

const getCategoryFromSlug = (slug: string): string => {
  const prefixes = ['profil', 'ppid', 'informasi', 'layanan', 'download', 'gallery'];
  for (const prefix of prefixes) {
    if (slug.startsWith(`${prefix}-`)) {
      return prefix;
    }
  }
  return 'none';
};

const getBaseSlug = (slug: string, category: string): string => {
  if (category === 'none') return slug;
  if (slug.startsWith(`${category}-`)) {
    return slug.slice(category.length + 1);
  }
  const prefixes = ['profil', 'ppid', 'informasi', 'layanan', 'download', 'gallery'];
  for (const prefix of prefixes) {
    if (slug.startsWith(`${prefix}-`)) {
      return slug.slice(prefix.length + 1);
    }
  }
  return slug;
};

const getPageUrl = (slug: string): string => {
  const slugToHrefMap: Record<string, string> = {
    'diskominfo-sandi': '/profil/diskominfo-sandi',
    'visi-misi': '/profil/visi-misi',
    'tupoksi': '/profil/tupoksi',
    'struktur-organisasi': '/profil/struktur-organisasi',
    'organisasi': '/profil/organisasi',
    'ppid-sarana-prasarana': '/ppid/sarana-prasarana',
    'ppid-komitmen': '/ppid/komitmen-organisasi',
    'ppid-informasi-berkala': '/ppid/informasi-berkala',
    'informasi-kegiatan': '/informasi/kegiatan',
    'informasi-agenda': '/informasi/agenda',
    'informasi-pengumuman': '/informasi/pengumuman',
    'dpa': '/informasi/dpa',
    'gallery-foto': '/gallery/foto',
    'gallery-video': '/gallery/video',
    'layanan-pengaduan-masyarakat': '/layanan/pengaduan-masyarakat',
    'layanan-subdomain-dan-hosting': '/layanan/subdomain-dan-hosting',
    'layanan-tanda-tangan-elektronik': '/layanan/tanda-tangan-elektronik',
    'layanan-fasilitas-video-conference': '/layanan/fasilitas-video-conference',
    'download-regulasi': '/download/regulasi',
    'download-materi': '/download/materi',
    'download-dokumen-teknis': '/download/download-dokumen-teknis',
    'kontak': '/kontak',
    'hero': '/'
  };

  if (slugToHrefMap[slug]) {
    return slugToHrefMap[slug];
  }

  const category = getCategoryFromSlug(slug);
  if (category !== 'none') {
    const baseSlug = getBaseSlug(slug, category);
    return `/${category}/${baseSlug}`;
  }

  const homeBlocks = ['footer', 'quick-services', 'statistics', 'faq', 'videos', 'gallery', 'partners', 'header-topbar', 'navigation-menu'];
  if (homeBlocks.includes(slug)) {
    return '/';
  }

  return `/${slug}`;
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    landing: true, // Expand Home by default
    profile: false,
    media: false,
    layout: false
  });

  // CRUD States
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageCategory, setNewPageCategory] = useState('profil');
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Dedicated Delete Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    page: PageContent | null;
    step: 'confirm' | 'deleting' | 'done';
    currentAction: string;
  }>({
    isOpen: false,
    page: null,
    step: 'confirm',
    currentAction: '',
  });

  // Fetch current user on mount to check role
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const CORE_PAGES = ['hero', 'visi-misi', 'kontak', 'footer', 'quick-services', 'statistics', 'faq', 'videos', 'gallery', 'partners', 'header-topbar'];

  // Dynamically group pages by dropdowns and categories matching the homepage menus
  const dynamicCategories = useMemo(() => {
    // Find the navigation menu configuration page
    const navMenu = pages.find(p => p.slug === 'navigation-menu');
    
    // Parse link lists
    const parseLinks = (val?: string) => {
      try {
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    };

    const profilLinks = parseLinks(navMenu?.fields.profil_links);
    const ppidLinks = parseLinks(navMenu?.fields.ppid_links);
    const informasiLinks = parseLinks(navMenu?.fields.informasi_links);
    const layananLinks = parseLinks(navMenu?.fields.layanan_links);
    const downloadLinks = parseLinks(navMenu?.fields.download_links);
    const galleryLinks = parseLinks(navMenu?.fields.gallery_links);

    const hrefToSlugMap: Record<string, string> = {
      '/profil/diskominfo-sandi': 'diskominfo-sandi',
      '/profil/visi-misi': 'visi-misi',
      '/profil/tupoksi': 'tupoksi',
      '/profil/struktur-organisasi': 'struktur-organisasi',
      '/profil/organisasi': 'organisasi',
      '/ppid/sarana-prasarana': 'ppid-sarana-prasarana',
      '/ppid/komitmen-organisasi': 'ppid-komitmen',
      '/ppid/informasi-berkala': 'ppid-informasi-berkala',
      '/informasi/kegiatan': 'informasi-kegiatan',
      '/informasi/agenda': 'informasi-agenda',
      '/informasi/pengumuman': 'informasi-pengumuman',
      '/informasi/dpa': 'dpa',
      '/gallery/foto': 'gallery-foto',
      '/gallery/video': 'gallery-video',
      '/layanan/pengaduan-masyarakat': 'layanan-pengaduan-masyarakat',
      '/layanan/subdomain-dan-hosting': 'layanan-subdomain-dan-hosting',
      '/layanan/tanda-tangan-elektronik': 'layanan-tanda-tangan-elektronik',
      '/layanan/fasilitas-video-conference': 'layanan-fasilitas-video-conference',
      '/download/regulasi': 'download-regulasi',
      '/download/materi': 'download-materi',
      '/download/dokumen-teknis': 'download-dokumen-teknis'
    };

    const getSlugFromLink = (href: string, categoryId: string): string => {
      const cleanHref = href.split('?')[0];
      if (hrefToSlugMap[cleanHref]) {
        return hrefToSlugMap[cleanHref];
      }
      const parts = cleanHref.split('/');
      const lastPart = parts[parts.length - 1];
      if (!lastPart) return '';
      return `${categoryId}-${lastPart}`;
    };

    const getSlugsFromLinks = (links: any[], categoryId: string): string[] => {
      return links
        .map((l: any) => getSlugFromLink(l.href, categoryId))
        .filter(Boolean);
    };

    const categoriesList = [
      {
        id: 'landing',
        title: 'Beranda & Navigasi Utama',
        description: 'Kelola banner utama, layanan cepat, statistik, FAQ, mitra instansi, topbar, footer, dan menu navigasi',
        slugs: ['hero', 'quick-services', 'statistics', 'faq', 'partners', 'header-topbar', 'footer', 'navigation-menu', 'map-portal']
      },
      {
        id: 'profil',
        title: 'Kategori Dropdown: Profil',
        description: 'Kelola halaman dinamis dan profil resmi (Visi Misi, Organisasi, Tupoksi, dll)',
        slugs: getSlugsFromLinks(profilLinks, 'profil')
      },
      {
        id: 'ppid',
        title: 'Kategori Dropdown: PPID',
        description: 'Kelola halaman informasi publik (Sarana, Komitmen, Informasi Berkala, dll)',
        slugs: getSlugsFromLinks(ppidLinks, 'ppid')
      },
      {
        id: 'informasi',
        title: 'Kategori Dropdown: Informasi',
        description: 'Kelola halaman info daerah (Agenda Kegiatan, DPA, Kegiatan, Menara, Pengumuman)',
        slugs: getSlugsFromLinks(informasiLinks, 'informasi')
      },
      {
        id: 'layanan',
        title: 'Kategori Dropdown: Layanan',
        description: 'Kelola halaman portal layanan publik dinamis daerah',
        slugs: getSlugsFromLinks(layananLinks, 'layanan')
      },
      {
        id: 'download',
        title: 'Kategori Dropdown: Download',
        description: 'Kelola halaman download berkas (Regulasi, Materi, Dokumen Teknis)',
        slugs: getSlugsFromLinks(downloadLinks, 'download')
      },
      {
        id: 'gallery',
        title: 'Kategori Dropdown: Gallery / Galeri',
        description: 'Kelola halaman kumpulan dokumentasi foto dan video daerah',
        slugs: getSlugsFromLinks(galleryLinks, 'gallery')
      },
      {
        id: 'kontak',
        title: 'Halaman Kontak',
        description: 'Kelola halaman informasi kontak resmi dan jam operasional dinas',
        slugs: ['kontak']
      }
    ];

    // Fallback: collect any pages not caught by the above categories
    const allCategorizedSlugs = new Set(categoriesList.flatMap(c => c.slugs));
    const uncategorizedPages = pages.filter(p => !allCategorizedSlugs.has(p.slug));
    
    if (uncategorizedPages.length > 0) {
      categoriesList.push({
        id: 'other',
        title: 'Halaman Lainnya',
        description: 'Halaman dinamis yang tidak dikelompokkan ke dalam dropdown utama',
        slugs: uncategorizedPages.map(p => p.slug)
      });
    }

    return categoriesList;
  }, [pages]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(data);
    } catch (err) {
      console.error('Gagal mengambil data halaman', err);
      toast.error('Gagal memuat data halaman');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle || !newPageSlug) return;
    setSaving(true);

    const actualSlug = newPageCategory === 'none' ? newPageSlug : `${newPageCategory}-${newPageSlug}`;

    // Determine default fields by category
    const defaultFields: Record<string, string> = newPageCategory === 'layanan'
      ? {
          page_category: 'Layanan',
          page_title: newPageTitle,
          page_description: 'Informasi lengkap dan prosedur akses layanan publik Diskominfo.',
          content_heading: 'Informasi & Prosedur Layanan',
          content_body: '## Deskripsi Layanan\n\nLayanan ini disediakan oleh Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara untuk memfasilitasi kebutuhan publik.\n\n### Prosedur Pengajuan:\n1. Pastikan Anda memenuhi dokumen persyaratan.\n2. Klik tombol tautan pendaftaran di bawah ini untuk mengisi formulir online.\n3. Tunggu proses verifikasi berkas oleh admin.',
          button_text: 'Formulir Pendaftaran',
          button_url: 'https://forms.google.com',
        }
      : {
          page_category: categoryLabels[newPageCategory] || 'Halaman Mandiri',
          page_title: newPageTitle,
          page_description: 'Deskripsi halaman baru ini. Aktifkan Mode Edit untuk menyesuaikan isi konten.',
          content_heading: 'Detail Informasi',
          content_body: '## Selamat Datang\n\nIni adalah halaman baru yang dibuat secara dinamis.\n\n### Cara Mengedit:\n- Aktifkan **Mode Edit** di bilah administrator atas.\n- Gunakan toolbar editor di bawah untuk menambahkan **Headline**, **Subheadline**, **Teks Tebal**, atau **Daftar Bulat**.\n- Anda juga dapat langsung mengunggah gambar dari komputer Anda dengan mengeklik tombol **Tambah Gambar**.',
        };

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPageTitle,
          slug: actualSlug,
          fields: defaultFields
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan halaman');

      // Automatically add link to navigation menu if dropdown is selected
      if (newPageCategory !== 'none') {
        const navMenuRes = await fetch('/api/pages?slug=navigation-menu');
        if (navMenuRes.ok) {
          const navMenuPage = await navMenuRes.json();
          const linkKey = `${newPageCategory}_links`;
          const currentLinksRaw = navMenuPage.fields[linkKey] || '[]';
          let currentLinks = [];
          try {
            currentLinks = JSON.parse(currentLinksRaw);
          } catch {
            currentLinks = [];
          }

          const newLink = {
            name: newPageTitle,
            href: `/${newPageCategory}/${newPageSlug}`
          };
          currentLinks.push(newLink);

          const updatedFields = {
            ...navMenuPage.fields,
            [linkKey]: JSON.stringify(currentLinks)
          };

          await fetch('/api/pages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: 'navigation-menu',
              fields: updatedFields
            })
          });
        }
      }

      toast.success('Halaman baru berhasil ditambahkan!');
      setPages(prev => [...prev, data.page]);
      setShowAddPageModal(false);
      setNewPageTitle('');
      setNewPageSlug('');
      // Force refresh page list to pull updated nav menu links
      fetchPages();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveCategory = async (newCategory: string) => {
    if (!selectedPage) return;
    const currentCategory = getCategoryFromSlug(selectedPage.slug);
    if (currentCategory === newCategory) return;

    setConfirmModal({
      isOpen: true,
      title: 'Pindahkan Kategori Halaman',
      message: `Apakah Anda yakin ingin memindahkan halaman "${selectedPage.title}" ke kategori "${categoryLabels[newCategory]}"?`,
      confirmText: 'Pindahkan',
      cancelText: 'Batal',
      isDestructive: false,
      onConfirm: async () => {
        const baseSlug = getBaseSlug(selectedPage.slug, currentCategory);
        const newSlug = newCategory === 'none' ? baseSlug : `${newCategory}-${baseSlug}`;

        setSaving(true);
        try {
          // 1. Create a copy of the page at the destination
          const updatedFields = {
            ...editedFields,
            page_category: categoryLabels[newCategory] || 'Halaman Mandiri',
          };

          const postRes = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: newSlug,
              title: selectedPage.title,
              fields: updatedFields,
            }),
          });

          const postData = await postRes.json();
          if (!postRes.ok) throw new Error(postData.error || 'Gagal memindahkan halaman');

          // 2. Delete the old page
          const deleteRes = await fetch(`/api/pages?slug=${selectedPage.slug}`, {
            method: 'DELETE',
          });
          if (!deleteRes.ok) {
            const delData = await deleteRes.json();
            throw new Error(delData.error || 'Gagal menghapus halaman lama');
          }

          // 3. Update navigation menu dropdown links
          const navMenuRes = await fetch('/api/pages?slug=navigation-menu');
          if (navMenuRes.ok) {
            const navMenuPage = await navMenuRes.json();
            const menuFields = { ...navMenuPage.fields };

            // Remove from old links
            if (currentCategory !== 'none') {
              const oldKey = `${currentCategory}_links`;
              let oldLinks = [];
              try {
                oldLinks = JSON.parse(menuFields[oldKey] || '[]');
              } catch {}
              const filteredLinks = oldLinks.filter((l: any) => l.href !== `/${currentCategory}/${baseSlug}`);
              menuFields[oldKey] = JSON.stringify(filteredLinks);
            }

            // Add to new links
            if (newCategory !== 'none') {
              const newKey = `${newCategory}_links`;
              let newLinks = [];
              try {
                newLinks = JSON.parse(menuFields[newKey] || '[]');
              } catch {}
              newLinks.push({
                name: selectedPage.title,
                href: `/${newCategory}/${baseSlug}`
              });
              menuFields[newKey] = JSON.stringify(newLinks);
            }

            // Save menu updates
            await fetch('/api/pages', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slug: 'navigation-menu',
                fields: menuFields
              })
            });
          }

          toast.success(`Halaman berhasil dipindahkan ke kategori "${categoryLabels[newCategory]}"!`);
          await fetchPages();
          setSelectedPage(null);
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeletePage = async () => {
    if (!selectedPage) return;
    setDeleteModal({ isOpen: true, page: selectedPage, step: 'confirm', currentAction: '' });
  };

  const executeDeletePage = async () => {
    if (!deleteModal.page) return;
    const pageToDelete = deleteModal.page;

    setDeleteModal(prev => ({ ...prev, step: 'deleting', currentAction: 'Menghapus link navigasi...' }));

    try {
      // 1. Remove link from navigation-menu
      const category = getCategoryFromSlug(pageToDelete.slug);
      if (category !== 'none') {
        const baseSlug = getBaseSlug(pageToDelete.slug, category);
        const navMenuRes = await fetch('/api/pages?slug=navigation-menu');
        if (navMenuRes.ok) {
          const navMenuPage = await navMenuRes.json();
          const linkKey = `${category}_links`;
          let links = [];
          try { links = JSON.parse(navMenuPage.fields[linkKey] || '[]'); } catch {}
          const filtered = links.filter((l: any) => l.href !== `/${category}/${baseSlug}`);
          if (filtered.length !== links.length) {
            await fetch('/api/pages', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slug: 'navigation-menu',
                fields: { ...navMenuPage.fields, [linkKey]: JSON.stringify(filtered) }
              })
            });
          }
        }
      }

      // 2. Delete page record
      setDeleteModal(prev => ({ ...prev, currentAction: 'Menghapus data halaman...' }));
      const res = await fetch(`/api/pages?slug=${pageToDelete.slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus halaman');

      // 3. Refresh
      setDeleteModal(prev => ({ ...prev, currentAction: 'Memperbarui daftar halaman...' }));
      setPages(prev => prev.filter(p => p.slug !== pageToDelete.slug));
      setSelectedPage(null);
      await fetchPages();

      // Done
      setDeleteModal(prev => ({ ...prev, step: 'done', currentAction: '' }));
      setTimeout(() => {
        setDeleteModal({ isOpen: false, page: null, step: 'confirm', currentAction: '' });
        toast.success('Halaman berhasil dihapus!');
      }, 1200);
    } catch (err: any) {
      toast.error(err.message);
      setDeleteModal({ isOpen: false, page: null, step: 'confirm', currentAction: '' });
    }
  };

  const handleAddField = () => {
    const key = prompt('Masukkan nama field baru (contoh: sub_judul, link_selengkapnya):');
    if (!key) return;
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    
    if (editedFields[cleanKey] !== undefined) {
      toast.error('Field ini sudah ada');
      return;
    }

    setEditedFields(prev => ({ ...prev, [cleanKey]: '' }));
    toast.success(`Field "${cleanKey}" ditambahkan!`);
  };

  const handleDeleteField = (key: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Field Konten',
      message: `Apakah Anda yakin ingin menghapus field "${key}"?`,
      confirmText: 'Hapus Field',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        setEditedFields(prev => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
        toast.success(`Field "${key}" terhapus.`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };



  const handleSelectPage = (page: PageContent) => {
    setSelectedPage(page);
    setEditedFields({ ...page.fields });
  };

  const handleBack = () => {
    setSelectedPage(null);
    setEditedFields({});
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [key]: value }));
  };

  const handleDragStart = (e: React.DragEvent, slug: string) => {
    e.dataTransfer.setData('text/plain', slug);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newCategoryId: string) => {
    e.preventDefault();
    const slug = e.dataTransfer.getData('text/plain');
    if (!slug) return;

    if (CORE_PAGES.includes(slug)) {
      toast.error('Halaman inti sistem tidak dapat dipindahkan.');
      return;
    }

    const currentCategory = getCategoryFromSlug(slug);
    if (currentCategory === newCategoryId) return;

    const pageToMove = pages.find(p => p.slug === slug);
    if (!pageToMove) return;

    setConfirmModal({
      isOpen: true,
      title: 'Pindahkan Kategori Halaman',
      message: `Apakah Anda yakin ingin memindahkan halaman "${pageToMove.title}" dari "${categoryLabels[currentCategory]}" ke "${categoryLabels[newCategoryId]}"?`,
      confirmText: 'Pindahkan',
      cancelText: 'Batal',
      isDestructive: false,
      onConfirm: async () => {
        const baseSlug = getBaseSlug(slug, currentCategory);
        const newSlug = newCategoryId === 'none' ? baseSlug : `${newCategoryId}-${baseSlug}`;

        setSaving(true);
        try {
          const updatedFields = {
            ...pageToMove.fields,
            page_category: categoryLabels[newCategoryId] || 'Halaman Mandiri',
          };

          // 1. Create copy
          const postRes = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: newSlug,
              title: pageToMove.title,
              fields: updatedFields,
            }),
          });

          if (!postRes.ok) {
            const pData = await postRes.json();
            throw new Error(pData.error || 'Gagal memindahkan halaman');
          }

          // 2. Delete old page
          const deleteRes = await fetch(`/api/pages?slug=${slug}`, {
            method: 'DELETE',
          });
          if (!deleteRes.ok) {
            const delData = await deleteRes.json();
            throw new Error(delData.error || 'Gagal menghapus halaman lama');
          }

          // 3. Update navigation menu dropdown links
          const navMenuRes = await fetch('/api/pages?slug=navigation-menu');
          if (navMenuRes.ok) {
            const navMenuPage = await navMenuRes.json();
            const menuFields = { ...navMenuPage.fields };

            // Remove from old links
            if (currentCategory !== 'none') {
              const oldKey = `${currentCategory}_links`;
              let oldLinks = [];
              try {
                oldLinks = JSON.parse(menuFields[oldKey] || '[]');
              } catch {}
              const filteredLinks = oldLinks.filter((l: any) => l.href !== `/${currentCategory}/${baseSlug}`);
              menuFields[oldKey] = JSON.stringify(filteredLinks);
            }

            // Add to new links
            if (newCategoryId !== 'none') {
              const newKey = `${newCategoryId}_links`;
              let newLinks = [];
              try {
                newLinks = JSON.parse(menuFields[newKey] || '[]');
              } catch {}
              newLinks.push({
                name: pageToMove.title,
                href: `/${newCategoryId}/${baseSlug}`
              });
              menuFields[newKey] = JSON.stringify(newLinks);
            }

            await fetch('/api/pages', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slug: 'navigation-menu',
                fields: menuFields
              })
            });
          }

          toast.success(`Halaman "${pageToMove.title}" berhasil dipindahkan ke kategori "${categoryLabels[newCategoryId]}"!`);
          await fetchPages();
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);

    try {
      const res = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPage.slug,
          fields: editedFields,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      toast.success('Konten halaman berhasil diperbarui!');
      
      // Update local state
      setPages(prev => prev.map(p => 
        p.slug === selectedPage.slug 
          ? { ...p, fields: { ...editedFields } }
          : p
      ));
      setSelectedPage(prev => prev ? { ...prev, fields: { ...editedFields } } : null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = selectedPage && JSON.stringify(editedFields) !== JSON.stringify(selectedPage.fields);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-[#1E6F3D]/20 rounded-full" />
          <div className="absolute inset-0 w-10 h-10 border-4 border-[#1E6F3D] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Determine labels and icons dynamically if selectedPage exists
  const labels = selectedPage ? (FIELD_LABELS[selectedPage.slug] || {}) : {};
  const Icon = selectedPage ? (PAGE_ICONS[selectedPage.slug] || FileEdit) : FileEdit;

  return (
    <div className="space-y-6">
      {selectedPage ? (
        <>
          {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl h-9 w-9 cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Edit: {selectedPage.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ubah konten yang tampil di halaman ini</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'superadmin' && !CORE_PAGES.includes(selectedPage.slug) && (
              <Button
                onClick={handleDeletePage}
                disabled={saving}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 h-10 px-4 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Hapus Halaman
                  </>
                )}
              </Button>
            )}
            <Button
              type="button"
              onClick={() => {
                localStorage.setItem('page_preview_data', JSON.stringify({
                  slug: selectedPage.slug,
                  title: selectedPage.title,
                  fields: editedFields
                }));
                
                // Helper functions to resolve actual preview URLs
                const getCategoryFromSlug = (s: string): string => {
                  const prefixes = ['profil', 'ppid', 'informasi', 'layanan', 'download', 'gallery'];
                  for (const prefix of prefixes) {
                    if (s.startsWith(`${prefix}-`)) return prefix;
                  }
                  return 'none';
                };
                
                const getBaseSlug = (s: string, cat: string): string => {
                  if (cat === 'none') return s;
                  return s.startsWith(`${cat}-`) ? s.slice(cat.length + 1) : s;
                };

                const category = getCategoryFromSlug(selectedPage.slug);
                const baseSlug = getBaseSlug(selectedPage.slug, category);
                
                let previewUrl = '/';
                if (selectedPage.slug !== 'hero') {
                  const coreHomeBlocks = ['footer', 'quick-services', 'statistics', 'faq', 'videos', 'gallery', 'partners', 'header-topbar', 'navigation-menu'];
                  if (coreHomeBlocks.includes(selectedPage.slug)) {
                    previewUrl = '/';
                  } else {
                    const routePrefix = category === 'none' ? 'profil' : category;
                    previewUrl = `/${routePrefix}/${baseSlug}`;
                  }
                }

                window.open(`${previewUrl}?preview=true`, '_blank');
              }}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 h-10 px-4 transition-all"
            >
              <Eye className="w-4 h-4" /> Pratinjau Halaman
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] hover:shadow-lg text-white rounded-xl cursor-pointer flex items-center gap-1.5 h-10 px-5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Change indicator */}
        {hasChanges && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-700 font-medium">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Ada perubahan yang belum disimpan
          </div>
        )}

        {/* Edit Form */}
        <div className="max-w-4xl mx-auto w-full">
          <Card className="p-6 border border-gray-200/60 shadow-sm bg-white rounded-2xl space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1E6F3D]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#1E6F3D]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedPage.title}</h3>
                  <p className="text-[11px] text-gray-400">Slug: {selectedPage.slug}</p>
                </div>
              </div>

              {/* Move Category Selector (only for dynamic pages) */}
              {!CORE_PAGES.includes(selectedPage.slug) && (
                <div className="p-4 rounded-xl border border-[#1E6F3D]/20 bg-[#1E6F3D]/5 space-y-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    📁 Pindahkan Kategori Dropdown
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={getCategoryFromSlug(selectedPage.slug)}
                      onChange={(e) => handleMoveCategory(e.target.value)}
                      disabled={saving}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#1E6F3D]/50 focus:ring-1 focus:ring-[#1E6F3D]/20 transition-all font-semibold text-gray-700 cursor-pointer disabled:opacity-50"
                    >
                      <option value="profil">Dropdown: Profil</option>
                      <option value="ppid">Dropdown: PPID</option>
                      <option value="informasi">Dropdown: Informasi</option>
                      <option value="layanan">Dropdown: Layanan</option>
                      <option value="download">Dropdown: Download</option>
                      <option value="gallery">Dropdown: Galeri / Gallery</option>
                      <option value="none">Tanpa Dropdown (Halaman Mandiri)</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Memindahkan kategori akan memperbarui URL halaman di navigasi utama.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {(() => {
                  const fieldOrder = [
                    'page_category',
                    'page_title',
                    'page_description',
                    'content_heading',
                    'content_body',
                    'button_text',
                    'button_url',
                    'gallery_list',
                    'videos_list',
                    'unduh_url'
                  ];
                  return Object.entries(editedFields).sort(([keyA], [keyB]) => {
                    const indexA = fieldOrder.indexOf(keyA);
                    const indexB = fieldOrder.indexOf(keyB);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return keyA.localeCompare(keyB);
                  });
                })().map(([key, value]) => {
                  const label = labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                  
                  // Special interactive gallery list builder
                  if (selectedPage.slug === 'gallery' && key === 'gallery_list') {
                    let items: Array<{ src: string; title: string; category: string }> = [];
                    try {
                      items = value ? JSON.parse(value) : [];
                    } catch {
                      // Fallback
                    }

                    const updateItems = (newItems: typeof items) => {
                      handleFieldChange(key, JSON.stringify(newItems));
                    };

                    return (
                      <div key={key} className="space-y-4 border border-gray-150 p-4 rounded-xl bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-[#1E6F3D]" />
                            {label}
                          </label>
                          <span className="text-[10px] text-gray-450 font-bold bg-gray-200/50 px-2 py-0.5 rounded">
                            {items.length} Foto
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {items.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic text-center py-4 bg-white rounded-lg border border-gray-205">Belum ada foto galeri. Silakan tambahkan di bawah.</p>
                          ) : (
                            items.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center relative group">
                                  {item.src ? (
                                    <img src={item.src} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Camera className="w-6 h-6 text-gray-300" />
                                  )}
                                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold cursor-pointer transition-opacity text-center px-1">
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        try {
                                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                          if (res.ok) {
                                            const data = await res.json();
                                            const updated = [...items];
                                            updated[idx].src = data.url;
                                            updateItems(updated);
                                            toast.success('Foto berhasil diunggah!');
                                          } else {
                                            toast.error('Gagal mengunggah foto');
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          toast.error('Gagal mengunggah foto');
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 flex-1 min-w-0">
                                  <Input
                                    value={item.title}
                                    onChange={(e) => {
                                      const updated = [...items];
                                      updated[idx].title = e.target.value;
                                      updateItems(updated);
                                    }}
                                    placeholder="Judul / Keterangan Foto"
                                    className="h-8 text-xs rounded-lg px-2"
                                  />
                                  <div className="flex gap-2">
                                    <Input
                                      value={item.category}
                                      onChange={(e) => {
                                        const updated = [...items];
                                        updated[idx].category = e.target.value;
                                        updateItems(updated);
                                      }}
                                      placeholder="Kategori (e.g. Kegiatan)"
                                      className="h-8 text-xs rounded-lg px-2 flex-1 min-w-0"
                                    />
                                    <Input
                                      value={item.src}
                                      onChange={(e) => {
                                        const updated = [...items];
                                        updated[idx].src = e.target.value;
                                        updateItems(updated);
                                      }}
                                      placeholder="URL Gambar (atau upload)"
                                      className="h-8 text-xs rounded-lg px-2 flex-[2] min-w-0"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col items-center gap-0.5 shrink-0 self-center">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const updated = [...items];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx - 1];
                                      updated[idx - 1] = temp;
                                      updateItems(updated);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer text-xs font-bold"
                                    title="Pindahkan Ke Atas"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === items.length - 1}
                                    onClick={() => {
                                      const updated = [...items];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx + 1];
                                      updated[idx + 1] = temp;
                                      updateItems(updated);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer text-xs font-bold"
                                    title="Pindahkan Ke Bawah"
                                  >
                                    ▼
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: 'Hapus Foto Galeri',
                                        message: `Hapus foto "${item.title || 'ini'}" dari galeri?`,
                                        confirmText: 'Hapus',
                                        cancelText: 'Batal',
                                        isDestructive: true,
                                        onConfirm: () => {
                                          updateItems(items.filter((_, i) => i !== idx));
                                          toast.success('Foto dihapus dari draft perubahan.');
                                        }
                                      });
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                    title="Hapus Foto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <Button
                            type="button"
                            onClick={() => {
                              updateItems([...items, { src: '', title: '', category: 'Kegiatan' }]);
                            }}
                            className="bg-white hover:bg-gray-50 border border-gray-250/70 text-gray-650 text-[10px] h-8 rounded-lg w-full flex items-center justify-center gap-1 cursor-pointer font-bold transition-all"
                          >
                            <Plus className="w-3 h-3" /> Tambah Foto Galeri Baru
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // Special interactive videos list builder
                  if (selectedPage.slug === 'videos' && key === 'videos_list') {
                    let items: Array<{ title: string; thumbnail: string; duration: string; date: string; href?: string }> = [];
                    try {
                      items = value ? JSON.parse(value) : [];
                    } catch {
                      // Fallback
                    }

                    const updateItems = (newItems: typeof items) => {
                      handleFieldChange(key, JSON.stringify(newItems));
                    };

                    return (
                      <div key={key} className="space-y-4 border border-gray-150 p-4 rounded-xl bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                            <Play className="w-3.5 h-3.5 text-red-600" />
                            {label}
                          </label>
                          <span className="text-[10px] text-gray-450 font-bold bg-gray-200/50 px-2 py-0.5 rounded">
                            {items.length} Video
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {items.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic text-center py-4 bg-white rounded-lg border border-gray-205">Belum ada video galeri. Silakan tambahkan di bawah.</p>
                          ) : (
                            items.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center relative group">
                                  {item.thumbnail ? (
                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Play className="w-6 h-6 text-gray-300" />
                                  )}
                                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold cursor-pointer transition-opacity text-center px-1">
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        try {
                                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                          if (res.ok) {
                                            const data = await res.json();
                                            const updated = [...items];
                                            updated[idx].thumbnail = data.url;
                                            updateItems(updated);
                                            toast.success('Thumbnail berhasil diunggah!');
                                          } else {
                                            toast.error('Gagal mengunggah thumbnail');
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          toast.error('Gagal mengunggah thumbnail');
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 flex-1 min-w-0">
                                  <Input
                                    value={item.title}
                                    onChange={(e) => {
                                      const updated = [...items];
                                      updated[idx].title = e.target.value;
                                      updateItems(updated);
                                    }}
                                    placeholder="Judul Video"
                                    className="h-8 text-xs rounded-lg px-2"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      value={item.href || ''}
                                      onChange={(e) => {
                                        const updated = [...items];
                                        updated[idx].href = e.target.value;
                                        updateItems(updated);
                                      }}
                                      placeholder="Link YouTube (https://...)"
                                      className="h-8 text-xs rounded-lg px-2"
                                    />
                                    <div className="flex gap-1">
                                      <Input
                                        value={item.duration}
                                        onChange={(e) => {
                                          const updated = [...items];
                                          updated[idx].duration = e.target.value;
                                          updateItems(updated);
                                        }}
                                        placeholder="Durasi (e.g. 5:30)"
                                        className="h-8 text-xs rounded-lg px-1 flex-1 min-w-0"
                                      />
                                      <Input
                                        value={item.date}
                                        onChange={(e) => {
                                          const updated = [...items];
                                          updated[idx].date = e.target.value;
                                          updateItems(updated);
                                        }}
                                        placeholder="Tahun"
                                        className="h-8 text-xs rounded-lg px-1 flex-1 min-w-0"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-center gap-0.5 shrink-0 self-center">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const updated = [...items];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx - 1];
                                      updated[idx - 1] = temp;
                                      updateItems(updated);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer text-xs font-bold"
                                    title="Pindahkan Ke Atas"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === items.length - 1}
                                    onClick={() => {
                                      const updated = [...items];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx + 1];
                                      updated[idx + 1] = temp;
                                      updateItems(updated);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer text-xs font-bold"
                                    title="Pindahkan Ke Bawah"
                                  >
                                    ▼
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: 'Hapus Video Galeri',
                                        message: `Hapus video "${item.title || 'ini'}" dari galeri?`,
                                        confirmText: 'Hapus',
                                        cancelText: 'Batal',
                                        isDestructive: true,
                                        onConfirm: () => {
                                          updateItems(items.filter((_, i) => i !== idx));
                                          toast.success('Video dihapus dari draft perubahan.');
                                        }
                                      });
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                    title="Hapus Video"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <Button
                            type="button"
                            onClick={() => {
                              updateItems([...items, { title: '', thumbnail: '', duration: '', date: '2026', href: '' }]);
                            }}
                            className="bg-white hover:bg-gray-50 border border-gray-250/70 text-gray-650 text-[10px] h-8 rounded-lg w-full flex items-center justify-center gap-1 cursor-pointer font-bold transition-all"
                          >
                            <Plus className="w-3 h-3" /> Tambah Video Galeri Baru
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // Special interactive list builder for navigation-menu dropdown JSON arrays
                  if (selectedPage.slug === 'navigation-menu') {
                    let links: Array<{ name: string; href: string }> = [];
                    try {
                      links = value ? JSON.parse(value) : [];
                    } catch {
                      // Fallback if not valid JSON
                    }

                    const updateLinks = (newLinks: typeof links) => {
                      handleFieldChange(key, JSON.stringify(newLinks));
                    };

                    return (
                      <div key={key} className="space-y-2 border border-gray-150 p-4 rounded-xl bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800">
                            {label}
                          </label>
                          <span className="text-[10px] text-gray-450 font-bold bg-gray-200/50 px-2 py-0.5 rounded">
                            {links.length} Link
                          </span>
                        </div>

                        {/* List of items */}
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                          {links.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic text-center py-2">Belum ada menu link. Tambahkan di bawah.</p>
                          ) : (
                            links.map((link, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                  <Input
                                    value={link.name}
                                    onChange={(e) => {
                                      const updated = [...links];
                                      updated[idx].name = e.target.value;
                                      updateLinks(updated);
                                    }}
                                    placeholder="Nama Menu"
                                    className="h-8 text-xs rounded-lg px-2"
                                  />
                                  <Input
                                    value={link.href}
                                    onChange={(e) => {
                                      const updated = [...links];
                                      updated[idx].href = e.target.value;
                                      updateLinks(updated);
                                    }}
                                    placeholder="Link (/profil/...)"
                                    className="h-8 text-xs rounded-lg px-2"
                                  />
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {/* Move Up */}
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const updated = [...links];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx - 1];
                                      updated[idx - 1] = temp;
                                      updateLinks(updated);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-650 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs font-bold"
                                    title="Pindahkan Ke Atas"
                                  >
                                    ▲
                                  </button>
                                  {/* Move Down */}
                                  <button
                                    type="button"
                                    disabled={idx === links.length - 1}
                                    onClick={() => {
                                      const updated = [...links];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx + 1];
                                      updated[idx + 1] = temp;
                                      updateLinks(updated);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-650 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs font-bold"
                                    title="Pindahkan Ke Bawah"
                                  >
                                    ▼
                                  </button>
                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: 'Hapus Link Menu',
                                        message: `Hapus link "${link.name}" dari menu ini?`,
                                        confirmText: 'Hapus',
                                        cancelText: 'Batal',
                                        isDestructive: true,
                                        onConfirm: () => {
                                          updateLinks(links.filter((_, i) => i !== idx));
                                          toast.success('Link dihapus dari draft perubahan.');
                                        }
                                      });
                                    }}
                                    className="p-1 text-red-500 hover:text-red-750 cursor-pointer"
                                    title="Hapus Link"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add new link form */}
                        <div className="pt-2 border-t border-gray-100">
                          <Button
                            type="button"
                            onClick={() => {
                              const name = prompt('Masukkan Nama Menu Link:');
                              if (!name) return;
                              const href = prompt('Masukkan URL Link (contoh: /profil/sejarah):', '/');
                              if (!href) return;
                              updateLinks([...links, { name, href }]);
                            }}
                            className="bg-white hover:bg-gray-50 border border-gray-250/70 text-gray-650 text-[10px] h-8 rounded-lg w-full flex items-center justify-center gap-1 cursor-pointer font-bold transition-all"
                          >
                            <Plus className="w-3 h-3" /> Tambah Baris Link Baru
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  const isLongField = value.length > 80 || key.includes('deskripsi') || key.includes('description') || key.includes('misi_') || key.includes('visi');
                  
                  return (
                    <div key={key} className="space-y-1.5 relative group/field">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          {label}
                          <span className="text-[10px] font-normal text-gray-400">({key})</span>
                        </label>
                        {user?.role === 'superadmin' && (
                          <button
                            onClick={() => handleDeleteField(key)}
                            className="opacity-0 group-hover/field:opacity-100 text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 transition-opacity cursor-pointer p-1"
                            title="Hapus Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Field
                          </button>
                        )}
                      </div>
                      {isLongField ? (
                        <textarea
                          value={value}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#1E6F3D]/50 focus:ring-1 focus:ring-[#1E6F3D]/20 transition-all"
                        />
                      ) : (
                        <Input
                          value={value}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          className="rounded-xl h-10 border-gray-200"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Add new field button (Only for superadmin) */}
                {user?.role === 'superadmin' && (
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      onClick={handleAddField}
                      variant="outline"
                      className="w-full border-dashed border-gray-300 hover:border-[#1E6F3D] hover:text-[#1E6F3D] rounded-xl flex items-center justify-center gap-1.5 text-xs h-10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Field Baru
                    </Button>
                  </div>
                )}
              </div>
            </Card>
        </div>
      </>
      ) : (
      <>
        {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Halaman</h2>
          <p className="text-xs text-gray-500 mt-0.5">Edit konten teks, deskripsi, dan informasi yang tampil di setiap halaman website</p>
        </div>
        {user?.role === 'superadmin' && (
          <Button
            onClick={() => setShowAddPageModal(true)}
            className="bg-[#1E6F3D] text-white hover:bg-[#15522c] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah Halaman
          </Button>
        )}
      </div>

      {/* Categories Accordion */}
      <div className="space-y-4">
        {dynamicCategories.map((category) => {
          const categoryPages = pages.filter(p => category.slugs.includes(p.slug));
          const isExpanded = expandedCategories[category.id];

          return (
            <Card 
              key={category.id} 
              className={`border border-gray-200/60 shadow-sm rounded-2xl overflow-hidden transition-all duration-200 ${
                draggedOverCategory === category.id 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-md' 
                  : 'bg-white'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => { e.preventDefault(); setDraggedOverCategory(category.id); }}
              onDragLeave={() => setDraggedOverCategory(null)}
              onDrop={(e) => { setDraggedOverCategory(null); handleDrop(e, category.id); }}
            >
              {/* Category Header (Toggle) */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-gray-905 flex items-center gap-2.5 text-base">
                    <span>{category.title}</span>
                    <span className="text-[10px] font-bold bg-[#1E6F3D]/10 text-[#1E6F3D] px-2 py-0.5 rounded-full shrink-0">
                      {categoryPages.length} Halaman
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </button>

              {/* Collapsible content with animation */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <div className="p-5 pt-0 border-t border-gray-50 bg-gray-50/30">
                      <div className="grid sm:grid-cols-2 gap-4 mt-5">
                        {categoryPages.map((page) => {
                          const Icon = PAGE_ICONS[page.slug] || FileEdit;
                          const fieldCount = Object.keys(page.fields).length;

                          return (
                            <Card
                              key={page.slug}
                              className={`group p-4 border border-gray-200/80 shadow-sm bg-white rounded-xl cursor-pointer hover:shadow-md hover:border-[#1E6F3D]/25 transition-all duration-300 ${
                                !CORE_PAGES.includes(page.slug) ? 'cursor-grab active:cursor-grabbing' : ''
                              }`}
                              onClick={() => handleSelectPage(page)}
                              draggable={!CORE_PAGES.includes(page.slug)}
                              onDragStart={(e) => handleDragStart(e, page.slug)}
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform duration-300 shrink-0">
                                  <Icon className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors truncate">{page.title}</h4>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{fieldCount} field dapat diedit</p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1E6F3D] group-hover:translate-x-1 transition-all shrink-0" />
                              </div>
                            </Card>
                          );
                        })}
                        {categoryPages.length === 0 && (
                          <div className="col-span-2 text-center py-6 text-xs text-gray-400">
                            Tidak ada halaman dalam kategori ini.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {pages.length === 0 && (
        <Card className="p-12 border border-gray-200/60 shadow-sm bg-white rounded-2xl text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Belum ada data halaman</p>
              <p className="text-xs text-gray-400 mt-0.5">Data konten halaman akan muncul di sini</p>
            </div>
          </div>
        </Card>
      )}
      </>
      )}

      {/* Add Page Modal (Only for Superadmin) */}
      <AnimatePresence>
        {showAddPageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200/60 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowAddPageModal(false)}
                className="absolute top-4 right-4 text-gray-450 hover:text-gray-650 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div>
                <h3 className="text-base font-bold text-gray-900">Tambah Halaman Baru</h3>
                <p className="text-xs text-gray-550 mt-0.5">Buat halaman dinamis baru untuk website</p>
              </div>

              <form onSubmit={handleAddPage} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Judul Halaman</label>
                  <Input
                    required
                    value={newPageTitle}
                    onChange={(e) => {
                      setNewPageTitle(e.target.value);
                      // Auto-generate safe slug
                      setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                    }}
                    placeholder="Contoh: Sejarah Dinas"
                    className="rounded-xl h-10 border-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Slug Halaman (URL)</label>
                  <Input
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="Contoh: sejarah-dinas"
                    className="rounded-xl h-10 border-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Kategori Dropdown (Navigasi)</label>
                  <select
                    value={newPageCategory}
                    onChange={(e) => setNewPageCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#1E6F3D]/50 focus:ring-1 focus:ring-[#1E6F3D]/20 transition-all font-medium text-gray-750 h-10 cursor-pointer"
                  >
                    <option value="profil">Dropdown: Profil</option>
                    <option value="ppid">Dropdown: PPID</option>
                    <option value="informasi">Dropdown: Informasi</option>
                    <option value="layanan">Dropdown: Layanan</option>
                    <option value="download">Dropdown: Download</option>
                    <option value="gallery">Dropdown: Galeri / Gallery</option>
                    <option value="none">Tanpa Dropdown (Halaman Mandiri)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => setShowAddPageModal(false)}
                    className="rounded-xl h-10 border-gray-200 cursor-pointer text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1E6F3D] hover:bg-[#15522c] text-white rounded-xl h-10 px-5 cursor-pointer text-xs font-bold flex items-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Halaman'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generic Confirmation Modal (for move category, delete field, etc.) */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-150 shadow-2xl relative space-y-4"
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmModal.isDestructive 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-emerald-50 text-[#1E6F3D]'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900">{confirmModal.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{confirmModal.message}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="rounded-xl h-9 text-xs border-gray-200 cursor-pointer font-semibold"
                >
                  {confirmModal.cancelText || 'Batal'}
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => confirmModal.onConfirm()}
                  className={`rounded-xl h-9 text-xs text-white cursor-pointer font-bold flex items-center gap-1.5 ${
                    confirmModal.isDestructive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[#1E6F3D] hover:bg-[#15522c]'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    confirmModal.confirmText || 'Konfirmasi'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.page && (
          <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Header with icon */}
              <div className={`px-6 pt-8 pb-5 text-center transition-colors duration-500 ${
                deleteModal.step === 'done' ? 'bg-emerald-50' : 'bg-gradient-to-b from-red-50 to-white'
              }`}>
                <motion.div
                  className="mx-auto mb-4 relative"
                  animate={deleteModal.step === 'deleting' ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {deleteModal.step === 'done' ? (
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                        <CircleCheck className="w-8 h-8 text-emerald-600" />
                      </motion.div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center relative">
                      {deleteModal.step === 'deleting' && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-red-300"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                      <Trash2 className={`w-7 h-7 text-red-600 ${deleteModal.step === 'deleting' ? 'animate-pulse' : ''}`} />
                    </div>
                  )}
                </motion.div>

                <h3 className={`text-lg font-bold transition-colors duration-500 ${
                  deleteModal.step === 'done' ? 'text-emerald-800' : 'text-gray-900'
                }`}>
                  {deleteModal.step === 'confirm' && 'Hapus Halaman?'}
                  {deleteModal.step === 'deleting' && 'Menghapus Halaman...'}
                  {deleteModal.step === 'done' && 'Berhasil Dihapus!'}
                </h3>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                {deleteModal.step === 'confirm' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Page info card */}
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <FileEdit className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{deleteModal.page.title}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">/{deleteModal.page.slug}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed text-center">
                      Halaman ini beserta seluruh kontennya akan <span className="font-bold text-red-600">dihapus permanen</span> dan tidak dapat dikembalikan.
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteModal({ isOpen: false, page: null, step: 'confirm', currentAction: '' })}
                        className="flex-1 rounded-xl h-11 text-sm border-gray-200 cursor-pointer font-semibold hover:bg-gray-50"
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        onClick={executeDeletePage}
                        className="flex-1 rounded-xl h-11 text-sm text-white cursor-pointer font-bold bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                      >
                        <Trash2 className="w-4 h-4" />
                        Ya, Hapus
                      </Button>
                    </div>
                  </motion.div>
                )}

                {deleteModal.step === 'deleting' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-2">
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 3, ease: 'easeInOut' }}
                      />
                    </div>

                    {/* Current action */}
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                      <p className="text-xs text-gray-600 font-medium">{deleteModal.currentAction}</p>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center">Mohon tunggu, jangan tutup halaman ini.</p>
                  </motion.div>
                )}

                {deleteModal.step === 'done' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="py-2 text-center">
                    <p className="text-sm text-emerald-700 font-semibold">Halaman berhasil dihapus dari sistem.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Menutup otomatis...</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Saving Overlay */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-[2px] z-[200] flex flex-col items-center justify-center"
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-gray-100">
              <Loader2 className="w-8 h-8 text-[#1E6F3D] animate-spin" />
              <p className="text-sm font-bold text-gray-700">Memproses Data...</p>
              <p className="text-xs text-gray-500">Mohon tunggu sebentar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Visual live-preview block for page edits
function PagePreview({ slug, fields }: { slug: string; fields: Record<string, string> }) {
  switch (slug) {
    case 'hero':
      return <HeroPreview fields={fields} />;

    case 'visi-misi':
      return (
        <div className="space-y-3.5 bg-gray-50 p-4 rounded-xl border border-gray-250/60">
          <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-sm">
            <h4 className="text-[10px] font-bold text-[#1E6F3D] uppercase tracking-wider mb-1">Visi</h4>
            <p className="text-[11px] font-bold text-gray-800 leading-relaxed italic">"{fields.visi || '-'}"</p>
            <p className="text-[9px] text-gray-400 mt-1">{fields.visi_deskripsi || '-'}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-sm space-y-1.5">
            <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Misi</h4>
            <ol className="list-decimal pl-3.5 text-[10px] text-gray-650 space-y-1">
              {fields.misi_1 && <li>{fields.misi_1}</li>}
              {fields.misi_2 && <li>{fields.misi_2}</li>}
              {fields.misi_3 && <li>{fields.misi_3}</li>}
              {fields.misi_4 && <li>{fields.misi_4}</li>}
              {fields.misi_5 && <li>{fields.misi_5}</li>}
            </ol>
          </div>
        </div>
      );

    case 'kontak':
      return (
        <div className="bg-white border border-gray-200/80 p-4 rounded-xl space-y-3 shadow-sm text-[11px] text-gray-600">
          <div className="flex gap-2">
            <span className="font-bold text-gray-800 shrink-0 w-16">Alamat:</span>
            <span>{fields.alamat || '-'}</span>
          </div>
          <div className="flex gap-2 border-t border-gray-50 pt-2">
            <span className="font-bold text-gray-800 shrink-0 w-16">Telepon:</span>
            <span className="text-[#1E6F3D] font-bold">{fields.telepon || '-'}</span>
          </div>
          <div className="flex gap-2 border-t border-gray-50 pt-2">
            <span className="font-bold text-gray-800 shrink-0 w-16">Email:</span>
            <span className="text-blue-600 underline font-medium">{fields.email || '-'}</span>
          </div>
          <div className="flex gap-2 border-t border-gray-50 pt-2">
            <span className="font-bold text-gray-800 shrink-0 w-16">Jam Kerja:</span>
            <span className="bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded text-[9px] border border-green-100">
              {fields.jam_kerja || '-'}
            </span>
          </div>
        </div>
      );

    case 'footer':
      return (
        <div className="bg-slate-950 text-white p-4 rounded-xl space-y-3.5 text-[11px] border border-slate-900 shadow-lg">
          <div>
            <h4 className="text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">Mengenai Kami</h4>
            <p className="text-slate-400 leading-relaxed">{fields.deskripsi || '-'}</p>
          </div>
          <div className="border-t border-slate-900 pt-2.5">
            <h4 className="text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">Kantor</h4>
            <p className="text-slate-400">{fields.alamat_line1 || '-'}</p>
            <p className="text-slate-400">{fields.alamat_line2 || '-'}</p>
          </div>
          <div className="border-t border-slate-900 pt-2.5 flex flex-wrap gap-1.5">
            {fields.facebook && <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] text-slate-400">Facebook</span>}
            {fields.instagram && <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] text-slate-400">Instagram</span>}
            {fields.twitter && <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] text-slate-400">Twitter</span>}
            {fields.youtube && <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] text-slate-400">YouTube</span>}
            {fields.website && <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] text-slate-400">Website</span>}
          </div>
        </div>
      );

    case 'header-topbar':
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between text-[10px] font-medium border border-slate-800 shadow-sm">
          <div className="flex items-center gap-1 text-slate-300">
            <span>📍 {fields.location || '-'}</span>
          </div>
          <div className="text-slate-400">
            <span>{fields.show_live_weather === 'true' ? '🌦️ Cuaca Real-Time' : `🌦️ ${fields.weather_label || '-'}`}</span>
          </div>
        </div>
      );

    case 'navigation-menu': {
      const parseLinks = (str?: string) => {
        try {
          return str ? JSON.parse(str) : [];
        } catch {
          return [];
        }
      };
      
      const menus = [
        { label: 'Profil', links: parseLinks(fields.profil_links) },
        { label: 'Layanan', links: parseLinks(fields.layanan_links) },
        { label: 'Informasi', links: parseLinks(fields.informasi_links) },
        { label: 'PPID', links: parseLinks(fields.ppid_links) },
        { label: 'Galeri', links: parseLinks(fields.gallery_links) },
        { label: 'Download', links: parseLinks(fields.download_links) },
      ];

      return (
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md space-y-4 text-left">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            Struktur Dropdown Menu Navigasi
          </div>
          <div className="grid grid-cols-2 gap-3">
            {menus.map((menu) => (
              <div key={menu.label} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/30">
                <div className="text-xs font-bold text-amber-400 mb-1.5 flex justify-between items-center">
                  <span>{menu.label}</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded font-normal font-mono scale-90">
                    {menu.links.length}
                  </span>
                </div>
                <div className="space-y-1 max-h-[120px] overflow-y-auto pr-0.5">
                  {menu.links.length === 0 ? (
                    <div className="text-[9px] text-slate-500 italic">Kosong</div>
                  ) : (
                    menu.links.map((link: any, idx: number) => (
                      <div key={idx} className="text-[9px] flex items-center justify-between text-slate-300 bg-slate-800 px-1.5 py-1 rounded">
                        <span className="font-semibold truncate max-w-[80px]" title={link.name}>{link.name}</span>
                        <span className="text-[7px] text-slate-500 truncate max-w-[60px]" title={link.href}>{link.href}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      // Handles JSON list fields safely (quick-services, statistics, faq, videos, gallery, partners)
      try {
        const listFieldKey = Object.keys(fields)[0];
        if (listFieldKey && fields[listFieldKey]) {
          const listData = JSON.parse(fields[listFieldKey]);
          if (Array.isArray(listData)) {
            return (
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 select-none">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>List Data ({listData.length} Item)</span>
                  <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono">JSON</span>
                </div>
                {listData.slice(0, 4).map((item: any, i: number) => (
                  <div key={i} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg text-[10px] space-y-1">
                    {Object.entries(item).map(([k, v]: [string, any]) => (
                      <div key={k} className="flex gap-2">
                        <span className="font-bold text-slate-400 shrink-0 w-16 truncate">{k}:</span>
                        <span className="text-slate-700 truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                      </div>
                    ))}
                  </div>
                ))}
                {listData.length > 4 && (
                  <div className="text-[9px] text-center text-slate-400 italic pt-1">
                    + {listData.length - 4} item lainnya tidak ditampilkan di pratinjau
                  </div>
                )}
              </div>
            );
          }
        }
      } catch (e) {
        return (
          <div className="p-3 bg-red-50 border border-red-200 text-red-750 text-[10px] rounded-lg">
            ⚠️ Format JSON tidak valid. Harap perbaiki penulisan JSON di kolom form agar preview dapat ditampilkan.
          </div>
        );
      }
      return (
        <div className="p-6 text-center text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
          Tidak ada pratinjau visual khusus untuk halaman ini.
        </div>
      );
  }
}

// Subcomponent to handle stateful slider preview for the Hero page
function HeroPreview({ fields }: { fields: Record<string, string> }) {
  const images = [
    fields.bg_image_1 || '/hero-bg.png',
    fields.bg_image_2 || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
    fields.bg_image_3 || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80'
  ];
  
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % images.length);
    }, 4500); // Rotate slide in preview
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="text-white p-5 rounded-xl space-y-4 shadow-md text-center relative overflow-hidden min-h-[230px] flex flex-col justify-between">
      {/* Slideshow background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide}
            src={images[slide]}
            alt={`Slide ${slide + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2e1a]/90 via-[#0a2e1a]/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10" />
      </div>

      <div className="relative z-20 space-y-2.5 mt-2">
        <span className="inline-block bg-white/20 text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
          {fields.badge || 'Welcome'}
        </span>
        <h3 className="text-sm font-extrabold leading-tight text-white line-clamp-2">
          {fields.heading || 'Judul Utama'}
        </h3>
        <p className="text-[10px] text-white/80 max-w-xs mx-auto leading-relaxed line-clamp-2">
          {fields.subheading || 'Subjudul'}
        </p>
      </div>

      {/* Dots Indicator */}
      <div className="relative z-20 flex justify-center gap-1.5 my-1">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${slide === i ? 'bg-amber-400 w-3' : 'bg-white/40'}`}
          />
        ))}
      </div>

      <div className="relative z-20 border-t border-white/20 pt-2 grid grid-cols-3 gap-1 text-center bg-black/20 rounded-lg p-2.5">
        <div>
          <div className="text-xs font-black text-amber-300">{fields.stat1_value || '0'}</div>
          <div className="text-[8px] text-white/70 font-semibold truncate">{fields.stat1_label || 'Stat 1'}</div>
        </div>
        <div>
          <div className="text-xs font-black text-amber-300">{fields.stat2_value || '0'}</div>
          <div className="text-[8px] text-white/70 font-semibold truncate">{fields.stat2_label || 'Stat 2'}</div>
        </div>
        <div>
          <div className="text-xs font-black text-amber-300">{fields.stat3_value || '0'}</div>
          <div className="text-[8px] text-white/70 font-semibold truncate">{fields.stat3_label || 'Stat 3'}</div>
        </div>
      </div>
    </div>
  );
}
