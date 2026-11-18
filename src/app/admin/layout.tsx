"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Newspaper, 
  Megaphone, 
  Users, 
  LogOut, 
  Globe, 
  Menu, 
  X, 
  User as UserIcon,
  ShieldCheck,
  ChevronRight,
  FileEdit,
  MapPin,
  KeyRound,
  ChevronsLeft,
  ChevronsRight,
  Camera
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // Load sidebar collapse preference
  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin_sidebar_collapsed', String(nextState));
  };

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout gagal', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#1E6F3D]/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-[#1E6F3D] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-500 font-medium animate-pulse">Memuat data sesi...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Kelola Berita', href: '/admin/news', icon: Newspaper },
    { name: 'Kelola Pengumuman', href: '/admin/announcements', icon: Megaphone },
    { name: 'Kelola Halaman', href: '/admin/pages', icon: FileEdit },
    { name: 'Kelola Galeri', href: '/admin/gallery', icon: Camera },
    { name: 'Kelola Peta Digital', href: '/admin/mappoints', icon: MapPin },
    { name: 'Kredensial API', href: '/admin/api-requests', icon: KeyRound },
  ];

  // Only superadmin can manage users
  if (user?.role === 'superadmin') {
    menuItems.push({ name: 'Kelola User', href: '/admin/users', icon: Users });
  }

  // Get page title for breadcrumb
  const getPageTitle = () => {
    const current = menuItems.find(item => item.href === pathname);
    return current?.name || 'Dashboard';
  };

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 30, stiffness: 300 } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.2 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const SidebarContent = ({ isMobile = false, isCollapsed = false }: { isMobile?: boolean; isCollapsed?: boolean }) => (
    <>
      {/* Logo Header */}
      <div className={`p-5 border-b border-white/[0.06] flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <img
          src="/logo.png"
          alt="Logo PPU"
          className="w-10 h-12 object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.25)] shrink-0"
        />
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold leading-tight tracking-tight whitespace-nowrap">Admin Panel</h1>
            <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">Diskominfo PPU</p>
          </div>
        )}
      </div>

      {/* User Card */}
      {!isCollapsed ? (
        <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shadow-lg shadow-[#1E6F3D]/20 shrink-0">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="font-semibold text-sm truncate text-white/90">{user?.name}</div>
            <div className="text-[11px] text-amber-400/90 font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span className="uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="mx-auto mt-4 w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shadow-lg shadow-[#1E6F3D]/20 cursor-pointer shrink-0"
          title={`${user?.name} (${user?.role})`}
        >
          <UserIcon className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 mt-2 space-y-1 overflow-y-auto custom-scrollbar">
        {!isCollapsed && <p className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Menu</p>}
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] text-white shadow-lg shadow-[#1E6F3D]/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
              }`}>
                <item.icon className="w-4 h-4 shrink-0" />
              </div>
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-white/[0.06] space-y-1">
        <Link
          href="/"
          title={isCollapsed ? "Website Utama" : undefined}
          className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-[13px] font-semibold text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all`}
          onClick={isMobile ? () => setSidebarOpen(false) : undefined}
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center transition-all shrink-0">
            <Globe className="w-4 h-4 shrink-0" />
          </div>
          {!isCollapsed && <span className="truncate">Website Utama</span>}
        </Link>
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Keluar (Logout)" : undefined}
          className={`w-full group flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-[13px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left`}
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/[0.06] group-hover:bg-red-500/10 flex items-center justify-center transition-all shrink-0">
            <LogOut className="w-4 h-4 shrink-0" />
          </div>
          {!isCollapsed && <span className="truncate">Keluar (Logout)</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden lg:flex flex-col bg-[#0f1117] text-white shrink-0 border-r border-white/[0.06] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[76px]' : 'w-[272px]'
        }`}
      >
        <SidebarContent isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[272px] bg-[#0f1117] h-full flex flex-col text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button on mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Collapse Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl cursor-pointer"
              title={isCollapsed ? "Buka Sidebar" : "Sembunyikan Sidebar"}
            >
              {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
            </Button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm ml-1">
              <span className="text-gray-400 font-medium hidden sm:inline">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
              <span className="font-semibold text-gray-800">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right side - user info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-gray-800">{user?.name}</div>
              <div className="text-[10px] text-[#1E6F3D] font-bold uppercase">{user?.role}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shadow-sm">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
