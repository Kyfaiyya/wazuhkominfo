"use client";

import { useState, useEffect } from 'react';
import { Bell, Calendar, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  type: string;
  urgent: boolean;
  desc: string;
}

const fallbackAnnouncements: AnnouncementItem[] = [
  {
    id: "1",
    title: 'Sosialisasi Satu Data Indonesia untuk Seluruh OPD',
    date: '8 Juni 2026',
    type: 'Pengumuman',
    urgent: true,
    desc: 'Seluruh OPD Kab. PPU dihimbau untuk mengikuti sosialisasi Satu Data Indonesia dalam rangka transformasi pemerintahan digital.',
  },
  {
    id: "2",
    title: 'Pemeliharaan Jaringan Internet Wilayah Penajam',
    date: '5 Juni 2026',
    type: 'Info Layanan',
    urgent: false,
    desc: 'Akan dilaksanakan pemeliharaan jaringan internet di wilayah Kecamatan Penajam pada tanggal 7-8 Juni 2026.',
  },
  {
    id: "3",
    title: 'Rapat Kerja KIM se-Kalimantan Timur 2026',
    date: '1 Juni 2026',
    type: 'Agenda',
    urgent: false,
    desc: 'Komunitas Informasi Masyarakat se-Kaltim akan mengadakan raker tahunan di Samarinda.',
  },
  {
    id: "4",
    title: 'Pendaftaran Domain go.id untuk Perangkat Daerah',
    date: '28 Mei 2026',
    type: 'Pengumuman',
    urgent: false,
    desc: 'Bagi perangkat daerah yang memerlukan domain go.id, dapat mengajukan permohonan melalui Diskominfo PPU.',
  },
];

export function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(fallbackAnnouncements);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setAnnouncements(data);
          }
        }
      } catch (err) {
        console.error('Gagal memuat pengumuman dinamis, menggunakan fallback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <section id="announcements" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-[#F57C00]">Pengumuman</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Informasi penting dan pengumuman terbaru dari Diskominfo PPU
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {announcements.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/informasi/pengumuman/${item.id}`} className="block h-full">
                  <Card className="p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full relative overflow-hidden group cursor-pointer">
                    {item.urgent && (
                      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                        <div className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 absolute top-4 -right-6 w-24 rotate-45 shadow">
                          Penting
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                        item.urgent 
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white'
                          : 'bg-gradient-to-br from-[#F57C00] to-[#FF9800] text-white'
                      }`}>
                        <Bell className="w-6 h-6 animate-swing" />
                      </div>

                      <div className="space-y-3 flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.date}
                          </span>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                            {item.type}
                          </Badge>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors leading-tight">
                          {item.title}
                        </h3>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
