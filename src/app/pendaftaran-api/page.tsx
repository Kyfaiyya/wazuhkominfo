"use client";

import React, { useState } from 'react';
import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Terminal,
  BookOpen,
  Code
} from 'lucide-react';
import Link from 'next/link';

export default function PendaftaranApiPage() {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/api-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, organization, purpose }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mendaftar');
      }

      setSuccess(true);
      // Reset form
      setName('');
      setEmail('');
      setOrganization('');
      setPurpose('');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader
        title="Kredensial API Berita"
        description="Dapatkan akses integrasi ke data berita resmi Kabupaten Penajam Paser Utara secara real-time"
        category="Layanan Data"
      />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-8 items-start">
          
          {/* Form Section */}
          <div className="md:col-span-3 space-y-6">
            <Card className="p-8 border border-gray-200/60 shadow-xl bg-white rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <KeyRound className="w-40 h-40 text-[#1E6F3D]" />
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1E6F3D]/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#1E6F3D]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Form Pendaftaran API</h2>
                  <p className="text-xs text-gray-500">Ajukan permohonan API key untuk aplikasi Anda</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-8 space-y-4"
                  >
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-900">Permohonan Berhasil Dikirim!</h3>
                      <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                        Terima kasih. Permohonan Anda sedang dalam proses peninjauan oleh tim administrator Diskominfo PPU.
                        Kami akan meninjau tujuan penggunaan Anda dan mengirimkan kredensial API key melalui email yang didaftarkan.
                      </p>
                    </div>
                    <Button
                      onClick={() => setSuccess(false)}
                      className="mt-4 border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl"
                    >
                      Kirim Permohonan Lain
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Gagal Mendaftar:</span> {error}
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nama penanggung jawab"
                          className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E6F3D] focus:ring-1 focus:ring-[#1E6F3D] transition"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Alamat Email Aktif</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contoh@domain.com"
                          className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E6F3D] focus:ring-1 focus:ring-[#1E6F3D] transition"
                        />
                      </div>
                    </div>

                    {/* Organization */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Nama Instansi / Perusahaan / Sekolah</label>
                      <input
                        type="text"
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Misal: Universitas Indonesia, PT Maju Jaya"
                        className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E6F3D] focus:ring-1 focus:ring-[#1E6F3D] transition"
                      />
                    </div>

                    {/* Purpose */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Tujuan Penggunaan API</label>
                      <textarea
                        required
                        rows={4}
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Jelaskan secara detail bagaimana API Berita ini akan diintegrasikan di aplikasi Anda (contoh: Menampilkan berita terbaru di website desa, membuat chatbot whatsapp, dsb.)"
                        className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E6F3D] focus:ring-1 focus:ring-[#1E6F3D] transition resize-none"
                      />
                    </div>

                    {/* Terms */}
                    <div className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-4 border border-gray-100 rounded-xl">
                      Dengan menekan tombol kirim, Anda menyetujui untuk menggunakan API Berita Diskominfo Penajam Paser Utara sesuai dengan norma hukum, tidak melakukan spamming request, dan mencantumkan sumber berita saat menampilkan konten.
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] text-white font-bold hover:shadow-lg rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Mengirim permohonan...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Ajukan Kredensial API
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Docs & Guide Section */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Documentation Box */}
            <Card className="p-6 border border-gray-200/50 shadow-md bg-white rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <BookOpen className="w-4.5 h-4.5 text-[#1E6F3D]" />
                <h3 className="font-bold text-sm text-gray-900">Cara Penggunaan API</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Setelah permintaan Anda disetujui, Anda akan menerima <strong>API Key</strong> khusus yang harus dikirimkan pada header atau parameter query di setiap pemanggilan.
              </p>
              
              <div className="bg-gray-900 rounded-xl p-3 font-mono text-[10px] text-green-400 space-y-1 select-all overflow-x-auto">
                <p className="text-gray-500"># Header Authorization</p>
                <p>curl -H "Authorization: Bearer YOUR_API_KEY"</p>
                <p className="text-green-500">https://ppu-diskominfo.go.id/api/news</p>
              </div>

              <div className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                <li>Gunakan header <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] text-red-600">Authorization: Bearer [token]</code></li>
                <li>Atau sertakan parameter query <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] text-red-600">?api_key=[token]</code></li>
              </div>
            </Card>

            {/* API Endpoints Info */}
            <Card className="p-6 border border-gray-200/50 shadow-md bg-white rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Terminal className="w-4.5 h-4.5 text-[#1E6F3D]" />
                <h3 className="font-bold text-sm text-gray-900">Endpoint Tersedia</h3>
              </div>

              <div className="space-y-3">
                {/* Endpoint 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">GET</span>
                    <span className="font-mono text-xs text-gray-800">/api/news</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Mengambil daftar berita terbaru (mendukung limit & search)</p>
                </div>
                {/* Endpoint 2 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">GET</span>
                    <span className="font-mono text-xs text-gray-800">/api/news?slug=[slug]</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Mencari detail berita berdasarkan slug judul</p>
                </div>
                {/* Endpoint 3 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">GET</span>
                    <span className="font-mono text-xs text-gray-800">/api/announcements</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Mengambil daftar pengumuman penting daerah</p>
                </div>
              </div>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
