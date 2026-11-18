"use client";

import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';


const events = [
  {
    title: 'Rapat Kerja KIM se-Kalimantan Timur 2026',
    date: '18 Juni 2026',
    time: '08:00 - 16:00 WITA',
    location: 'Samarinda, Kalimantan Timur',
    type: 'Rapat Kerja',
    description: 'Raker tahunan Komunitas Informasi Masyarakat se-Kaltim untuk memperkuat jaringan informasi.',
    status: 'Selesai',
  },
  {
    title: 'Safari Jumat Bupati PPU',
    date: '12 Juni 2026',
    time: '06:30 - 12:00 WITA',
    location: 'Masjid At Taqwa Maridan, Sepaku',
    type: 'Kegiatan Rutin',
    description: 'Kegiatan Safari Jumat Bupati PPU meliputi cek kesehatan, bantuan sosial, dan silaturahmi.',
    status: 'Selesai',
  },
  {
    title: 'Sosialisasi Satu Data Indonesia',
    date: '8 Juni 2026',
    time: '09:00 - 15:00 WITA',
    location: 'Aula Diskominfo PPU, Penajam',
    type: 'Sosialisasi',
    description: 'Pemahaman tentang Satu Data Indonesia dan transformasi pemerintahan digital untuk seluruh OPD.',
    status: 'Selesai',
  },
  {
    title: 'Pelatihan Literasi Digital Masyarakat',
    date: '25 Juli 2026',
    time: '08:00 - 16:00 WITA',
    location: 'Kecamatan Penajam',
    type: 'Pelatihan',
    description: 'Program pelatihan literasi digital bagi masyarakat untuk meningkatkan kemampuan digital.',
    status: 'Akan Datang',
  },
];

export function Events() {
  return (
    <section id="events" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Agenda <span className="text-[#1E6F3D]">Kegiatan</span>
            </h2>
            <p className="text-xl text-gray-600">
              Jadwal kegiatan dan acara Diskominfo PPU
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden sm:flex rounded-full border-2 hover:border-[#1E6F3D] hover:bg-gray-50 group"
          >
            Lihat Semua
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group p-6 sm:p-8 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Date Card */}
                  <div className="sm:w-24 sm:text-center shrink-0">
                    <div className="inline-flex sm:flex flex-col items-center bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] text-white rounded-xl p-3 sm:p-4 shadow-lg">
                      <span className="text-2xl font-bold">{event.date.split(' ')[0]}</span>
                      <span className="text-xs uppercase">{event.date.split(' ')[1]} {event.date.split(' ')[2]}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${
                        event.status === 'Akan Datang'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}>
                        {event.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{event.type}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />{event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />{event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
