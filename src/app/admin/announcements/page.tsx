"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Textarea } from '@/frontend/components/ui/textarea';
import { Badge } from '@/frontend/components/ui/badge';
import { Plus, Pencil, Trash, X, Save, AlertCircle, Bell, Megaphone, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  date: string;
  type: string;
  urgent: boolean;
  desc: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Pengumuman');
  const [desc, setDesc] = useState('');
  const [urgent, setUrgent] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error('Gagal mengambil pengumuman', err);
      toast.error('Gagal memuat data pengumuman');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openAddModal = () => {
    setEditingAnn(null);
    setTitle('');
    setType('Pengumuman');
    setDesc('');
    setUrgent(false);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setType(ann.type);
    setDesc(ann.desc);
    setUrgent(ann.urgent);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      id: editingAnn?.id,
      title: title.trim(),
      type: type.trim(),
      desc: desc.trim(),
      urgent,
    };

    try {
      const method = editingAnn ? 'PUT' : 'POST';
      const res = await fetch('/api/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan pengumuman');
      }

      setModalOpen(false);
      fetchAnnouncements();
      toast.success(editingAnn ? 'Pengumuman berhasil diperbarui!' : 'Pengumuman baru berhasil ditambahkan!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus pengumuman');
      }

      fetchAnnouncements();
      toast.success('Pengumuman berhasil dihapus');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredAnnouncements = announcements.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Pengumuman</h2>
          <p className="text-xs text-gray-500 mt-0.5">Tambah, ubah, atau hapus pengumuman resmi dan info layanan daerah</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] hover:shadow-lg hover:shadow-[#1E6F3D]/20 text-white rounded-xl cursor-pointer flex items-center gap-1.5 px-5 transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Tambah Pengumuman
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari pengumuman berdasarkan judul, tipe, atau deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl bg-white border-gray-200 h-10 text-sm"
        />
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
                  <th className="p-3.5 pl-5">Detail Pengumuman</th>
                  <th className="p-3.5">Tipe</th>
                  <th className="p-3.5">Urgensi</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <Megaphone className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Tidak ada pengumuman ditemukan</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {searchQuery ? 'Coba kata kunci lain' : 'Silakan tambahkan pengumuman baru'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAnnouncements.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="p-3.5 pl-5 max-w-sm">
                        <div className="flex gap-3 items-center">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.urgent 
                              ? 'bg-gradient-to-br from-orange-100 to-red-50 text-orange-600' 
                              : 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-600'
                          }`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-gray-900 truncate text-[13px]">{item.title}</div>
                            <div className="text-[11px] text-gray-400 truncate mt-0.5">{item.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {item.type}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        {item.urgent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-[10px] text-red-600 font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Penting
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">Normal</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px] text-gray-400 whitespace-nowrap">{item.date}</td>
                      <td className="p-3.5 pr-5 text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(item)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Table footer with count */}
          {filteredAnnouncements.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
              Menampilkan {filteredAnnouncements.length} dari {announcements.length} pengumuman
            </div>
          )}
        </Card>
      )}

      {/* Add / Edit Announcement Modal */}
      <AnimatePresence mode="wait">
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !saving && setModalOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border shadow-2xl w-full max-w-xl sm:max-h-[90vh] max-h-[95vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingAnn ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
                </h3>
                <button
                  onClick={() => !saving && setModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Judul Pengumuman</label>
                    <Input
                      required
                      placeholder="Masukkan judul pengumuman"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Tipe / Kategori</label>
                      <Input
                        placeholder="Contoh: Pengumuman, Info Layanan"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="flex items-center gap-3 h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={urgent}
                          onChange={(e) => setUrgent(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500" />
                      </label>
                      <span className="text-xs font-bold text-gray-700">Tandai sebagai Penting</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Deskripsi / Detail Pengumuman</label>
                    <Textarea
                      required
                      rows={5}
                      placeholder="Tulis detail deskripsi pengumuman..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => !saving && setModalOpen(false)}
                      disabled={saving}
                      className="rounded-xl cursor-pointer h-10"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] hover:shadow-lg text-white rounded-xl cursor-pointer flex items-center gap-1.5 h-10 min-w-[170px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Simpan Pengumuman
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
