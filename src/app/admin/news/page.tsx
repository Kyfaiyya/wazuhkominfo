"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Badge } from '@/frontend/components/ui/badge';
import { Plus, Pencil, Trash, Newspaper, Search, Globe, FileText, Filter, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  author: string;
  image: string;
  status?: string;
  tags?: string;
  updatedAt?: string;
}

const MONTHS_MAP: Record<string, number> = {
  'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
  'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
};

function parseIndoDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const parts = dateStr.toLowerCase().trim().split(/\s+/);
  if (parts.length < 3) {
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? new Date(0) : new Date(parsed);
  }
  const day = parseInt(parts[0], 10);
  const month = MONTHS_MAP[parts[1]] ?? 0;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error('Gagal mengambil berita', err);
      toast.error('Gagal memuat data berita');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;

    try {
      const res = await fetch(`/api/news?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus berita');
      }

      fetchNews();
      toast.success('Berita berhasil dihapus');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (item.status || 'published') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortBy === 'newest') {
      return parseIndoDate(b.date).getTime() - parseIndoDate(a.date).getTime();
    } else if (sortBy === 'oldest') {
      return parseIndoDate(a.date).getTime() - parseIndoDate(b.date).getTime();
    } else if (sortBy === 'az') {
      return a.title.localeCompare(b.title, 'id');
    } else if (sortBy === 'za') {
      return b.title.localeCompare(a.title, 'id');
    }
    return 0;
  });

  const publishedCount = news.filter(n => (n.status || 'published') === 'published').length;
  const draftCount = news.filter(n => n.status === 'draft').length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Berita</h2>
          <p className="text-xs text-gray-500 mt-0.5">Tambah, ubah, atau hapus postingan berita website Diskominfo PPU</p>
        </div>
        <Link href="/admin/news/new">
          <Button
            className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] hover:shadow-lg hover:shadow-[#1E6F3D]/20 text-white rounded-xl cursor-pointer flex items-center gap-1.5 px-5 transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> Tambah Berita
          </Button>
        </Link>
      </div>

      {/* Stats & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-0.5 text-[11px] font-bold shrink-0 self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Filter className="w-3 h-3" />
            Semua
            <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md text-[9px]">{news.length}</span>
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'published' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="w-3 h-3" />
            Published
            <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md text-[9px]">{publishedCount}</span>
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'draft' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-3 h-3" />
            Draft
            <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md text-[9px]">{draftCount}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari berita berdasarkan judul, kategori, penulis, atau tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-white border-gray-200 h-10 text-sm w-full"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-bold whitespace-nowrap flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Urutkan:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E6F3D]/20 cursor-pointer shadow-sm min-w-[150px]"
          >
            <option value="newest">Terbaru ke Terlama</option>
            <option value="oldest">Terlama ke Terbaru</option>
            <option value="az">Abjad A - Z</option>
            <option value="za">Abjad Z - A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-[#1E6F3D]/20 rounded-full" />
            <div className="absolute inset-0 w-10 h-10 border-4 border-[#1E6F3D] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      ) : (
        <Card className="border border-gray-200/60 shadow-sm bg-white overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5 pl-5">Detail Berita</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Kategori & Tags</th>
                  <th className="p-3.5">Penulis</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {sortedNews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <Newspaper className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Tidak ada berita ditemukan</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {searchQuery ? 'Coba kata kunci lain' : statusFilter !== 'all' ? `Tidak ada berita dengan status "${statusFilter}"` : 'Silakan tambahkan berita baru'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedNews.map((item) => {
                    const itemStatus = item.status || 'published';
                    const itemTags = item.tags ? item.tags.split(',').filter(Boolean) : [];
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="p-3.5 pl-5 max-w-sm">
                          <div className="flex gap-3 items-center">
                            <img
                              src={item.image || '/logo.png'}
                              alt={item.title}
                              className="w-14 h-10 object-cover rounded-lg shrink-0 border border-gray-100"
                            />
                            <div className="overflow-hidden">
                              <div className="font-bold text-gray-900 truncate text-[13px]">{item.title}</div>
                              <div className="text-[11px] text-gray-400 truncate mt-0.5">{item.excerpt}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {itemStatus === 'published' ? (
                            <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-200 bg-emerald-50 font-bold gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-200 bg-amber-50 font-bold gap-1">
                              <FileText className="w-2.5 h-2.5" />
                              Draft
                            </Badge>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[10px] text-[#1E6F3D] border-[#1E6F3D]/20 bg-[#1E6F3D]/5 font-bold">
                              {item.category}
                            </Badge>
                            {itemTags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-[9px] text-gray-500 border-gray-200 bg-gray-50 font-medium">
                                {tag}
                              </Badge>
                            ))}
                            {itemTags.length > 2 && (
                              <Badge variant="outline" className="text-[9px] text-gray-400 border-gray-200 bg-gray-50">
                                +{itemTags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-xs font-semibold text-gray-600">{item.author}</td>
                        <td className="p-3.5">
                          <div className="text-[11px] text-gray-400 whitespace-nowrap">{item.date}</div>
                          {item.updatedAt && (
                            <div className="text-[9px] text-gray-300 mt-0.5">Diubah: {item.updatedAt}</div>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right shrink-0">
                          <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/news/edit/${item.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Table footer with count */}
          {sortedNews.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400 flex items-center justify-between">
              <span>Menampilkan {sortedNews.length} dari {news.length} berita</span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-emerald-500" /> {publishedCount} published</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-amber-500" /> {draftCount} draft</span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
