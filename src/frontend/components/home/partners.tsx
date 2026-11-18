"use client";

import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const defaultPartners = [
  {
    name: 'Kementerian Kominfo RI',
    url: 'https://www.kominfo.go.id/',
    color: 'bg-blue-50 hover:bg-blue-100',
    initial: 'Kominfo',
    bgColor: 'from-blue-600 to-blue-700',
  },
  {
    name: 'Pemerintah Kab. PPU',
    url: 'https://penajamkab.go.id/',
    color: 'bg-green-50 hover:bg-green-100',
    initial: 'PPU',
    bgColor: 'from-green-600 to-green-700',
  },
  {
    name: 'Pemprov Kalimantan Timur',
    url: 'https://kaltimprov.go.id/',
    color: 'bg-orange-50 hover:bg-orange-100',
    initial: 'Kaltim',
    bgColor: 'from-orange-600 to-orange-700',
  },
  {
    name: 'BSSN',
    url: 'https://bssn.go.id/',
    color: 'bg-red-50 hover:bg-red-100',
    initial: 'BSSN',
    bgColor: 'from-red-600 to-red-700',
  },
  {
    name: 'BPS Kab. PPU',
    url: 'https://penajamkab.bps.go.id/',
    color: 'bg-purple-50 hover:bg-purple-100',
    initial: 'BPS',
    bgColor: 'from-purple-600 to-purple-700',
  },
  {
    name: 'PPID Kab. PPU',
    url: 'https://ppidppu.penajamkab.go.id/',
    color: 'bg-teal-50 hover:bg-teal-100',
    initial: 'PPID',
    bgColor: 'from-teal-600 to-teal-700',
  },
];

export function Partners() {
  const [partners, setPartners] = useState<any[]>(defaultPartners);

  useEffect(() => {
    fetch('/api/pages?slug=partners')
      .then((res) => res.json())
      .then((data) => {
        if (data.fields && data.fields.partners_list) {
          try {
            const parsed = JSON.parse(data.fields.partners_list);
            if (Array.isArray(parsed)) {
              setPartners(parsed);
            }
          } catch (e) {
            console.error('Error parsing partners_list:', e);
          }
        }
      })
      .catch((err) => console.error('Error fetching partners:', err));
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Mitra & <span className="text-[#1E6F3D]">Instansi Terkait</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bekerja sama dengan berbagai instansi untuk mewujudkan pemerintahan digital
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <motion.a
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`group flex flex-col items-center gap-4 p-6 rounded-2xl ${partner.color} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${partner.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <span className="text-white font-bold text-xs text-center leading-tight">{partner.initial}</span>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-[#1E6F3D] transition-colors">
                  {partner.name}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 mx-auto mt-1 group-hover:text-[#1E6F3D] transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
