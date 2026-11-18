"use client";

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { Calendar, User, Search, Newspaper, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  author: string;
  image: string;
}

const CATEGORIES = ['All', 'BERITA TERKINI', 'PENGUMUMAN', 'INFORMASI'];

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function BeritaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || 'All';
  
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Local inputs
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  
  const limit = 9; // 9 items per page

  // Fetch news handler
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      let url = `/api/news?limit=${limit}&offset=${offset}&status=published`;
      
      if (urlSearch) {
        url += `&search=${encodeURIComponent(urlSearch)}`;
      }
      if (urlCategory !== 'All') {
        url += `&category=${encodeURIComponent(urlCategory)}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          setNews(result.data);
          setTotal(result.total);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data berita:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, urlSearch, urlCategory]);

  // Trigger fetch when parameters or page changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Sync inputs with URL changes
  useEffect(() => {
    setSearchInput(urlSearch);
    setActiveCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    let path = '/berita';
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (activeCategory !== 'All') params.set('category', activeCategory);
    
    const queryStr = params.toString();
    router.push(queryStr ? `${path}?${queryStr}` : path);
  };

  const handleCategoryClick = (cat: string) => {
    setCurrentPage(1);
    setActiveCategory(cat);
    
    let path = '/berita';
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (cat !== 'All') params.set('category', cat);
    
    const queryStr = params.toString();
    router.push(queryStr ? `${path}?${queryStr}` : path);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <PageHeader 
        title="Arsip Berita & Informasi"
        description="Temukan informasi publik, rilis media, dan kabar pembangunan daerah terlengkap di Kabupaten Penajam Paser Utara."
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Filter & Search Bar */}
        <Card className="p-6 rounded-2xl border border-gray-200/50 bg-white shadow-sm mb-10">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari berita atau pengumuman penting..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-11 h-12 rounded-xl border-gray-200 focus-visible:ring-[#1E6F3D] text-gray-900 bg-white"
              />
            </div>
            
            {/* Submit Button */}
            <Button type="submit" className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] text-white hover:shadow-lg transition-all w-full md:w-auto font-semibold">
              <Search className="w-4 h-4 mr-2" /> Cari Berita
            </Button>
          </form>
          
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Kategori:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#1E6F3D] text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat === 'All' ? 'Semua Berita' : cat}
              </button>
            ))}
          </div>
        </Card>

        {/* Search Results Summary */}
        {(urlSearch || urlCategory !== 'All') && (
          <div className="mb-8 flex items-center justify-between text-sm text-gray-500">
            <div>
              Menampilkan <span className="font-semibold text-gray-900">{total}</span> hasil untuk 
              {urlSearch && <> pencarian &quot;<span className="font-semibold text-[#1E6F3D]">{urlSearch}</span>&quot;</>}
              {urlCategory !== 'All' && <> kategori <span className="font-semibold text-[#1E6F3D]">{urlCategory}</span></>}
            </div>
            {(urlSearch || urlCategory !== 'All') && (
              <button 
                onClick={() => {
                  setSearchInput('');
                  setActiveCategory('All');
                  router.push('/berita');
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Hapus Filter & Reset
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#1E6F3D]" />
            <p className="text-sm font-medium">Memuat arsip berita...</p>
          </div>
        ) : news.length === 0 ? (
          /* Empty State */
          <Card className="flex flex-col items-center justify-center py-20 px-4 text-center border border-gray-200/50 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500/70" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Berita tidak ditemukan</h3>
            <p className="text-sm text-gray-500 mt-1.5 max-w-md">Maaf, kami tidak dapat menemukan berita yang cocok dengan kriteria pencarian Anda. Coba kata kunci yang lebih umum atau pilih kategori lain.</p>
            <Button 
              onClick={() => {
                setSearchInput('');
                setActiveCategory('All');
                router.push('/berita');
              }}
              variant="outline"
              className="mt-6 rounded-xl border-2 hover:border-[#1E6F3D]"
            >
              Kembali ke Semua Berita
            </Button>
          </Card>
        ) : (
          /* News Grid */
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, index) => {
                const parts = item.date.split(' ');
                const year = parts[2] || '2026';
                const month = slugify(parts[1] || 'januari');
                const titleSlug = slugify(item.title);
                const detailHref = `/berita/${year}/${month}/${titleSlug}`;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 3) * 0.1 }}
                  >
                    <Link href={detailHref} className="block group h-full">
                      <Card className="h-full flex flex-col overflow-hidden border border-gray-200/50 hover:border-[#1E6F3D]/20 hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                        {/* Image aspect-video */}
                        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                          <img
                            src={item.image || '/logo.png'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <span className="absolute top-3 left-3 bg-[#C62828] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        
                        {/* Content text */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.date}
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.excerpt}</p>
                          </div>
                          
                          {/* Premium interactive arrow button */}
                          <div className="pt-2 text-[11px] text-[#1E6F3D] font-bold inline-flex items-center gap-1.5 cursor-pointer group/btn w-fit">
                            <span className="relative py-0.5">
                              Baca Selengkapnya
                              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1E6F3D] transition-all duration-300 group-hover/btn:w-full"></span>
                            </span>
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E6F3D]/10 text-[#1E6F3D] group-hover/btn:bg-[#1E6F3D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-gray-200"
                >
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-600">
                  <span>Halaman</span>
                  <span className="text-[#1E6F3D]">{currentPage}</span>
                  <span>dari</span>
                  <span>{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-gray-200"
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BeritaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E6F3D]" />
        <span className="text-sm font-semibold">Memuat halaman berita...</span>
      </div>
    }>
      <BeritaContent />
    </Suspense>
  );
}
