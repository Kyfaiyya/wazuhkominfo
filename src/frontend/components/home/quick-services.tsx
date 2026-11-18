"use client";

import Link from 'next/link';
import { Card } from '../ui/card';
import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceItem {
  icon: string;
  name: string;
  desc: string;
  color: string;
  href: string;
  external: boolean;
}

const defaultServices: ServiceItem[] = [
  { icon: 'Wifi', name: 'Perbaikan Jaringan Internet', desc: 'Lapor gangguan internet', color: 'from-blue-500 to-blue-600', href: 'https://www.lapor.go.id/', external: true },
  { icon: 'Database', name: 'SATU DATA', desc: 'Portal data terbuka', color: 'from-green-500 to-green-600', href: 'https://data.penajamkab.go.id/', external: true },
  { icon: 'Globe', name: 'Website PPU', desc: 'Portal resmi kabupaten', color: 'from-indigo-500 to-indigo-600', href: 'https://penajamkab.go.id/', external: true },
  { icon: 'Megaphone', name: 'Info Publik', desc: 'Informasi untuk masyarakat', color: 'from-orange-500 to-orange-600', href: '/informasi/pengumuman', external: false },
  { icon: 'BarChart3', name: 'Aplikasi SiStada', desc: 'Sistem statistik daerah', color: 'from-purple-500 to-purple-600', href: 'https://diskominfo.penajamkab.go.id/', external: true },
  { icon: 'Shield', name: 'PPID', desc: 'Pejabat pengelola informasi', color: 'from-red-500 to-red-600', href: 'https://ppidppu.penajamkab.go.id/', external: true },
  { icon: 'BookOpen', name: 'Layanan Kominfo', desc: 'Layanan Kemenkominfo', color: 'from-teal-500 to-teal-600', href: '/layanan', external: false },
  { icon: 'ClipboardList', name: 'Buku Tamu', desc: 'Buku tamu digital', color: 'from-pink-500 to-pink-600', href: '/kontak', external: false },
];

export function QuickServices() {
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);

  useEffect(() => {
    fetch('/api/pages?slug=quick-services')
      .then((res) => res.json())
      .then((data) => {
        if (data.fields && data.fields.services_list) {
          try {
            const parsed = JSON.parse(data.fields.services_list);
            if (Array.isArray(parsed)) {
              setServices(parsed);
            }
          } catch (e) {
            console.error('Error parsing services_list:', e);
          }
        }
      })
      .catch((err) => console.error('Error fetching quick-services:', err));
  }, []);

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.HelpCircle;
  };

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Layanan <span className="text-[#1E6F3D]">Cepat</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Akses berbagai layanan pemerintah Kabupaten Penajam Paser Utara dengan mudah dan cepat
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = getIconComponent(service.icon);
            const CardContent = (
              <Card className="group p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white h-full">
                <div className="space-y-3">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#1E6F3D] transition-colors text-sm sm:text-base">
                    {service.name}
                  </h3>
                  <p className="text-xs text-gray-500">{service.desc}</p>
                </div>
              </Card>
            );

            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                {service.external ? (
                  <a href={service.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                    {CardContent}
                  </a>
                ) : (
                  <Link href={service.href} className="block h-full">
                    {CardContent}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
