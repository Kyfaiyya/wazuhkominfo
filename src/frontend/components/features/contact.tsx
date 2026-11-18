"use client";

import { Mail, Phone, MapPin, Send, Clock, Instagram } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { motion } from 'framer-motion';
import { EditableText } from '../shared/editable-text';

interface ContactProps {
  fields?: Record<string, string>;
  updateField?: (key: string, value: string) => void;
}

export function Contact({ fields, updateField }: ContactProps) {
  const alamatVal = fields?.alamat || 'Jl. Propinsi KM.09 Nipah-nipah, Penajam, Kab. PPU, Kalimantan Timur';
  const teleponVal = fields?.telepon || '(0542) 7211234';
  const emailVal = fields?.email || 'diskominfo@penajamkab.go.id';
  const jamKerjaVal = fields?.jam_kerja || 'Senin - Jumat, 08:00 - 16:00 WITA';

  const contactMethods = [
    {
      icon: MapPin,
      title: 'Alamat Kantor',
      detail: 'Dinas Kominfo PPU',
      subtitle: (
        updateField ? (
          <EditableText
            value={alamatVal}
            onChange={(v) => updateField('alamat', v)}
            as="p"
            multiline
            className="text-sm text-gray-600"
            editClassName="text-xs text-gray-900"
          />
        ) : (
          <p className="text-sm text-gray-600">{alamatVal}</p>
        )
      )
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      detail: 'Waktu Pelayanan',
      subtitle: (
        updateField ? (
          <EditableText
            value={jamKerjaVal}
            onChange={(v) => updateField('jam_kerja', v)}
            as="p"
            multiline
            className="text-sm text-gray-600"
            editClassName="text-xs text-gray-900"
          />
        ) : (
          <p className="text-sm text-gray-600">{jamKerjaVal}</p>
        )
      )
    },
    {
      icon: Mail,
      title: 'Hubungi Kami',
      detail: (
        updateField ? (
          <EditableText
            value={teleponVal}
            onChange={(v) => updateField('telepon', v)}
            as="p"
            className="text-lg text-[#1E6F3D] font-semibold mb-1"
            editClassName="text-sm text-gray-900"
          />
        ) : (
          <p className="text-lg text-[#1E6F3D] font-semibold mb-1">{teleponVal}</p>
        )
      ),
      subtitle: (
        updateField ? (
          <EditableText
            value={emailVal}
            onChange={(v) => updateField('email', v)}
            as="p"
            className="text-sm text-gray-600"
            editClassName="text-xs text-gray-900"
          />
        ) : (
          <p className="text-sm text-gray-600">{emailVal}</p>
        )
      )
    },
  ];

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Hubungi <span className="text-[#1E6F3D]">Kami</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Silakan hubungi kami untuk informasi lebih lanjut atau pertanyaan seputar layanan Diskominfo PPU
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group p-8 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white text-center h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                {typeof method.detail === 'string' ? (
                  <p className="text-lg text-[#1E6F3D] font-semibold mb-1">{method.detail}</p>
                ) : (
                  method.detail
                )}
                {typeof method.subtitle === 'string' ? (
                  <p className="text-sm text-gray-600">{method.subtitle}</p>
                ) : (
                  method.subtitle
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 sm:p-12 rounded-2xl border border-gray-200/50 shadow-lg bg-white">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Kirim Pesan kepada Kami
              </h3>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nama Lengkap
                    </label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama Anda"
                      className="rounded-xl border-gray-200 focus:border-[#1E6F3D] focus:ring-[#1E6F3D]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Alamat Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@contoh.com"
                      className="rounded-xl border-gray-200 focus:border-[#1E6F3D] focus:ring-[#1E6F3D]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subjek
                  </label>
                  <Input
                    id="subject"
                    placeholder="Perihal pesan Anda"
                    className="rounded-xl border-gray-200 focus:border-[#1E6F3D] focus:ring-[#1E6F3D]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Pesan
                  </label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Tuliskan pesan Anda di sini..."
                    className="rounded-xl border-gray-200 focus:border-[#1E6F3D] focus:ring-[#1E6F3D] resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#1E6F3D] via-[#2E8B57] to-[#3CB371] text-white rounded-full px-8 text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  Kirim Pesan
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
