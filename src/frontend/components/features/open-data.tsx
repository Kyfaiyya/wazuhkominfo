"use client";

import { Database, BarChart3, FileText, ArrowRight, ExternalLink, Download } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';


const datasets = [
  {
    title: 'Data Kependudukan',
    description: 'Data jumlah penduduk, kepadatan, dan demografi Kab. PPU per kecamatan.',
    icon: BarChart3,
    format: 'CSV / Excel',
    updated: 'Juni 2026',
  },
  {
    title: 'Data Infrastruktur TIK',
    description: 'Peta sebaran menara BTS, jaringan fiber optik, dan titik akses internet.',
    icon: Database,
    format: 'GeoJSON / CSV',
    updated: 'Juni 2026',
  },
  {
    title: 'Data Anggaran Daerah',
    description: 'Realisasi DPA dan anggaran pembangunan daerah tahun berjalan.',
    icon: FileText,
    format: 'PDF / Excel',
    updated: 'Mei 2026',
  },
  {
    title: 'Data Statistik Daerah',
    description: 'Indikator statistik daerah melalui SiStada untuk perencanaan pembangunan.',
    icon: BarChart3,
    format: 'Excel',
    updated: 'Mei 2026',
  },
];

export function OpenData() {
  return (
    <section id="data" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Satu Data <span className="text-[#1E6F3D]">Indonesia</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Portal data terbuka Kabupaten Penajam Paser Utara untuk transparansi, akuntabilitas, dan inovasi
          </p>
        </motion.div>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-[#1E6F3D] to-[#3CB371] p-8 sm:p-12 rounded-2xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <h3 className="text-2xl sm:text-3xl font-bold">Portal Satu Data PPU</h3>
                <p className="text-white/80">
                  Akses dataset publik dari seluruh OPD Kabupaten Penajam Paser Utara. 
                  Data tersedia dalam format terbuka dan dapat diunduh secara gratis.
                </p>
                <a href="https://data.penajamkab.go.id/" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-[#1E6F3D] hover:bg-white/90 rounded-full px-8 font-bold group">
                    Kunjungi Portal Data
                    <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold">250+</div>
                  <div className="text-sm text-white/80">Dataset</div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold">42</div>
                  <div className="text-sm text-white/80">Produsen Data</div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold">15K+</div>
                  <div className="text-sm text-white/80">Pengunduh</div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm text-white/80">Gratis</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Datasets */}
        <div className="grid md:grid-cols-2 gap-6">
          {datasets.map((dataset, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white h-full">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <dataset.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors">
                      {dataset.title}
                    </h3>
                    <p className="text-sm text-gray-600">{dataset.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-md">{dataset.format}</span>
                        <span>Diperbarui: {dataset.updated}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#1E6F3D] hover:text-[#1E6F3D] p-0">
                        <Download className="w-4 h-4" />
                      </Button>
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
