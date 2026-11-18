"use client";

import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const defaultFaqs = [
  {
    question: 'Bagaimana cara mengajukan permohonan informasi melalui PPID?',
    answer: 'Anda dapat mengajukan permohonan informasi publik melalui website PPID Kabupaten Penajam Paser Utara di ppidppu.penajamkab.go.id. Isi formulir permohonan informasi secara lengkap dan tunggu respon dari petugas PPID dalam waktu maksimal 10 hari kerja.',
  },
  {
    question: 'Bagaimana cara melaporkan gangguan jaringan internet pemerintah?',
    answer: 'Laporan gangguan jaringan internet dapat dilakukan melalui Formulir Perbaikan Jaringan Internet yang tersedia di website Diskominfo PPU. Isi data lokasi, jenis gangguan, dan kontak yang dapat dihubungi. Tim teknis kami akan merespon dalam 1x24 jam kerja.',
  },
  {
    question: 'Apa itu Satu Data Indonesia dan bagaimana cara mengaksesnya?',
    answer: 'Satu Data Indonesia adalah kebijakan tata kelola data pemerintah yang bertujuan menghasilkan data yang akurat, mutakhir, terpadu, dan dapat dipertanggungjawabkan. Portal Satu Data PPU dapat diakses di data.penajamkab.go.id untuk mengunduh dataset publik secara gratis.',
  },
  {
    question: 'Bagaimana prosedur pengajuan domain go.id untuk perangkat daerah?',
    answer: 'Perangkat daerah yang memerlukan domain go.id dapat mengajukan permohonan melalui Diskominfo PPU dengan melampirkan surat permohonan resmi dari kepala OPD, proposal penggunaan domain, dan data teknis yang diperlukan. Proses verifikasi membutuhkan waktu 5-14 hari kerja.',
  },
  {
    question: 'Apa saja layanan yang disediakan oleh Diskominfo PPU?',
    answer: 'Diskominfo PPU menyediakan berbagai layanan termasuk: pengelolaan jaringan internet pemerintah, pengelolaan data statistik daerah (SiStada), pelayanan informasi publik (PPID), pengelolaan website dan media sosial pemerintah, pengelolaan infrastruktur TIK, dan persandian.',
  },
  {
    question: 'Bagaimana cara menghubungi Diskominfo PPU?',
    answer: 'Anda dapat menghubungi kami melalui: Alamat kantor di Jl. Propinsi KM.09 Nipah-nipah, Penajam, Kab. Penajam Paser Utara, Kalimantan Timur. Atau melalui Instagram @diskominfoppu, YouTube channel Diskominfo PPU, atau langsung datang ke kantor kami pada jam kerja (Senin-Jumat, 08:00-16:00 WITA).',
  },
];

export function FAQ() {
  const [faqs, setFaqs] = useState<any[]>(defaultFaqs);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/pages?slug=faq')
      .then((res) => res.json())
      .then((data) => {
        if (data.fields && data.fields.faqs_list) {
          try {
            const parsed = JSON.parse(data.fields.faqs_list);
            if (Array.isArray(parsed)) {
              setFaqs(parsed);
            }
          } catch (e) {
            console.error('Error parsing faqs_list:', e);
          }
        }
      })
      .catch((err) => console.error('Error fetching FAQs:', err));
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Pertanyaan yang Sering <span className="text-[#1E6F3D]">Diajukan</span>
          </h2>
          <p className="text-xl text-gray-600">
            Temukan jawaban untuk pertanyaan umum seputar layanan Diskominfo PPU
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <div
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? 'border-[#1E6F3D]/30 shadow-lg bg-white'
                    : 'border-gray-200/50 shadow-sm bg-white hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180 text-[#1E6F3D]' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
