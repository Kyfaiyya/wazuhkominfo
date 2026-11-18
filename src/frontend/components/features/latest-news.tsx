"use client";

import { useState, useEffect, useRef } from 'react';
import { Calendar, ArrowRight, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const PLACEHOLDER_IMAGE = '/uploads/banner-kominfo.jpg';

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

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function newsUrl(article: NewsArticle) {
  // date format: "24 Juni 2026"
  const parts = article.date.split(' ');
  const year = parts[2] || '2026';
  const month = slugify(parts[1] || 'januari');
  const titleSlug = slugify(article.title);
  return `/berita/${year}/${month}/${titleSlug}`;
}

const fallbackNews: NewsArticle[] = [
  {
    id: "1",
    title: 'Diversifikasi Ekonomi, Gubernur Kaltim dan Bupati PPU Tanam Perdana Kelapa Genjah di Nenang',
    excerpt: 'Pemerintah Provinsi Kalimantan Timur terus mendorong diversifikasi ekonomi guna mengurangi ketergantungan pada sektor pertambangan batu bara.',
    content: '',
    date: '24 Juni 2026',
    category: 'BERITA TERKINI',
    author: 'Asri',
    image: '/uploads/1782951465293-whatsapp-image-2026-06-24-at-20-29-37-534x462.jpeg',
  },
  {
    id: "2",
    title: 'Diskominfo PPU Hadiri Raker KIM se-Kaltim, Dorong Transformasi Kreatif dan Mandiri di Era Digital',
    excerpt: 'Dinas Komunikasi dan Informatika Kabupaten PPU menghadiri Rapat Kerja Komunitas Informasi Masyarakat se-Kalimantan Timur.',
    content: '',
    date: '18 Juni 2026',
    category: 'BERITA TERKINI',
    author: 'Asri',
    image: '/uploads/1782951465441-whatsapp-image-2026-06-18-at-16-16-15-534x462.jpeg',
  },
  {
    id: "3",
    title: 'Safari Jumat, Mudyat Serahkan 21 Unit Bantuan Relokasi Rumah',
    excerpt: 'Bupati Penajam Paser Utara Mudyat Noor melakukan agenda Safari Jumat di Masjid At Taqwa Maridan.',
    content: '',
    date: '12 Juni 2026',
    category: 'BERITA TERKINI',
    author: 'Asri',
    image: '/uploads/1782951465613-whatsapp-image-2026-06-15-at-07-57-40-2-534x462.jpeg',
  },
  {
    id: "4",
    title: 'Plt. Kepala Diskominfo PPU Hadiri Safari Jumat di Maridan',
    excerpt: 'Plt. Kepala Diskominfo PPU Eko Setiawan, S.H., M.H. mengikuti agenda Safari Jumat yang diselenggarakan di Kelurahan Maridan.',
    content: '',
    date: '12 Juni 2026',
    category: 'BERITA TERKINI',
    author: 'Asri',
    image: '/uploads/1782951465797-desain-tanpa-judul-46-534x462.jpg',
  },
];

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    pages.push(totalPages);
  }
  
  return pages;
}

export function LatestNews() {
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(fallbackNews[0] || null);
  const [gridArticles, setGridArticles] = useState<NewsArticle[]>(fallbackNews.slice(1));
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalNews, setTotalNews] = useState(fallbackNews.length);
  
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        let limit = 4;
        let offset = 5 + (currentPage - 2) * 8; // Default formula for page 2+
        
        if (currentPage === 1) {
          limit = 5;
          offset = 0;
        }
        
        const res = await fetch(`/api/news?limit=${limit}&offset=${offset}&status=published`);
        if (res.ok) {
          const result = await res.json();
          if (result && result.data) {
            if (currentPage === 1) {
              setFeaturedArticle(result.data[0] || null);
              setGridArticles(result.data.slice(1));
            } else {
              setFeaturedArticle(null);
              setGridArticles(result.data);
            }
            setTotalNews(result.total);
          }
        }
      } catch (err) {
        console.error('Gagal memuat berita dinamis', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [currentPage]);

  const totalPages = totalNews <= 5 ? 1 : 1 + Math.ceil((totalNews - 5) / 8);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} id="news" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Berita <span className="text-[#C62828]">Terkini</span>
            </h2>
            <p className="text-xl text-gray-600">
              Informasi terbaru dari Diskominfo Kabupaten Penajam Paser Utara
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#C62828] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {currentPage === 1 && featuredArticle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <Link href={newsUrl(featuredArticle)}>
                  <Card className="group overflow-hidden rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-auto overflow-hidden">
                        <img
                          src={featuredArticle.image || PLACEHOLDER_IMAGE}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
                        <Badge className="absolute top-4 left-4 bg-[#C62828] text-white hover:bg-[#C62828]">
                          {featuredArticle.category}
                        </Badge>
                      </div>
                      <div className="p-8 flex flex-col justify-center space-y-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{featuredArticle.date}</span>
                          <span className="flex items-center gap-1"><User className="w-4 h-4" />{featuredArticle.author}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors">
                          {featuredArticle.title}
                        </h3>
                        <p className="text-gray-600">{featuredArticle.excerpt}</p>
                        <div className="relative inline-flex items-center gap-2 text-sm font-semibold text-[#1E6F3D] cursor-pointer group/btn w-fit">
                          <span className="relative py-0.5">
                            Baca Selengkapnya
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1E6F3D] transition-all duration-300 group-hover/btn:w-full"></span>
                          </span>
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1E6F3D]/10 text-[#1E6F3D] group-hover/btn:bg-[#1E6F3D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )}

            {/* News Grid with page transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {gridArticles.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Link href={newsUrl(item)} className="block h-full">
                      <Card className="group overflow-hidden rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white h-full flex flex-col">
                        <div className="relative h-48 overflow-hidden shrink-0">
                          <img
                            src={item.image || PLACEHOLDER_IMAGE}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-[#C62828] text-white text-xs hover:bg-[#C62828]">
                            {item.category}
                          </Badge>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.date}
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2">{item.excerpt}</p>
                          </div>
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
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-200/60 pt-8">
                <p className="text-sm text-gray-500 font-medium">
                  Menampilkan <span className="font-bold text-gray-800">{currentPage === 1 ? `1 - ${Math.min(5, totalNews)}` : `${5 + (currentPage - 2) * 8 + 1} - ${Math.min(5 + (currentPage - 1) * 8, totalNews)}`}</span> dari <span className="font-bold text-gray-800">{totalNews}</span> berita
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-xl border-gray-200 hover:border-[#1E6F3D] hover:bg-[#1E6F3D]/5 hover:text-[#1E6F3D] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200 cursor-pointer text-xs"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Sebelumnya
                  </Button>
                  
                  <div className="hidden sm:flex items-center gap-1.5">
                    {getPageNumbers(currentPage, totalPages).map((pageNum, idx) => (
                      typeof pageNum === 'number' ? (
                        <Button
                          key={idx}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-xl font-bold transition-all duration-300 cursor-pointer text-xs ${
                            currentPage === pageNum 
                              ? 'bg-[#1E6F3D] hover:bg-[#1E6F3D]/90 text-white border-[#1E6F3D]' 
                              : 'border-gray-200 hover:border-[#1E6F3D] hover:text-[#1E6F3D] hover:bg-[#1E6F3D]/5'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      ) : (
                        <span key={idx} className="px-2 text-gray-400 font-bold select-none text-xs">
                          {pageNum}
                        </span>
                      )
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border-gray-200 hover:border-[#1E6F3D] hover:bg-[#1E6F3D]/5 hover:text-[#1E6F3D] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200 cursor-pointer text-xs"
                  >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
