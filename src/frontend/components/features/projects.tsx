"use client";

import { Monitor, Database, Wifi, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';


const projects = [
  {
    icon: Monitor,
    title: 'Sistem Pemerintahan Berbasis Elektronik (SPBE)',
    status: 'Berjalan',
    progress: 78,
    description: 'Implementasi SPBE untuk meningkatkan kualitas penyelenggaraan pemerintahan yang memanfaatkan teknologi informasi dan komunikasi.',
    milestones: ['e-Office', 'e-Planning', 'e-Budgeting', 'e-Surat'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Database,
    title: 'Satu Data Indonesia',
    status: 'Berjalan',
    progress: 65,
    description: 'Kebijakan tata kelola data pemerintah untuk menghasilkan data yang akurat, mutakhir, terpadu, dan dapat dipertanggungjawabkan.',
    milestones: ['Portal Data', 'Walidata', 'Interoperabilitas', 'Metadata'],
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Wifi,
    title: 'Internet Masuk Desa',
    status: 'Berjalan',
    progress: 82,
    description: 'Program pemerataan akses internet ke seluruh desa di Kabupaten Penajam Paser Utara untuk mengatasi kesenjangan digital.',
    milestones: ['Fiber Optik', 'Hotspot Desa', 'Pelatihan Digital', 'Monitoring'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: Shield,
    title: 'Keamanan Informasi & Persandian',
    status: 'Berjalan',
    progress: 55,
    description: 'Penguatan keamanan siber dan persandian untuk melindungi data dan informasi pemerintah daerah dari ancaman digital.',
    milestones: ['Audit Keamanan', 'Sertifikasi', 'SOC', 'CSIRT'],
    color: 'from-red-500 to-red-600',
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Program <span className="text-[#1E6F3D]">Unggulan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Program strategis Diskominfo PPU dalam mewujudkan pemerintahan digital
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group p-8 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                    <project.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">{project.status}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6">{project.description}</p>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-[#1E6F3D]">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${project.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full bg-gradient-to-r ${project.color} rounded-full`}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-2 gap-2">
                  {project.milestones.map((milestone, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {milestone}
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
