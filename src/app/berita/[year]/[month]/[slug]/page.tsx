import { notFound } from 'next/navigation';
import { prisma } from '@/backend/config/db';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, MessageCircle, ChevronRight, BookOpen, Tag } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/frontend/components/ui/badge';
import { CommentsSection } from '@/frontend/components/features/comments-section';

export const dynamic = 'force-dynamic';

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

export default async function BeritaDetailPage({ params }: { params: Promise<{ year: string; month: string; slug: string }> }) {
  const { year, month, slug } = await params;

  // Fetch all news to find by slug match (slug is derived from title, not stored)
  const allNews = await prisma.news.findMany();

  const article = allNews.find((n) => {
    if (n.id === slug) return true;
    const titleSlug = slugify(n.title);
    const parts = n.date.split(' ');
    const articleYear = parts[2] || '';
    const articleMonth = slugify(parts[1] || '');
    return articleYear === year && articleMonth === month && titleSlug === slug;
  });

  if (!article) {
    notFound();
  }

  // Detect if content is HTML (from TipTap editor) or legacy markdown/plain-text
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(article.content);

  // Calculate reading time (strip HTML tags for word count)
  const plainText = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute average

  // Construct sharing URL
  const shareUrl = `https://diskominfo.penajamkab.go.id/berita/${year}/${month}/${slug}`;
  const shareTitle = encodeURIComponent(article.title);

  // Get related articles (same category or recent, excluding current)
  const relatedArticles = allNews
    .filter((n) => n.id !== article.id)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === article.category && b.category !== article.category) return -1;
      if (b.category === article.category && a.category !== article.category) return 1;
      return 0;
    })
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#F8F9FA]">

      <div className="pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8 bg-white py-3 px-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Link href="/" className="hover:text-[#1E6F3D] transition-colors font-medium shrink-0">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/#news" className="hover:text-[#1E6F3D] transition-colors font-medium shrink-0">Berita</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-bold truncate flex-1">{article.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* Main Article Content */}
            <div className="lg:col-span-2 space-y-8">
              <Link href="/#news" className="inline-flex items-center text-sm font-semibold text-[#1E6F3D] hover:text-[#0a3d1f] transition-colors group mb-2">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Berita Terkini
              </Link>

              <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12 space-y-6">
                {/* Category Badge */}
                <div>
                  <span className="px-3 py-1 bg-[#C62828] text-white text-[10px] font-extrabold rounded-md uppercase tracking-wider shadow-sm">
                    {article.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight">
                  {article.title}
                </h1>

                {/* Metadata block */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-500 font-semibold border-b border-gray-100 pb-4">
                  <span>By <span className="text-[#1E6F3D] hover:underline font-bold cursor-pointer">{article.author}</span></span>
                  <span className="text-gray-300">•</span>
                  <span>{article.date}</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readingTime} menit baca</span>
                </div>

                {/* Top Share Buttons */}
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] text-white text-[11px] font-bold hover:bg-[#145dbf] transition-all hover:scale-105"
                  >
                    <Facebook className="w-3.5 h-3.5" /> Share
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] font-bold hover:bg-black transition-all hover:scale-105"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg> Tweet
                  </a>
                  <a 
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-[11px] font-bold hover:bg-[#1ebe57] transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>

                {/* Featured Image - full width with object-cover to avoid letterboxing */}
                {(article.image) && (
                <div className="w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-auto max-h-[480px] object-cover object-center"
                  />
                </div>
                )}

                {/* Main text content */}
                <div className="article-content prose prose-emerald max-w-none text-gray-700 leading-[2.0] text-sm sm:text-base pt-4">
                  {isHtmlContent ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  ) : (
                    /* Legacy markdown/plain-text content rendering */
                    <div className="space-y-6">
                      {article.content.split('\n').map((paragraph, index) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;

                        // Detect markdown image tag: ![alt](url)
                        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                        if (imgMatch) {
                          const alt = imgMatch[1];
                          const fullUrl = imgMatch[2];
                          
                          let size = 'large';
                          let url = fullUrl;
                          if (fullUrl.includes('?size=')) {
                            const parts = fullUrl.split('?size=');
                            url = parts[0];
                            size = parts[1] || 'large';
                          }

                          let sizeClass = 'w-full';
                          if (size === 'small') sizeClass = 'max-w-[280px]';
                          else if (size === 'medium') sizeClass = 'max-w-[500px]';

                          return (
                            <div key={index} className="my-8 flex flex-col items-center justify-center w-full">
                              <img
                                src={url}
                                alt={alt}
                                className={`rounded-2xl shadow-sm border border-gray-100 ${sizeClass} h-auto mx-auto block`}
                                loading="lazy"
                              />
                              {alt && (
                                <span className="text-xs text-gray-400 mt-2 font-medium italic text-center">
                                  {alt}
                                </span>
                              )}
                            </div>
                          );
                        }

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
                      {article.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-gray-500 border-gray-200 bg-gray-50">
                      Diskominfo PPU
                    </Badge>
                  </div>

                  {/* Share bar at the bottom */}
                  <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#1E6F3D]" />
                      Bagikan Berita Ini:
                    </span>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#1877F2]/5 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all flex items-center justify-center border border-[#1877F2]/10 hover:scale-110"
                        aria-label="Share on Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-800 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center border border-gray-200/50 hover:scale-110"
                        aria-label="Share on X"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                      <a 
                        href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#25D366]/5 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center border border-[#25D366]/10 hover:scale-110"
                        aria-label="Share on WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

              </article>

              {/* Author Box */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E6F3D] to-[#2E8B57] flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-[#1E6F3D]/25 shrink-0">
                    {article.author.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left space-y-2 flex-1">
                    <div className="text-[10px] font-bold text-[#1E6F3D] uppercase tracking-widest">Penulis Artikel</div>
                    <h4 className="text-xl font-bold text-gray-900">{article.author}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                      Staf Hubungan Masyarakat Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara. Menyajikan berita resmi pembangunan dan kegiatan daerah.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <CommentsSection newsId={article.id} />

            </div>

            {/* Sidebar - Related News */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E6F3D]" />
                  Berita Terkait Lainnya
                </h3>

                <div className="space-y-5">
                  {relatedArticles.map((rel) => (
                    <Link href={newsUrl(rel)} key={rel.id} className="group block">
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
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <Link 
                    href="/#news" 
                    className="w-full py-3 rounded-xl border border-[#1E6F3D]/20 text-[#1E6F3D] hover:bg-[#1E6F3D] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    Lihat Semua Berita
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Newsletter-like CTA */}
              <div className="bg-gradient-to-br from-[#0f1117] via-[#1a2e23] to-[#1E6F3D] rounded-2xl p-6 text-white space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3CB371]/20 to-transparent rounded-full blur-2xl" />
                <div className="relative">
                  <h4 className="text-sm font-bold">Portal Diskominfo PPU</h4>
                  <p className="text-xs text-white/60 leading-relaxed mt-1">
                    Kunjungi website resmi untuk informasi lebih lengkap tentang program dan kegiatan daerah.
                  </p>
                  <Link 
                    href="/"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold border border-white/10 transition-all"
                  >
                    Kunjungi Website
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
