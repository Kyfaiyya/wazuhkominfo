"use client";

import { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, MessageCircle, ChevronRight, BookOpen, Tag } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/frontend/components/ui/badge';

interface PreviewData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  author: string;
  createdAt: string;
}

export default function NewsPreviewPage() {
  const [article, setArticle] = useState<PreviewData | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    // Read from localStorage
    const saved = localStorage.getItem('news_preview_data');
    if (saved) {
      try {
        setArticle(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal mengurai data preview", e);
      }
    }

    // Fetch related news for sidebar
    const fetchRelated = async () => {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          setRelatedArticles(data.news ? data.news.slice(0, 4) : []);
        }
      } catch (err) {
        console.error("Gagal memuat berita terkait", err);
      }
    };
    fetchRelated();
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#1E6F3D]/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-[#1E6F3D] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Memuat data live preview...</p>
        </div>
      </div>
    );
  }

  const isHtmlContent = /<[a-z][\s\S]*>/i.test(article.content);
  
  // Calculate reading time
  const plainText = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Date formatting
  const formattedDate = article.createdAt 
    ? new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '13 Juli 2026';

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1E6F3D] text-white text-center py-2 text-xs font-bold uppercase tracking-widest sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Mode Live Preview — Tampilan Simulasi Website Utama
      </div>

      <div className="pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8 bg-white py-3 px-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <span className="text-gray-400 font-medium shrink-0 font-bold">Home</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400 font-medium shrink-0 font-bold">Berita</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-bold truncate flex-1">{article.title || 'Judul Berita'}</span>
          </nav>
 
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* Main Article Content */}
            <div className="lg:col-span-2 space-y-8">
              <button 
                onClick={() => window.close()}
                className="inline-flex items-center text-sm font-semibold text-[#1E6F3D] hover:text-[#0a3d1f] transition-colors group mb-2 cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Tutup Preview & Kembali Edit
              </button>
 
              <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12 space-y-6">
                {/* Category Badge */}
                <div>
                  <span className="px-3 py-1 bg-[#C62828] text-white text-[10px] font-extrabold rounded-md uppercase tracking-wider shadow-sm">
                    {article.category || 'BERITA TERKINI'}
                  </span>
                </div>
 
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight">
                  {article.title || 'Judul Berita'}
                </h1>
 
                {/* Metadata block */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-500 font-semibold border-b border-gray-100 pb-4">
                  <span>By <span className="text-[#1E6F3D] font-bold">{article.author || 'Nama Penulis'}</span></span>
                  <span className="text-gray-300">•</span>
                  <span>{formattedDate}</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readingTime} menit baca</span>
                </div>
 
                {/* Featured Image */}
                {article.image && (
                  <div className="w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                    <img 
                      src={article.image} 
                      alt="" 
                      className="w-full h-auto max-h-[480px] object-cover object-center"
                    />
                  </div>
                )}
 
                {/* Main text content */}
                <div className="article-content prose prose-emerald max-w-none text-gray-700 leading-[2.0] text-sm sm:text-base pt-4">
                  {isHtmlContent ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  ) : (
                    <div className="space-y-6">
                      {article.content.split('\n').map((paragraph, index) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        return (
                          <p key={index} className="text-gray-600 leading-[2.0] font-normal">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
 
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-4">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline" className="text-[10px] font-bold text-[#1E6F3D] border-[#1E6F3D]/20 bg-[#1E6F3D]/5">
                    {article.category || 'BERITA TERKINI'}
                  </Badge>
                  {article.tags && article.tags.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-bold text-gray-500 border-gray-200 bg-gray-50">
                      {t}
                    </Badge>
                  ))}
                </div>
              </article>
            </div>
 
            {/* Sidebar - Related News */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E6F3D]" />
                  Berita Terkait Lainnya
                </h3>
 
                <div className="space-y-5">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((rel) => (
                      <div key={rel.id} className="group block">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                            <img 
                              src={rel.image || '/logo.png'} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="overflow-hidden space-y-1.5 flex-1 min-w-0">
                            <Badge variant="outline" className="text-[9px] text-[#1E6F3D] border-[#1E6F3D]/20 bg-[#1E6F3D]/5 font-bold uppercase tracking-wider py-0 px-1.5">
                              {rel.category}
                            </Badge>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors line-clamp-2 leading-snug">
                              {rel.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                              <Calendar className="w-3 h-3" />
                              <span>{rel.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">Tidak ada berita terkait lainnya.</p>
                  )}
                </div>
              </div>
            </div>
 
          </div>
        </div>
      </div>
    </main>
  );
}
