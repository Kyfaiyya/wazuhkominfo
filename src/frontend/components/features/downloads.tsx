"use client";

import { FileText, Download, BookOpen, Scale, FolderOpen } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';


const downloadCategories = [
  {
    icon: Scale,
    title: 'Produk Hukum',
    items: [
      { name: 'Regulasi Telekomunikasi', format: 'PDF', size: '2.4 MB' },
      { name: 'Regulasi Perizinan', format: 'PDF', size: '1.8 MB' },
      { name: 'Regulasi Frekuensi', format: 'PDF', size: '3.1 MB' },
      { name: 'Regulasi Penyiaran', format: 'PDF', size: '1.2 MB' },
    ],
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: FileText,
    title: 'Regulasi',
    items: [
      { name: 'Peraturan Bupati tentang SPBE', format: 'PDF', size: '5.2 MB' },
      { name: 'SK Pejabat Pengelola Informasi', format: 'PDF', size: '1.4 MB' },
      { name: 'Perda Keterbukaan Informasi', format: 'PDF', size: '3.6 MB' },
    ],
    color: 'from-green-500 to-green-600',
  },
  {
    icon: BookOpen,
    title: 'Materi',
    items: [
      { name: 'Panduan Satu Data Indonesia', format: 'PDF', size: '8.5 MB' },
      { name: 'Modul Literasi Digital', format: 'PDF', size: '12.3 MB' },
      { name: 'Materi Sosialisasi SPBE', format: 'PPTX', size: '15.7 MB' },
    ],
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: FolderOpen,
    title: 'Dokumen Teknis',
    items: [
      { name: 'Masterplan TIK Kab. PPU', format: 'PDF', size: '22.4 MB' },
      { name: 'Arsitektur SPBE', format: 'PDF', size: '18.1 MB' },
      { name: 'SOP Layanan Diskominfo', format: 'PDF', size: '4.7 MB' },
    ],
    color: 'from-purple-500 to-purple-600',
  },
];

export function Downloads() {
  return (
    <section id="downloads" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-[#1E6F3D]">Unduhan</span> Dokumen
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Akses dan unduh dokumen resmi, regulasi, dan materi dari Diskominfo PPU
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {downloadCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                </div>

                <div className="space-y-3">
                  {category.items.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#1E6F3D] transition-colors" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-[#1E6F3D] transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">{item.size}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{item.format}</Badge>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-[#1E6F3D] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
