"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Search, Facebook, Instagram, Twitter, Youtube, Globe, Lock, LogOut, LayoutDashboard, User as UserIcon, Eye, EyeOff, AlertCircle, ShieldCheck, Newspaper, Megaphone, Loader2, Home, Image, Cpu, PhoneCall, FileText, Download, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../shared/auth-context';

const navLinks = [
  { name: 'Beranda', href: '/' },
  { name: 'Berita', href: '/berita' },
  {
    name: 'Profil', href: '/profil/diskominfo-sandi', children: [
      { name: 'Diskominfo & Sandi', href: '/profil/diskominfo-sandi' },
      { name: 'Visi Misi', href: '/profil/visi-misi' },
      { name: 'Tupoksi', href: '/profil/tupoksi' },
      { name: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
      { name: 'Organisasi', href: '/profil/organisasi' },
    ]
  },
  {
    name: 'PPID', href: '/ppid', children: [
      { name: 'Aspek Sarana dan Prasarana', href: '/ppid/sarana-prasarana' },
      { name: 'Aspek Komitmen Organisasi', href: '/ppid/komitmen-organisasi' },
      { name: 'Informasi Berkala', href: '/ppid/informasi-berkala' },
      { name: 'Formulir Permohonan Informasi', href: 'https://ppidppu.penajamkab.go.id/' },
    ]
  },
  {
    name: 'Informasi', href: '/informasi/kegiatan', children: [
      { name: 'Informasi Kegiatan', href: '/informasi/kegiatan' },
      { name: 'Agenda', href: '/informasi/agenda' },
      { name: 'Pengumuman', href: '/informasi/pengumuman' },
      { name: 'Menara Telekomunikasi', href: '/peta?tab=bts' },
      { name: 'Wifi Publik', href: '/peta?tab=wifi' },
      { name: 'CCTV', href: '/peta?tab=cctv' },
      { name: 'DPA 2024', href: '/informasi/dpa' },
    ]
  },
  {
    name: 'Gallery', href: '/gallery/foto', children: [
      { name: 'Foto', href: '/gallery/foto' },
      { name: 'Video', href: '/gallery/video' },
    ]
  },
  {
    name: 'Layanan', href: '/layanan', children: [
      { name: 'Wifi Publik', href: '/peta?tab=wifi' },
      { name: 'Pengaduan Masyarakat', href: '/layanan/pengaduan-masyarakat' },
      { name: 'Subdomain & Hosting', href: '/layanan/subdomain-dan-hosting' },
      { name: 'Portal Satu Data', href: 'https://data.penajamkab.go.id/' },
      { name: 'Open Data', href: 'https://opendata.penajamkab.go.id/' },
      { name: 'Tanda Tangan Elektronik', href: '/layanan/tanda-tangan-elektronik' },
      { name: 'Video Conference', href: '/layanan/fasilitas-video-conference' },
    ]
  },
  {
    name: 'Download', href: '/download/regulasi', children: [
      { name: 'Regulasi', href: '/download/regulasi' },
      { name: 'Materi', href: '/download/materi' },
      { name: 'Dokumen Teknis', href: '/download/dokumen-teknis' },
    ]
  },
  { name: 'Kontak', href: '/kontak' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/diskominfoPPU/', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/diskominfo.ppu/', label: 'Instagram' },
  { icon: Twitter, href: 'https://x.com/diskominfoppu', label: 'X (Twitter)' },
  { icon: Youtube, href: 'https://www.youtube.com/channel/UCWlYHCuEAeWppVyvfUBj_AQ/videos', label: 'YouTube' },
  { icon: Globe, href: 'https://diskominfo.penajamkab.go.id/', label: 'Website Resmi' },
];

interface DropdownItem {
  name: string;
  href: string;
}

function DropdownMenu({
  children,
  items,
  isAdmin,
  isEditMode,
  isEditable,
  onAddItem,
  onRemoveItem,
}: {
  children: React.ReactNode;
  items: DropdownItem[];
  isAdmin?: boolean;
  isEditMode?: boolean;
  isEditable?: boolean;
  onAddItem?: (name: string) => void;
  onRemoveItem?: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAdd = () => {
    if (newTitle.trim() && onAddItem) {
      onAddItem(newTitle.trim());
      setNewTitle('');
    }
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-gray-700 hover:text-[#1E6F3D] transition-colors font-medium cursor-pointer py-2"
      >
        {children}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-50 overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto px-2 py-1">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 my-0.5 rounded-lg hover:bg-[#1E6F3D]/5 transition-all group/item"
                >
                  {item.href.startsWith('http') ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-sm text-gray-700 hover:text-[#1E6F3D] font-medium transition-all"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex-1 py-2 text-sm text-gray-700 hover:text-[#1E6F3D] font-medium transition-all"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                  {isAdmin && isEditMode && isEditable && onRemoveItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus halaman "${item.name}" dari menu?`)) {
                          onRemoveItem(item.name);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer opacity-0 group-hover/item:opacity-100 shrink-0 ml-1.5"
                      title="Hapus Halaman"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && isEditMode && isEditable && onAddItem && (
              <div className="border-t border-gray-100 mt-2 pt-3 px-4 pb-3.5 bg-gray-50/50">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5">
                  Tambah Halaman
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nama halaman..."
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-[#1E6F3D] focus:border-[#1E6F3D] bg-white text-gray-900 shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd();
                      }
                    }}
                  />
                  <button
                    onClick={handleAdd}
                    className="text-xs bg-[#1E6F3D] hover:bg-[#2E8B57] text-white px-3.5 py-1.5 rounded-lg transition-colors font-bold cursor-pointer shadow-sm shrink-0 active:scale-95"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Navigation bar dropdown — for the white horizontal nav bar (desktop)
function NavBarDropdown({
  children,
  items,
  isActive,
  isAdmin,
  isEditMode,
  onAddItem,
  onRemoveItem,
}: {
  children: React.ReactNode;
  items: DropdownItem[];
  isActive?: boolean;
  isAdmin?: boolean;
  isEditMode?: boolean;
  onAddItem?: (name: string) => void;
  onRemoveItem?: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAdd = () => {
    if (newTitle.trim() && onAddItem) {
      onAddItem(newTitle.trim());
      setNewTitle('');
    }
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all cursor-pointer ${
          isActive 
            ? 'text-[#1E6F3D] bg-[#1E6F3D]/5' 
            : 'text-gray-600 hover:text-[#1E6F3D] hover:bg-gray-50'
        }`}
      >
        {children}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-50 overflow-hidden"
          >
            <div className="max-h-[320px] overflow-y-auto px-1.5 py-0.5">
              {items.map((item) => (
                <div key={item.name} className="flex items-center justify-between px-3 my-0.5 rounded-lg hover:bg-[#1E6F3D]/5 transition-all group/item">
                  {item.href.startsWith('http') ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-sm text-gray-700 hover:text-[#1E6F3D] font-medium transition-all"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex-1 py-2 text-sm text-gray-700 hover:text-[#1E6F3D] font-medium transition-all"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                  {isAdmin && isEditMode && onRemoveItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus halaman "${item.name}" dari menu?`)) {
                          onRemoveItem(item.name);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer opacity-0 group-hover/item:opacity-100 shrink-0 ml-1.5"
                      title="Hapus Halaman"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && isEditMode && onAddItem && (
              <div className="border-t border-gray-100 mt-2 pt-3 px-4 pb-3.5 bg-gray-50/50">
                <div className="text-[10px] font-bold text-gray-450 uppercase tracking-wider mb-1.5 pl-0.5">
                  Tambah Halaman
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nama halaman..."
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-[#1E6F3D] focus:border-[#1E6F3D] bg-white text-gray-900 shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd();
                      }
                    }}
                  />
                  <button
                    onClick={handleAdd}
                    className="text-xs bg-[#1E6F3D] hover:bg-[#2E8B57] text-white px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer shadow-sm shrink-0 active:scale-95 animate-none"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DEFAULT_PROFIL_LINKS = [
  { name: 'Diskominfo & Sandi', href: '/profil/diskominfo-sandi' },
  { name: 'Visi Misi', href: '/profil/visi-misi' },
  { name: 'Tupoksi', href: '/profil/tupoksi' },
  { name: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
  { name: 'Organisasi', href: '/profil/organisasi' },
];

const DEFAULT_PPID_LINKS = [
  { name: 'Aspek Sarana dan Prasarana', href: '/ppid/sarana-prasarana' },
  { name: 'Aspek Komitmen Organisasi', href: '/ppid/komitmen-organisasi' },
  { name: 'Informasi Berkala', href: '/ppid/informasi-berkala' },
  { name: 'Formulir Permohonan Informasi', href: 'https://ppidppu.penajamkab.go.id/' },
];

const DEFAULT_INFORMASI_LINKS = [
  { name: 'Informasi Kegiatan', href: '/informasi/kegiatan' },
  { name: 'Agenda', href: '/informasi/agenda' },
  { name: 'Pengumuman', href: '/informasi/pengumuman' },
  { name: 'Menara Telekomunikasi', href: '/peta?tab=bts' },
  { name: 'Wifi Publik', href: '/peta?tab=wifi' },
  { name: 'CCTV', href: '/peta?tab=cctv' },
  { name: 'DPA 2024', href: '/informasi/dpa' },
];

const DEFAULT_GALLERY_LINKS = [
  { name: 'Foto', href: '/gallery/foto' },
  { name: 'Video', href: '/gallery/video' },
];

const DEFAULT_LAYANAN_LINKS = [
  { name: 'Pengaduan Masyarakat', href: '/layanan/pengaduan-masyarakat' },
  { name: 'Subdomain & Hosting', href: '/layanan/subdomain-dan-hosting' },
  { name: 'Portal Satu Data', href: 'https://data.penajamkab.go.id/' },
  { name: 'Open Data', href: 'https://opendata.penajamkab.go.id/' },
  { name: 'Tanda Tangan Elektronik', href: '/layanan/tanda-tangan-elektronik' },
  { name: 'Video Conference', href: '/layanan/fasilitas-video-conference' },
];

const DEFAULT_DOWNLOAD_LINKS = [
  { name: 'Regulasi', href: '/download/regulasi' },
  { name: 'Materi', href: '/download/materi' },
  { name: 'Dokumen Teknis', href: '/download/dokumen-teknis' },
];

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  // Authentication states from global context
  const { user, refreshUser, isEditMode, setIsEditMode } = useAuth();

  // Helper to resolve link icons for the sidebar
  const getLinkIcon = (name: string) => {
    switch (name) {
      case 'Beranda': return Home;
      case 'Berita': return Newspaper;
      case 'Profil': return UserIcon;
      case 'PPID': return ShieldCheck;
      case 'Informasi': return Megaphone;
      case 'Gallery': return Image;
      case 'Layanan': return Cpu;
      case 'Download': return Download;
      case 'Kontak': return PhoneCall;
      default: return FileText;
    }
  };

  // Header Top Bar configurations from Database & API
  const [topBarConfig, setTopBarConfig] = useState<{ location: string; weather_label: string; show_live_weather: string }>({
    location: '📍 Kab. Penajam Paser Utara, Kalimantan Timur',
    weather_label: '🌤️ 26°C Penajam',
    show_live_weather: 'true'
  });
  const [weather, setWeather] = useState<{ temp: number; emoji: string } | null>(null);

  // 1. Fetch Top Bar from database
  useEffect(() => {
    fetch('/api/pages?slug=header-topbar')
      .then(res => res.json())
      .then(data => {
        if (data && data.fields) {
          setTopBarConfig({
            location: data.fields.location || '📍 Kab. Penajam Paser Utara, Kalimantan Timur',
            weather_label: data.fields.weather_label || '🌤️ 26°C Penajam',
            show_live_weather: data.fields.show_live_weather || 'true'
          });
        }
      })
      .catch(err => console.warn('Gagal memuat konfigurasi topbar dari database:', err));
  }, [pathname]);

  // 2. Fetch real-time weather from Open-Meteo if enabled
  useEffect(() => {
    if (topBarConfig.show_live_weather !== 'true') {
      setWeather(null);
      return;
    }

    fetch('https://api.open-meteo.com/v1/forecast?latitude=-1.2420&longitude=116.7160&current=temperature_2m,weather_code')
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          
          let emoji = '🌤️';
          if (code === 0) emoji = '☀️';
          else if (code >= 1 && code <= 3) emoji = '🌤️';
          else if (code === 45 || code === 48) emoji = '🌫️';
          else if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) emoji = '🌧️';
          else if (code >= 95) emoji = '⛈️';
          
          setWeather({ temp, emoji });
        }
      })
      .catch(err => {
        console.warn('Gagal memuat cuaca real-time Open-Meteo:', err);
      });
  }, [topBarConfig.show_live_weather]);

  // Lock body scroll when sidebar drawer is open to prevent double scrollbars
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);


  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ news: any[]; announcements: any[]; pages: any[] }>({ news: [], announcements: [], pages: [] });
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ news: [], announcements: [], pages: [] });
      return;
    }

    setSearchLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchQuery('');
        setSearchResults({ news: [], announcements: [], pages: [] });
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [profilLinks, setProfilLinks] = useState(DEFAULT_PROFIL_LINKS);
  const [ppidLinks, setPpidLinks] = useState(DEFAULT_PPID_LINKS);
  const [informasiLinks, setInformasiLinks] = useState(DEFAULT_INFORMASI_LINKS);
  const [galleryLinks, setGalleryLinks] = useState(DEFAULT_GALLERY_LINKS);
  const [layananLinks, setLayananLinks] = useState(DEFAULT_LAYANAN_LINKS);
  const [downloadLinks, setDownloadLinks] = useState(DEFAULT_DOWNLOAD_LINKS);

  useEffect(() => {
    fetch('/api/pages?slug=navigation-menu')
      .then(res => res.json())
      .then(data => {
        if (data.fields) {
          if (data.fields.profil_links) {
            try { setProfilLinks(JSON.parse(data.fields.profil_links)); } catch (e) { console.error(e); }
          }
          if (data.fields.ppid_links) {
            try { setPpidLinks(JSON.parse(data.fields.ppid_links)); } catch (e) { console.error(e); }
          }
          if (data.fields.informasi_links) {
            try { setInformasiLinks(JSON.parse(data.fields.informasi_links)); } catch (e) { console.error(e); }
          }
          if (data.fields.gallery_links) {
            try { setGalleryLinks(JSON.parse(data.fields.gallery_links)); } catch (e) { console.error(e); }
          }
          if (data.fields.layanan_links) {
            try { setLayananLinks(JSON.parse(data.fields.layanan_links)); } catch (e) { console.error(e); }
          }
          if (data.fields.download_links) {
            try { setDownloadLinks(JSON.parse(data.fields.download_links)); } catch (e) { console.error(e); }
          }
        }
      })
      .catch(() => {});
  }, [pathname]);

  const saveLinks = async (menuKey: string, newLinks: any[]) => {
    try {
      await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'navigation-menu',
          title: 'Navigation Menu',
          fields: {
            [menuKey]: JSON.stringify(newLinks)
          }
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (menuName: string, name: string) => {
    const slug = slugify(name);
    if (!slug) return;

    let currentLinks: any[] = [];
    let setLinks: (links: any[]) => void;
    let menuKey: string;
    let pathPrefix: string;

    const lowerMenu = menuName.toLowerCase();
    if (lowerMenu === 'profil') {
      currentLinks = profilLinks;
      setLinks = setProfilLinks;
      menuKey = 'profil_links';
      pathPrefix = '/profil';
    } else if (lowerMenu === 'ppid') {
      currentLinks = ppidLinks;
      setLinks = setPpidLinks;
      menuKey = 'ppid_links';
      pathPrefix = '/ppid';
    } else if (lowerMenu === 'informasi') {
      currentLinks = informasiLinks;
      setLinks = setInformasiLinks;
      menuKey = 'informasi_links';
      pathPrefix = '/informasi';
    } else if (lowerMenu === 'gallery') {
      currentLinks = galleryLinks;
      setLinks = setGalleryLinks;
      menuKey = 'gallery_links';
      pathPrefix = '/gallery';
    } else if (lowerMenu === 'layanan') {
      currentLinks = layananLinks;
      setLinks = setLayananLinks;
      menuKey = 'layanan_links';
      pathPrefix = '/layanan';
    } else if (lowerMenu === 'download') {
      currentLinks = downloadLinks;
      setLinks = setDownloadLinks;
      menuKey = 'download_links';
      pathPrefix = '/download';
    } else {
      return;
    }

    if (currentLinks.some(link => link.name.toLowerCase() === name.toLowerCase() || link.href === `${pathPrefix}/${slug}`)) {
      alert('Halaman dengan nama atau rute tersebut sudah ada!');
      return;
    }

    const pageSlug = `${lowerMenu}-${slug}`;
    const defaultFields = lowerMenu === 'layanan' 
      ? {
          page_title: name,
          page_description: 'Informasi lengkap dan prosedur akses layanan publik Diskominfo.',
          content_heading: 'Informasi & Prosedur Layanan',
          content_body: '## Deskripsi Layanan\n\nLayanan ini disediakan oleh Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara untuk memfasilitasi kebutuhan publik.\n\n### Prosedur Pengajuan:\n1. Pastikan Anda memenuhi dokumen persyaratan.\n2. Klik tombol tautan pendaftaran di bawah ini untuk mengisi formulir online.\n3. Tunggu proses verifikasi berkas oleh admin.',
          button_text: 'Formulir Pendaftaran',
          button_url: 'https://forms.google.com',
        }
      : {
          page_title: name,
          page_description: 'Deskripsi halaman baru ini. Aktifkan Mode Edit untuk menyesuaikan isi konten.',
          content_heading: 'Detail Informasi',
          content_body: '## Selamat Datang\n\nIni adalah halaman baru yang dibuat secara dinamis.\n\n### Cara Mengedit:\n- Aktifkan **Mode Edit** di bilah administrator atas.\n- Gunakan toolbar editor di bawah untuk menambahkan **Headline**, **Subheadline**, **Teks Tebal**, atau **Daftar Bulat**.\n- Anda juga dapat langsung mengunggah gambar dari komputer Anda dengan mengeklik tombol **Tambah Gambar**.',
        };

    try {
      // Pre-create dynamic page content DB entry
      await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: pageSlug,
          title: name,
          fields: defaultFields,
        })
      });
    } catch (e) {
      console.error('Failed to pre-create dynamic page content:', e);
    }

    const newLinks = [...currentLinks, { name, href: `${pathPrefix}/${slug}` }];
    setLinks(newLinks);
    saveLinks(menuKey, newLinks);
    router.push(`${pathPrefix}/${slug}`);
  };

  const handleRemoveItem = async (menuName: string, name: string) => {
    let currentLinks: any[] = [];
    let setLinks: (links: any[]) => void;
    let menuKey: string;

    const lowerMenu = menuName.toLowerCase();
    if (lowerMenu === 'profil') {
      currentLinks = profilLinks;
      setLinks = setProfilLinks;
      menuKey = 'profil_links';
    } else if (lowerMenu === 'ppid') {
      currentLinks = ppidLinks;
      setLinks = setPpidLinks;
      menuKey = 'ppid_links';
    } else if (lowerMenu === 'informasi') {
      currentLinks = informasiLinks;
      setLinks = setInformasiLinks;
      menuKey = 'informasi_links';
    } else if (lowerMenu === 'gallery') {
      currentLinks = galleryLinks;
      setLinks = setGalleryLinks;
      menuKey = 'gallery_links';
    } else if (lowerMenu === 'layanan') {
      currentLinks = layananLinks;
      setLinks = setLayananLinks;
      menuKey = 'layanan_links';
    } else if (lowerMenu === 'download') {
      currentLinks = downloadLinks;
      setLinks = setDownloadLinks;
      menuKey = 'download_links';
    } else {
      return;
    }

    const matchedLink = currentLinks.find(link => link.name === name);
    if (matchedLink) {
      const slug = matchedLink.href.split('/').pop();
      if (slug) {
        const pageSlug = `${lowerMenu}-${slug}`;
        try {
          // Remove page content DB entry
          await fetch(`/api/pages?slug=${pageSlug}`, {
            method: 'DELETE'
          });
        } catch (e) {
          console.error('Failed to delete dynamic page content:', e);
        }
      }
    }

    const newLinks = currentLinks.filter(link => link.name !== name);
    setLinks(newLinks);
    saveLinks(menuKey, newLinks);
  };

  const dynamicNavLinks = navLinks.map(link => {
    const name = link.name;
    if (name === 'Profil') {
      return { ...link, children: profilLinks };
    }
    if (name === 'PPID') {
      return { ...link, children: ppidLinks };
    }
    if (name === 'Informasi') {
      return { ...link, children: informasiLinks };
    }
    if (name === 'Gallery') {
      return { ...link, children: galleryLinks };
    }
    if (name === 'Layanan') {
      return { ...link, children: layananLinks };
    }
    if (name === 'Download') {
      return { ...link, children: downloadLinks };
    }
    return link;
  });

  const desktopNavLinks: any[] = [];
  const lainnyaChildren: any[] = [];

  dynamicNavLinks.forEach((link) => {
    if (['Layanan', 'Download'].includes(link.name)) {
      if (link.children) {
        link.children.forEach((child: any) => {
          lainnyaChildren.push(child);
        });
      }
    } else {
      desktopNavLinks.push(link);
    }
  });

  if (lainnyaChildren.length > 0) {
    desktopNavLinks.push({
      name: 'Lainnya',
      href: '#',
      children: lainnyaChildren
    });
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await refreshUser();
      if (pathname.startsWith('/admin')) {
        router.push('/');
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      {/* Admin Bar */}
      {user && (user.role === 'admin' || user.role === 'superadmin') && (
        <div className="bg-gray-950 text-white text-xs py-2.5 px-4 border-b border-gray-800 z-[100] relative flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-bold text-yellow-400 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrator Panel ({user.role})
            </span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <span className="text-gray-300 font-medium hidden sm:inline">
              Halo, <span className="text-white font-bold">{user.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Edit Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Mode Edit:</span>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEditMode ? 'bg-[#1E6F3D]' : 'bg-gray-600'
                }`}
                title={isEditMode ? 'Nonaktifkan Mode Edit' : 'Aktifkan Mode Edit'}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isEditMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-[10px] font-extrabold uppercase ${isEditMode ? 'text-green-400' : 'text-gray-400'}`}>
                {isEditMode ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            
            <span className="text-gray-700">|</span>
            
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-yellow-300 font-bold bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors border border-white/10"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard Admin
            </Link>

            <span className="text-gray-700">|</span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 hover:text-red-400 font-bold bg-white/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-colors border border-white/10 text-red-300 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-[#0B2C16] text-white/95 border-b border-white/5 text-[11px] py-1.5 px-4 z-50 relative select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline font-medium tracking-wide text-white/80">{topBarConfig.location}</span>
            <span className="hidden md:inline font-medium tracking-wide text-white/85">
              {weather ? `${weather.emoji} ${weather.temp}°C Penajam` : topBarConfig.weather_label}
            </span>
          </div>
          <div className="flex items-center gap-5">
            {/* Social Links */}
            <div className="flex items-center gap-3.5">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                  className="hover:text-yellow-400 transition-colors text-white/70">
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
            {/* Session States */}
            <div className="flex items-center text-[10px]">
              {user ? (
                user.role !== 'admin' && user.role !== 'superadmin' ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline font-medium text-yellow-300">
                      🧑‍💻 {user.name} ({user.role})
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 hover:text-red-300 font-semibold cursor-pointer text-white/80"
                    >
                      <LogOut className="w-3 h-3" /> Keluar
                    </button>
                  </div>
                ) : null
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 border border-white/10 hover:border-white/30 hover:bg-white/5 font-extrabold cursor-pointer text-white/90 px-2 py-1 rounded-lg transition-all tracking-wider uppercase active:scale-95 text-[9px]"
                >
                  <Lock className="w-3 h-3" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ STICKY MAIN HEADER (Unified) ═══════ */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-gray-150 ${
          isScrolled ? 'shadow-md py-2.5' : 'shadow-sm py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3.5 cursor-pointer group pl-1">
              <div className="w-9 h-11 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="Logo Kabupaten Penajam Paser Utara"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="border-l-2 border-[#1E6F3D]/25 pl-3.5">
                <h1 className="text-base sm:text-lg font-black text-gray-900 leading-none tracking-tight uppercase group-hover:text-[#1E6F3D] transition-colors">
                  Diskominfo
                </h1>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-0.5 leading-none">
                  Kab. Penajam Paser Utara
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links (hidden below lg) */}
            <nav className="hidden lg:flex items-center gap-1">
              {desktopNavLinks.map((link) => {
                const isActive = pathname === link.href || (link.children && link.children.some((c: any) => pathname === c.href));

                if (link.children) {
                  const editableMenus = ['Profil', 'PPID', 'Informasi', 'Gallery', 'Layanan', 'Download'];
                  const isEditable = editableMenus.includes(link.name);

                  return (
                    <NavBarDropdown
                      key={link.name}
                      items={link.children}
                      isActive={!!isActive}
                      isAdmin={!!user && (user.role === 'admin' || user.role === 'superadmin')}
                      isEditMode={isEditMode}
                      onAddItem={isEditable ? (name) => handleAddItem(link.name, name) : undefined}
                      onRemoveItem={isEditable ? (name) => handleRemoveItem(link.name, name) : undefined}
                    >
                      {link.name === 'Gallery' ? 'Galeri' : link.name}
                    </NavBarDropdown>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative text-xs xl:text-sm font-bold px-3.5 py-2.5 rounded-xl tracking-wide transition-all ${
                      isActive
                        ? 'text-[#1E6F3D] bg-[#1E6F3D]/5'
                        : 'text-gray-600 hover:text-[#1E6F3D] hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button (Desktop Only — styled for white background) */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults({ news: [], announcements: [], pages: [] });
                  setShowSearchModal(true);
                }}
                className="hidden lg:flex items-center justify-between w-52 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-750 text-xs font-semibold transition-all cursor-pointer py-2 px-4 rounded-full select-none"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <span>Cari informasi...</span>
                </div>
                <kbd className="hidden xl:inline text-[9px] bg-gray-250 text-gray-500 px-1.5 py-0.5 rounded font-mono font-bold border border-gray-300/40">Ctrl+K</kbd>
              </button>

              {/* Search Button (Mobile/Tablet Only) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-gray-100 cursor-pointer text-gray-600 hover:text-gray-900"
                aria-label="Cari"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults({ news: [], announcements: [], pages: [] });
                  setShowSearchModal(true);
                }}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Hamburger — mobile/tablet only (below lg) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full cursor-pointer hover:bg-gray-100 text-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════ SIDEBAR DRAWER (Mobile/Tablet) ═══════ */}
      <nav className="lg:hidden">
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
              />

              {/* Sidebar Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-150 z-[101] flex flex-col h-full"
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="Logo Kab. PPU"
                      className="w-10 h-12 object-contain"
                    />
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">Diskominfo PPU</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Navigasi Utama</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-200/80 rounded-xl transition-all text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sidebar Links (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-1.5 custom-scrollbar">
                  {dynamicNavLinks.map((link) => {
                    const LinkIcon = getLinkIcon(link.name);
                    return (
                      <div key={link.name}>
                        {link.children ? (
                          <>
                            <button
                              onClick={() => setExpandedMobile(expandedMobile === link.name ? null : link.name)}
                              className="flex items-center justify-between w-full py-3 text-gray-800 hover:text-[#1E6F3D] font-bold transition-all text-[15px] cursor-pointer group"
                            >
                              <span className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                                <LinkIcon className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#1E6F3D] transition-colors" />
                                {link.name === 'Gallery' ? 'Galeri' : link.name}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#1E6F3D] transition-transform duration-300 ${expandedMobile === link.name ? 'rotate-180 text-[#1E6F3D]' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedMobile === link.name && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pl-7 border-l border-gray-150 space-y-1 overflow-hidden py-1"
                                >
                                  {link.children.map((child) => (
                                    <div key={child.name} className="flex items-center justify-between group/sidebar-item py-1">
                                      {child.href.startsWith('http') ? (
                                        <a
                                          href={child.href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block py-1.5 text-sm text-gray-600 hover:text-[#1E6F3D] transition-colors font-medium"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          {child.name}
                                        </a>
                                      ) : (
                                        <Link
                                          href={child.href}
                                          className="block py-1.5 text-sm text-gray-600 hover:text-[#1E6F3D] transition-colors font-medium"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          {child.name}
                                        </Link>
                                      )}
                                      {user && (user.role === 'admin' || user.role === 'superadmin') && isEditMode && ['Profil', 'PPID', 'Informasi', 'Gallery', 'Layanan', 'Download'].includes(link.name) && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Apakah Anda yakin ingin menghapus halaman "${child.name}" dari menu?`)) {
                                              handleRemoveItem(link.name, child.name);
                                            }
                                          }}
                                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer opacity-0 group-hover/sidebar-item:opacity-100 shrink-0 ml-1.5"
                                          title="Hapus Halaman"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  ))}

                                  {/* Add Page inside sidebar for admins */}
                                  {user && (user.role === 'admin' || user.role === 'superadmin') && isEditMode && ['Profil', 'PPID', 'Informasi', 'Gallery', 'Layanan', 'Download'].includes(link.name) && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Nama halaman baru..."
                                        className="text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1E6F3D] shadow-sm"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const target = e.target as HTMLInputElement;
                                            if (target.value.trim()) {
                                              handleAddItem(link.name, target.value.trim());
                                              target.value = '';
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            href={link.href}
                            className="flex items-center gap-3 py-3 text-gray-800 hover:text-[#1E6F3D] font-bold transition-all text-[15px] group"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <LinkIcon className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#1E6F3D] transition-colors" />
                            <span className="group-hover:translate-x-1 transition-transform inline-block">{link.name}</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}

                  {/* PPID Online Button in Sidebar */}
                  <div className="mt-6 pt-6 border-t border-gray-100/80 shrink-0">
                    <a href="https://ppidppu.penajamkab.go.id/" target="_blank" rel="noopener noreferrer" className="block w-full">
                      <Button
                        className="w-full bg-gradient-to-r from-[#1E6F3D] via-[#2E8B57] to-[#3CB371] text-white rounded-2xl py-6 hover:shadow-xl hover:shadow-[#1E6F3D]/20 transition-all duration-300 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShieldCheck className="w-5 h-5 text-yellow-300 animate-pulse" />
                        PPID Online
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 space-y-4">
                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-4">
                    {socialLinks.map((social, i) => (
                      <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                        className="text-gray-400 hover:text-[#1E6F3D] transition-colors">
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                  <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    © 2026 Diskominfo PPU
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>



      {/* Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl w-full max-w-2xl p-6 mt-16 overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header Search Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    setShowSearchModal(false);
                    router.push(`/berita?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="flex items-center gap-3 border-b border-gray-150 pb-4 shrink-0 w-full"
              >
                <Search className="w-6 h-6 text-[#1E6F3D] shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Ketik kata kunci lalu tekan ENTER untuk mencari berita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-base text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0"
                />
                {searchLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#1E6F3D] shrink-0" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  ESC
                </button>
              </form>

              {/* Search Results Area */}
              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-5 custom-scrollbar min-h-[200px]">
                {searchLoading && !searchResults.news.length && !searchResults.announcements.length && !searchResults.pages.length ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1E6F3D]" />
                    <p className="text-sm font-medium">Mencari informasi...</p>
                  </div>
                ) : !searchQuery.trim() ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-[#1E6F3D]/55" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Cari Berita & Artikel Diskominfo PPU</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">Temukan rilis media, berita terkini, dan kabar pembangunan daerah terupdate di Kabupaten Penajam Paser Utara.</p>
                  </div>
                ) : searchResults.news.length === 0 && searchResults.announcements.length === 0 && searchResults.pages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                      <AlertCircle className="w-6 h-6 text-red-500/70" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Tidak ada hasil ditemukan</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">Maaf, kami tidak dapat menemukan hasil dengan kata kunci &quot;<span className="font-bold text-gray-600">{searchQuery}</span>&quot;. Silakan coba dengan kata kunci lain.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Halaman / Konten Dinamis Results */}
                    {searchResults.pages.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> Halaman & Layanan ({searchResults.pages.length})
                        </h4>
                        <div className="grid gap-2">
                          {searchResults.pages.map((page: any) => (
                            <Link
                              key={page.slug}
                              href={page.href}
                              onClick={() => setShowSearchModal(false)}
                              className="block p-3.5 rounded-2xl border border-gray-100 hover:border-[#1E6F3D]/20 hover:bg-[#1E6F3D]/5 transition-all group cursor-pointer"
                            >
                              <h5 className="text-sm font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors">{page.title}</h5>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{page.snippet}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Berita Results */}
                    {searchResults.news.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
                          <Newspaper className="w-3.5 h-3.5" /> Artikel Berita ({searchResults.news.length})
                        </h4>
                        <div className="grid gap-2">
                          {searchResults.news.map((item: any) => (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={() => setShowSearchModal(false)}
                              className="block p-3.5 rounded-2xl border border-gray-100 hover:border-[#1E6F3D]/20 hover:bg-[#1E6F3D]/5 transition-all group cursor-pointer"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <h5 className="text-sm font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors line-clamp-1">{item.title}</h5>
                                <span className="text-[10px] text-gray-400 font-semibold shrink-0 mt-0.5">{item.date}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.snippet}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pengumuman Results */}
                    {searchResults.announcements.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
                          <Megaphone className="w-3.5 h-3.5" /> Pengumuman ({searchResults.announcements.length})
                        </h4>
                        <div className="grid gap-2">
                          {searchResults.announcements.map((item: any) => (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={() => setShowSearchModal(false)}
                              className="block p-3.5 rounded-2xl border border-gray-100 hover:border-[#1E6F3D]/20 hover:bg-[#1E6F3D]/5 transition-all group cursor-pointer"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <h5 className="text-sm font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors line-clamp-1">{item.title}</h5>
                                <span className="text-[10px] text-gray-400 font-semibold shrink-0 mt-0.5">{item.date}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.snippet}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
