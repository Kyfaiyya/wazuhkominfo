"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { 
  Newspaper, Megaphone, Users, ArrowRight, ShieldCheck, HeartHandshake, 
  Plus, TrendingUp, Clock, Activity, Database, Wifi, WifiOff,
  CalendarDays, Eye, MapPin, KeyRound, Camera
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Selamat Pagi', emoji: '🌅' };
  if (hour >= 12 && hour < 15) return { text: 'Selamat Siang', emoji: '☀️' };
  if (hour >= 15 && hour < 18) return { text: 'Selamat Sore', emoji: '🌇' };
  return { text: 'Selamat Malam', emoji: '🌙' };
}

function formatDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function newsUrl(article: any) {
  const parts = article.date.split(' ');
  const year = parts[2] || '2026';
  const month = slugify(parts[1] || 'januari');
  const titleSlug = slugify(article.title);
  return `/berita/${year}/${month}/${titleSlug}`;
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    newsCount: 0,
    announcementsCount: 0,
    usersCount: 0,
    mapPointsCount: 0,
    apiRequestsCount: 0,
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [redisHealth, setRedisHealth] = useState<{
    connected: boolean;
    configured: boolean;
    latencyMs: number | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch current user
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        setUser(userData.user);

        // Fetch counts
        const newsRes = await fetch('/api/news');
        const newsData = await newsRes.json();

        const annRes = await fetch('/api/announcements');
        const annData = await annRes.json();

        // Save recent news for activity feed
        setRecentNews(newsData.slice(0, 5));

        let usersCount = 3; // Default fallback
        if (userData.user?.role === 'superadmin') {
          const usersRes = await fetch('/api/users');
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            usersCount = usersData.length;
          }
        }

        // Fetch map points
        const mapRes = await fetch('/api/mappoints');
        const mapData = await mapRes.json();

        // Fetch API request count
        let apiRequestsCount = 0;
        try {
          const apiRequestsRes = await fetch('/api/api-requests');
          if (apiRequestsRes.ok) {
            const apiRequestsData = await apiRequestsRes.json();
            apiRequestsCount = Array.isArray(apiRequestsData) ? apiRequestsData.length : 0;
          }
        } catch (e) {
          console.error('Failed to fetch api requests stats:', e);
        }

        setStats({
          newsCount: newsData.length || 0,
          announcementsCount: annData.length || 0,
          usersCount,
          mapPointsCount: Array.isArray(mapData) ? mapData.length : 0,
          apiRequestsCount,
        });

        // Fetch Redis health
        try {
          const healthRes = await fetch('/api/health');
          if (healthRes.ok) {
            const healthData = await healthRes.json();
            setRedisHealth(healthData);
          }
        } catch {
          setRedisHealth({ connected: false, configured: false, latencyMs: null, error: 'Gagal cek koneksi' });
        }
      } catch (err) {
        console.error('Gagal mengambil statistik admin', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  const greeting = getGreeting();

  const statCards = [
    { 
      title: 'Total Berita', 
      value: stats.newsCount, 
      icon: Newspaper, 
      gradient: 'from-blue-500 to-indigo-600', 
      bgGlow: 'bg-blue-500/10',
      href: '/admin/news',
      description: 'Artikel berita aktif'
    },
    { 
      title: 'Total Pengumuman', 
      value: stats.announcementsCount, 
      icon: Megaphone, 
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
      href: '/admin/announcements',
      description: 'Pengumuman terpublikasi'
    },
    { 
      title: 'Titik Peta Digital', 
      value: stats.mapPointsCount, 
      icon: MapPin, 
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/10',
      href: '/admin/mappoints',
      description: 'Wifi, CCTV, & BTS aktif'
    },
    { 
      title: 'Permintaan API', 
      value: stats.apiRequestsCount, 
      icon: KeyRound, 
      gradient: 'from-fuchsia-500 to-pink-600',
      bgGlow: 'bg-fuchsia-500/10',
      href: '/admin/api-requests',
      description: 'Pengajuan API key'
    },
  ];

  if (user?.role === 'superadmin') {
    statCards.push({
      title: 'Admin & User',
      value: stats.usersCount,
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/10',
      href: '/admin/users',
      description: 'Akun terdaftar'
    });
  }

  const quickActions = [
    { label: 'Tambah Berita Baru', href: '/admin/news', icon: Newspaper, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100' },
    { label: 'Tambah Pengumuman', href: '/admin/announcements', icon: Megaphone, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100' },
    { label: 'Kelola Galeri & Video', href: '/admin/gallery', icon: Camera, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100' },
    { label: 'Lihat Website', href: '/', icon: Eye, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1117] via-[#1a2e23] to-[#1E6F3D] text-white p-6 sm:p-8 rounded-2xl shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3CB371]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#1E6F3D]/30 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                {greeting.text}, {user?.name}! {greeting.emoji}
              </h2>
              <p className="text-white/60 text-sm max-w-xl leading-relaxed">
                Anda login sebagai <span className="text-amber-300 font-bold uppercase">{user?.role}</span>. 
                Kelola berita, pengumuman, dan konten portal Diskominfo PPU dari sini.
              </p>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{formatDate()}</span>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <motion.div key={idx} variants={item}>
            <Link href={card.href}>
              <Card className="group relative p-5 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 bg-white cursor-pointer overflow-hidden">
                {/* Subtle background glow */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 ${card.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.title}</div>
                    <div className="text-3xl font-extrabold text-gray-900 tabular-nums">{card.value}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <TrendingUp className="w-3 h-3" />
                      {card.description}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Bottom bar indicator */}
                <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${card.gradient} opacity-20 group-hover:opacity-60 transition-opacity`} />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions, Recent Activity & System Status Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-5 border border-gray-200/60 shadow-sm bg-white rounded-2xl h-full">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#1E6F3D]/10 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#1E6F3D]" />
              </div>
              Aksi Cepat
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className={`flex items-center gap-3 p-3 rounded-xl ${action.color} transition-all duration-200 group`}
                >
                  <action.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="p-5 border border-gray-200/60 shadow-sm bg-white rounded-2xl h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Berita Terbaru
              </h3>
              <Link href="/admin/news" className="text-[11px] font-bold text-[#1E6F3D] hover:underline">
                Lihat Semua →
              </Link>
            </div>
            <div className="space-y-2">
              {recentNews.length > 0 ? recentNews.map((news, idx) => (
                <Link href={newsUrl(news)} key={idx} className="block">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                    <img 
                      src={news.image || '/logo.png'} 
                      alt="" 
                      className="w-11 h-11 rounded-lg object-cover shrink-0 border border-gray-100 group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{news.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                        <span>{news.date}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[#1E6F3D] font-semibold">{news.author}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#1E6F3D] bg-[#1E6F3D]/5 border border-[#1E6F3D]/10 px-2 py-0.5 rounded-md shrink-0 hidden sm:block font-bold">
                      {news.category}
                    </span>
                  </div>
                </Link>
              )) : (
                <p className="text-xs text-gray-400 py-4 text-center">Belum ada berita</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* System Status & Guidelines Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* System Status */}
        <motion.div variants={item}>
          <Card className="p-5 border border-gray-200/60 shadow-sm bg-white rounded-2xl h-full">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-violet-600" />
              </div>
              Status Sistem
            </h3>
            <div className="space-y-3">
              {/* Redis Status */}
              <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-700">Redis Database</span>
                  </div>
                  {redisHealth?.connected ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <Wifi className="w-3 h-3" />
                      Terhubung
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <WifiOff className="w-3 h-3" />
                      {redisHealth?.configured ? 'Error' : 'Fallback Lokal'}
                    </div>
                  )}
                </div>
                {redisHealth?.connected && redisHealth.latencyMs !== null && (
                  <div className="text-[11px] text-gray-400">
                    Latency: <span className="font-bold text-gray-600">{redisHealth.latencyMs}ms</span>
                  </div>
                )}
                {redisHealth && !redisHealth.connected && !redisHealth.configured && (
                  <div className="text-[11px] text-amber-600/80">
                    Redis tidak terkonfigurasi. Caching tidak aktif.
                  </div>
                )}
              </div>

              {/* App Status */}
              <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-700">Aplikasi</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Berjalan
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Guidelines */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-5 border border-gray-200/60 shadow-sm bg-white space-y-4 rounded-2xl h-full">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <HeartHandshake className="w-3.5 h-3.5 text-[#1E6F3D]" />
              </div>
              Panduan Singkat Pengelolaan Konten
            </h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="p-4 border border-gray-100 rounded-xl space-y-2 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-xs">
                  <Newspaper className="w-4 h-4 text-blue-500" /> Kelola Berita Terkini
                </h4>
                <p className="leading-relaxed text-xs text-gray-500">Untuk menambahkan berita pembangunan daerah atau agenda liputan Humas. Klik menu Kelola Berita di sidebar, pilih &apos;Tambah Berita Baru&apos;, isi detail formulir dan simpan.</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl space-y-2 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-xs">
                  <Megaphone className="w-4 h-4 text-amber-500" /> Rilis Pengumuman
                </h4>
                <p className="leading-relaxed text-xs text-gray-500">Digunakan untuk informasi penting yang membutuhkan perhatian masyarakat, seperti agenda sosialisasi dinas atau informasi gangguan jaringan. Pengumuman mendesak (Urgent) akan mendapatkan label penting khusus.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
