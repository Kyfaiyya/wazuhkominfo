"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, CheckCircle2, AlertCircle, Wifi, Video, Radio, Clock, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Complaint {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'umum' | 'wifi' | 'cctv' | 'bts';
  deviceName: string;
  title: string;
  description: string;
  status: 'Pending' | 'Diproses' | 'Selesai';
  date: string;
}

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
    type: 'wifi',
    deviceName: 'Wifi Publik - Taman Rozeline Penajam',
    title: 'Koneksi Sangat Lambat',
    description: 'Wifi di area Taman Rozeline tidak bisa digunakan untuk mengakses website pelayanan publik sejak pagi ini. Sinyal penuh namun internet tidak jalan.',
    status: 'Diproses',
    date: '2026-06-30'
  },
  {
    id: 'comp-2',
    name: 'Siti Rahma',
    email: 'siti@example.com',
    phone: '089876543210',
    type: 'cctv',
    deviceName: 'CCTV - Simpang Empat Masjid Agung PPU',
    title: 'Arah Kamera Berubah',
    description: 'Kamera CCTV di persimpangan menghadap terlalu ke atas sehingga tidak menyorot jalan lalu lintas utama dengan jelas.',
    status: 'Selesai',
    date: '2026-06-29'
  }
];

function ComplaintFormContent() {
  const searchParams = useSearchParams();
  const paramDevice = searchParams.get('device') || '';
  const paramCategory = searchParams.get('category') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'umum' as 'umum' | 'wifi' | 'cctv' | 'bts',
    deviceName: '',
    title: '',
    description: ''
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Handle pre-filling from query params
  useEffect(() => {
    if (paramDevice && (paramCategory === 'wifi' || paramCategory === 'cctv' || paramCategory === 'bts')) {
      setFormData(prev => ({
        ...prev,
        type: paramCategory as 'wifi' | 'cctv' | 'bts',
        deviceName: paramDevice,
        title: `Gangguan Layanan ${paramCategory.toUpperCase()} - ${paramDevice}`
      }));
    }
  }, [paramDevice, paramCategory]);

  // Load complaints from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ppu_complaints');
    if (saved) {
      try {
        setComplaints(JSON.parse(saved));
      } catch (e) {
        setComplaints(DEFAULT_COMPLAINTS);
      }
    } else {
      setComplaints(DEFAULT_COMPLAINTS);
      localStorage.setItem('ppu_complaints', JSON.stringify(DEFAULT_COMPLAINTS));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.title || !formData.description) {
      setError('Semua kolom wajib diisi!');
      return;
    }

    if (formData.type !== 'umum' && !formData.deviceName) {
      setError('Nama perangkat/lokasi spesifik wajib diisi untuk keluhan layanan khusus!');
      return;
    }

    const newComplaint: Complaint = {
      id: 'comp-' + Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: formData.type,
      deviceName: formData.type === 'umum' ? 'General' : formData.deviceName,
      title: formData.title,
      description: formData.description,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    localStorage.setItem('ppu_complaints', JSON.stringify(updated));

    setIsSubmitted(true);
    // Reset fields except personal details
    setFormData(prev => ({
      ...prev,
      type: 'umum',
      deviceName: '',
      title: '',
      description: ''
    }));

    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <div className="mb-6">
        <Link 
          href="/peta"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1E6F3D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Jelajah Peta
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8 border border-gray-200/60 shadow-lg rounded-2xl bg-white relative overflow-hidden">
            
            {/* Elegant Top Branding Edge */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0a2715] via-[#1E6F3D] to-[#FFD700]" />

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1E6F3D]" /> Formulir Pengaduan Pelayanan
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Kirimkan keluhan, pengaduan, atau laporan gangguan infrastruktur TIK di Kabupaten PPU.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold text-emerald-800">Laporan Berhasil Dikirim!</h5>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Terima kasih, laporan Anda telah diterima dan akan segera ditindaklanjuti oleh tim Diskominfo PPU. Anda dapat melihat status laporan di daftar pengaduan.
                    </p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-600 font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Personal Data Section */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Data Pelapor</span>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                    <Input
                      type="text"
                      placeholder="Contoh: Budi Susanto"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-lg text-sm border-gray-200 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp / HP</label>
                    <Input
                      type="tel"
                      placeholder="Contoh: 08123456xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-lg text-sm border-gray-200 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Email</label>
                  <Input
                    type="email"
                    placeholder="Contoh: budi@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-lg text-sm border-gray-200 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Complaint Details Section */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Detail Pengaduan</span>
                
                {/* General vs Specific Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Jenis Layanan / Pengaduan</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'umum', label: 'Umum / Lainnya', icon: FileText },
                      { id: 'wifi', label: 'Wifi Publik', icon: Wifi },
                      { id: 'cctv', label: 'CCTV Kota', icon: Video },
                      { id: 'bts', label: 'Menara BTS', icon: Radio },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = formData.type === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            type: item.id as any,
                            deviceName: item.id === 'umum' ? '' : formData.deviceName 
                          })}
                          className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#1E6F3D] bg-[#1E6F3D]/5 text-[#1E6F3D] shadow-sm font-semibold'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[#1E6F3D]' : 'text-gray-400'}`} />
                          <span className="text-[10px] sm:text-xs leading-none">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Device Input */}
                {formData.type !== 'umum' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nama Perangkat / Lokasi Spesifik
                    </label>
                    <Input
                      type="text"
                      placeholder={`Contoh: ${
                        formData.type === 'wifi' 
                          ? 'Wifi Publik - Taman Rozeline Penajam' 
                          : formData.type === 'cctv'
                          ? 'CCTV - Simpang Empat Masjid Agung PPU'
                          : 'BTS - Nipah-nipah 1'
                      }`}
                      value={formData.deviceName}
                      onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                      className="rounded-lg text-sm border-gray-200 bg-white"
                      required
                    />
                    <span className="block text-[10px] text-gray-400 mt-1 font-medium">
                      *Tentukan lokasi wifi atau nomor/lokasi cctv spesifik yang bermasalah.
                    </span>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subjek / Judul Keluhan</label>
                  <Input
                    type="text"
                    placeholder="Contoh: Sinyal WiFi Lemah / CCTV Offline"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-lg text-sm border-gray-200 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rincian Masalah</label>
                  <Textarea
                    placeholder="Jelaskan secara detail mengenai keluhan Anda (lokasi, kronologi masalah, kondisi perangkat, dll.)"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-lg text-sm border-gray-200 bg-white leading-relaxed resize-y"
                    required
                  />
                </div>

              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#1E6F3D] hover:bg-[#1E6F3D]/95 text-white font-bold rounded-xl py-5 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" /> Kirim Pengaduan Sekarang
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Sidebar Info/History Panel */}
        <div className="space-y-6">
          
          {/* Service Guarantee Card */}
          <Card className="p-6 border border-gray-200/50 shadow-sm rounded-2xl bg-[#0a2715] text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#1E6F3D] rounded-full opacity-20 blur-xl" />
            
            <ShieldAlert className="w-8 h-8 text-[#FFD700] mb-4" />
            <h3 className="text-base font-extrabold text-white mb-2">Maklumat Pelayanan</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Diskominfo PPU menjamin kerahasiaan data pelapor. Setiap laporan pengaduan infrastruktur WiFi dan CCTV kota akan diproses paling lambat 2x24 jam sejak laporan dikirimkan.
            </p>
          </Card>

          {/* User Complaint History List */}
          <Card className="p-6 border border-gray-200/60 shadow-md rounded-2xl bg-white space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1E6F3D]" /> Daftar Pengaduan Terakhir
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Daftar laporan pengaduan yang aktif di sistem lokal Anda.
              </p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {complaints.length > 0 ? (
                complaints.map((comp) => {
                  const isWifi = comp.type === 'wifi';
                  const isCctv = comp.type === 'cctv';
                  const isBts = comp.type === 'bts';
                  
                  return (
                    <div 
                      key={comp.id}
                      className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2 text-xs transition-all hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-gray-700">
                          {isWifi && <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
                          {isCctv && <Video className="w-3.5 h-3.5 text-red-600" />}
                          {isBts && <Radio className="w-3.5 h-3.5 text-violet-600" />}
                          {!isWifi && !isCctv && !isBts && <FileText className="w-3.5 h-3.5 text-gray-500" />}
                          <span className="truncate max-w-[120px]">
                            {isWifi ? 'WiFi' : isCctv ? 'CCTV' : isBts ? 'BTS' : 'Umum'}
                          </span>
                        </div>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          comp.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : comp.status === 'Diproses'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-gray-900 leading-snug truncate">{comp.title}</h4>
                        {comp.type !== 'umum' && (
                          <p className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">
                            Perangkat: {comp.deviceName}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {comp.description}
                        </p>
                      </div>

                      <div className="text-[9px] text-gray-400 font-medium pt-1 border-t border-gray-100/50 flex items-center justify-between">
                        <span>Oleh: {comp.name}</span>
                        <span>{comp.date}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-gray-400 italic">
                  Belum ada laporan pengaduan dikirim.
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}

export default function PengaduanMasyarakatPage() {
  return (
    <div>
      <PageHeader
        title="Pengaduan & Keluhan Layanan"
        description="Portal pengaduan infrastruktur TIK dan sarana publik Diskominfo Penajam Paser Utara."
        category="Layanan"
      />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E6F3D]" />
        </div>
      }>
        <ComplaintFormContent />
      </Suspense>
    </div>
  );
}
