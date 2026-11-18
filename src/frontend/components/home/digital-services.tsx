"use client";

import { ArrowRight, Wifi, MessageSquareWarning, Server, Database, FolderOpen, PenTool, Video } from 'lucide-react';
import { Card } from '../ui/card';
import { motion } from 'framer-motion';


const services = [
  {
    code: 'PM',
    icon: MessageSquareWarning,
    title: 'Pengaduan Masyarakat',
    description: 'Pengaduan Masyarakat',
    color: 'from-orange-500 to-red-500',
    link: '/layanan/pengaduan-masyarakat',
  },
  {
    code: 'SH',
    icon: Server,
    title: 'Subdomain dan Hosting',
    description: 'Subdomain dan Hosting dilingkungan Kabupaten Penajam Paser Utara',
    color: 'from-blue-500 to-indigo-600',
    link: '/layanan/subdomain-dan-hosting',
  },
  {
    code: 'LP',
    icon: Database,
    title: 'Layanan Portal Satu Data',
    description: 'Layanan Portal Satu Data Kabupaten Penajam Paser Utara',
    color: 'from-violet-500 to-purple-600',
    link: 'https://data.penajamkab.go.id/',
  },
  {
    code: 'LO',
    icon: FolderOpen,
    title: 'Layanan Open Data',
    description: 'Layanan Open Data Kabupaten Penajam Paser Utara',
    color: 'from-cyan-500 to-teal-600',
    link: 'https://opendata.penajamkab.go.id/',
  },
  {
    code: 'TT',
    icon: PenTool,
    title: 'Tanda Tangan Elektronik',
    description: 'Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara Menyediakan Sertifikat Tanda Tangan Elektronik bagi Pejabat Eselon 2 dan 3 maupun ASN yang Berkepentingan',
    color: 'from-amber-500 to-yellow-600',
    link: '/layanan/tanda-tangan-elektronik',
  },
  {
    code: 'FV',
    icon: Video,
    title: 'Fasilitas Video Conference',
    description: 'Fasilitas Video Conference dilingkungan Kabupaten Penajam Paser Utara',
    color: 'from-rose-500 to-pink-600',
    link: '/layanan/fasilitas-video-conference',
  },
];

export function DigitalServices() {
  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Semua <span className="text-[#1E6F3D]">Layanan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Informasi kegiatan dan layanan publik resmi Diskominfo Kabupaten Penajam Paser Utara
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <a
                href={service.link}
                target={service.link.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block h-full"
              >
                <Card className="group p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white h-full flex flex-col">
                  {/* Badge Code & Icon */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2.5 py-1 bg-[#1E6F3D]/10 text-[#1E6F3D] text-xs font-bold rounded-md tracking-wider mb-2">
                        {service.code}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E6F3D] transition-colors leading-tight">
                        {service.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-5 flex-1 leading-relaxed">{service.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E6F3D] cursor-pointer group/btn w-fit mt-auto">
                    <span className="relative py-0.5">
                      Akses Layanan
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1E6F3D] transition-all duration-300 group-hover/btn:w-full"></span>
                    </span>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1E6F3D]/10 text-[#1E6F3D] group-hover/btn:bg-[#1E6F3D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
