"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { 
  MapPin, Plus, Trash2, Edit2, Search, Wifi, Eye, 
  Radio, Loader2, ArrowLeft, X, CheckCircle2, AlertCircle, 
  Map, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPoint {
  id: string;
  name: string;
  category: 'wifi' | 'cctv' | 'bts';
  lat: number;
  lng: number;
  status: string;
  details: string;
  location: string;
  videoId?: string;
}

export default function AdminMapPointsPage() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<MapPoint | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'wifi' | 'cctv' | 'bts'>('wifi');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [status, setStatus] = useState('Aktif');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('Kec. Penajam');
  const [videoId, setVideoId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mappoints');
      if (res.ok) {
        const data = await res.json();
        setPoints(data);
      } else {
        toast.error('Gagal mengambil data koordinat');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const openAddModal = () => {
    setEditingPoint(null);
    setName('');
    setCategory('wifi');
    setLat('');
    setLng('');
    setStatus('Aktif');
    setDetails('');
    setLocation('Kec. Penajam');
    setVideoId('');
    setIsModalOpen(true);
  };

  const openEditModal = (point: MapPoint) => {
    setEditingPoint(point);
    setName(point.name);
    setCategory(point.category);
    setLat(String(point.lat));
    setLng(String(point.lng));
    setStatus(point.status);
    setDetails(point.details);
    setLocation(point.location);
    setVideoId(point.videoId || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !lat || !lng) {
      toast.error('Kolom Nama, Kategori, Latitude, dan Longitude wajib diisi!');
      return;
    }

    if (isNaN(Number(lat)) || isNaN(Number(lng))) {
      toast.error('Latitude dan Longitude harus bernilai angka!');
      return;
    }

    setSaving(true);
    const bodyData = {
      id: editingPoint?.id,
      name,
      category,
      lat: Number(lat),
      lng: Number(lng),
      status,
      details,
      location,
      videoId: category === 'cctv' ? videoId : undefined,
    };

    try {
      const method = editingPoint ? 'PUT' : 'POST';
      const res = await fetch('/api/mappoints', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingPoint ? 'Titik koordinat berhasil diperbarui!' : 'Titik koordinat baru berhasil ditambahkan!');
        setIsModalOpen(false);
        fetchPoints();
      } else {
        toast.error(data.error || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus titik "${name}" dari peta?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/mappoints?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Titik koordinat berhasil dihapus!');
        fetchPoints();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menghapus titik');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi');
    }
  };

  const getCategoryBadge = (cat: 'wifi' | 'cctv' | 'bts') => {
    switch (cat) {
      case 'wifi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <Wifi className="w-3 h-3" /> Wifi Publik
          </span>
        );
      case 'cctv':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Eye className="w-3 h-3" /> CCTV Kota
          </span>
        );
      case 'bts':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
            <Radio className="w-3 h-3" /> Tower BTS
          </span>
        );
    }
  };

  // Filter points
  const filteredPoints = points.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.location.toLowerCase().includes(search.toLowerCase()) ||
                          p.details.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <Map className="w-4 h-4 text-[#1E6F3D]" />
            <span>Peta Digital SIG</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">Kelola Titik Peta</h2>
          <p className="text-xs text-gray-500 font-medium">Tambah, edit, dan hapus koordinat Wifi Publik, CCTV, dan Menara Telekomunikasi/BTS</p>
        </div>

        <Button 
          onClick={openAddModal}
          className="bg-[#1E6F3D] hover:bg-[#2E8B57] text-white rounded-xl px-5 py-5 font-bold flex items-center gap-2 shadow-md shadow-[#1E6F3D]/10 hover:shadow-lg transition-all"
        >
          <Plus className="w-4.5 h-4.5" /> Tambah Titik Koordinat
        </Button>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search input */}
        <div className="relative md:col-span-2">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, kecamatan, atau spesifikasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E6F3D]/25 focus:border-[#1E6F3D] text-sm text-gray-900 shadow-sm transition-all"
          />
        </div>

        {/* Category Filter dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E6F3D]/25 focus:border-[#1E6F3D] text-sm font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          <option value="wifi">Wifi Publik</option>
          <option value="cctv">CCTV Kota</option>
          <option value="bts">Tower Telekomunikasi / BTS</option>
        </select>
      </div>

      {/* Main Table Card */}
      <Card className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E6F3D]" />
            <p className="text-sm text-gray-500 font-bold">Memuat data titik peta...</p>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100">
              <MapPin className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-gray-800">Tidak Ada Titik Koordinat</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {search || categoryFilter !== 'all' 
                ? 'Tidak ada hasil pencarian yang cocok dengan filter aktif Anda.'
                : 'Belum ada titik koordinat yang dimasukkan ke dalam database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4.5 px-6">Nama Lokasi / Alat</th>
                  <th className="py-4.5 px-6">Kategori</th>
                  <th className="py-4.5 px-6">Wilayah</th>
                  <th className="py-4.5 px-6">Koordinat (Lat / Lng)</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700 bg-white">
                {filteredPoints.map((point) => (
                  <tr key={point.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{point.name}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-[280px] truncate">{point.details}</div>
                    </td>
                    <td className="py-4 px-6">{getCategoryBadge(point.category)}</td>
                    <td className="py-4 px-6 font-semibold text-gray-600">{point.location}</td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">
                      {point.lat.toFixed(5)} , {point.lng.toFixed(5)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        point.status === 'Aktif' 
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${point.status === 'Aktif' ? 'bg-green-600' : 'bg-red-600'}`} />
                        {point.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(point)}
                          className="p-2 text-gray-500 hover:text-[#1E6F3D] hover:bg-[#1E6F3D]/5 rounded-lg transition-all"
                          title="Edit Titik"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(point.id, point.name)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus Titik"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg p-6 sm:p-8 relative overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-full"
              >
                <X className="w-5.5 h-5.5" />
              </button>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-tr from-[#1E6F3D] to-[#3CB371] rounded-xl flex items-center justify-center text-white shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{editingPoint ? 'Edit Titik Koordinat' : 'Tambah Titik Peta Baru'}</h3>
                  <p className="text-xs text-gray-500 font-medium">Isi detail data dengan tepat di bawah ini</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Nama Perangkat / Lokasi</label>
                  <Input
                    required
                    type="text"
                    placeholder="Contoh: Wifi Publik - Taman Rozeline"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-gray-200"
                    disabled={saving}
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E6F3D] focus:border-[#1E6F3D] text-sm font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
                      disabled={saving}
                    >
                      <option value="wifi">Wifi Publik</option>
                      <option value="cctv">CCTV Kota</option>
                      <option value="bts">Tower Telekomunikasi / BTS</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Status Operasional</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E6F3D] focus:border-[#1E6F3D] text-sm font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
                      disabled={saving}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif / Gangguan</option>
                    </select>
                  </div>
                </div>

                {/* Lat & Lng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Garis Lintang (Latitude)</label>
                    <Input
                      required
                      type="text"
                      placeholder="Contoh: -1.24830"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="rounded-xl border-gray-200 font-mono text-sm"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Garis Bujur (Longitude)</label>
                    <Input
                      required
                      type="text"
                      placeholder="Contoh: 116.77880"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="rounded-xl border-gray-200 font-mono text-sm"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Location and Video ID (Conditional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Wilayah Kecamatan</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E6F3D] focus:border-[#1E6F3D] text-sm font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
                      disabled={saving}
                    >
                      <option value="Kec. Penajam">Kec. Penajam</option>
                      <option value="Kec. Waru">Kec. Waru</option>
                      <option value="Kec. Babulu">Kec. Babulu</option>
                      <option value="Kec. Sepaku">Kec. Sepaku</option>
                    </select>
                  </div>

                  {category === 'cctv' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Video Stream ID / Link</label>
                      <Input
                        required
                        type="text"
                        placeholder="Contoh: cam_rozeline"
                        value={videoId}
                        onChange={(e) => setVideoId(e.target.value)}
                        className="rounded-xl border-gray-200"
                        disabled={saving}
                      />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Keterangan Spesifikasi / Detail</label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Kecepatan 50 Mbps, Provider Telkomsel, dsb."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E6F3D] focus:border-[#1E6F3D] text-gray-900 shadow-sm transition-all"
                    disabled={saving}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border-gray-200"
                    disabled={saving}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1E6F3D] hover:bg-[#2E8B57] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Simpan Titik
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
