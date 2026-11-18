"use client";

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useInlineEdit } from '../shared/use-inline-edit';
import { EditableText } from '../shared/editable-text';
import { InlineEditToolbar } from '../shared/inline-edit-toolbar';

const footerLinks = {
  'Profil': [
    { name: 'Diskominfo & Sandi', href: '/profil/diskominfo-sandi' },
    { name: 'Visi Misi', href: '/profil/visi-misi' },
    { name: 'Tupoksi', href: '/profil/tupoksi' },
    { name: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
    { name: 'Organisasi', href: '/profil/organisasi' },
  ],
  'Informasi': [
    { name: 'Berita Terkini', href: '/informasi/kegiatan' },
    { name: 'Pengumuman', href: '/informasi/pengumuman' },
    { name: 'Agenda Kegiatan', href: '/informasi/agenda' },
    { name: 'Galeri Foto', href: '/gallery/foto' },
    { name: 'Galeri Video', href: '/gallery/video' },
  ],
  'Layanan': [
    { name: 'PPID Online', href: 'https://ppidppu.penajamkab.go.id/' },
    { name: 'Satu Data PPU', href: 'https://data.penajamkab.go.id/' },
    { name: 'Aplikasi SiStada', href: 'https://sistada.penajamkab.go.id/' },
    { name: 'Layanan Kominfo', href: 'https://layanan.kominfo.go.id/' },
    { name: 'Buku Tamu', href: 'https://sibuta.penajamkab.go.id/buku-tamu/' },
  ],
  'Tautan': [
    { name: 'Website Kab. PPU', href: 'https://penajamkab.go.id/' },
    { name: 'Kominfo RI', href: 'https://www.kominfo.go.id/' },
    { name: 'Pemprov Kaltim', href: 'https://kaltimprov.go.id/' },
    { name: 'Info Publik', href: 'https://infopublik.id/' },
    { name: 'Dashboard TIK', href: '/layanan' },
  ],
};

const FOOTER_DEFAULTS = {
  deskripsi: 'Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara — melayani masyarakat dalam bidang komunikasi, informatika, statistik, dan persandian.',
  alamat_line1: 'Jl. Propinsi KM.09 Nipah-nipah',
  alamat_line2: 'Penajam, Kab. PPU, Kalimantan Timur',
  facebook: 'https://www.facebook.com/diskominfoPPU/',
  instagram: 'https://www.instagram.com/diskominfo.ppu/',
  twitter: 'https://x.com/diskominfoppu',
  youtube: 'https://www.youtube.com/channel/UCWlYHCuEAeWppVyvfUBj_AQ/videos',
  website: 'https://diskominfo.penajamkab.go.id/',
};

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'footer',
    defaultFields: FOOTER_DEFAULTS,
  });

  if (pathname?.startsWith('/admin')) return null;

  const socialLinks = [
    { icon: Facebook, href: fields.facebook, label: 'Facebook' },
    { icon: Instagram, href: fields.instagram, label: 'Instagram' },
    { icon: Twitter, href: fields.twitter, label: 'X (Twitter)' },
    { icon: Youtube, href: fields.youtube, label: 'YouTube' },
    { icon: Globe, href: fields.website, label: 'Website Resmi' },
  ];

  return (
    <>
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src="/logo.png"
                    alt="Logo Kab. PPU"
                    className="w-12 h-14 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                  />
                  <div>
                    <h3 className="text-lg font-bold leading-tight">Diskominfo</h3>
                    <p className="text-sm text-gray-400">Kab. Penajam Paser Utara</p>
                  </div>
                </div>
                <EditableText
                  value={fields.deskripsi}
                  onChange={(v) => updateField('deskripsi', v)}
                  as="p"
                  multiline
                  className="text-gray-400 text-sm leading-relaxed"
                  editClassName="text-gray-900 text-sm leading-relaxed"
                />
                <div className="pt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">📍</span>
                    <EditableText
                      value={fields.alamat_line1}
                      onChange={(v) => updateField('alamat_line1', v)}
                      as="span"
                      className="text-xs text-gray-500"
                      editClassName="text-gray-900 text-xs"
                    />
                  </div>
                  <EditableText
                    value={fields.alamat_line2}
                    onChange={(v) => updateField('alamat_line2', v)}
                    as="p"
                    className="text-xs text-gray-500 pl-4"
                    editClassName="text-gray-900 text-xs"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-[#1E6F3D] hover:to-[#3CB371] flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-bold text-lg mb-6">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('http') ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center group cursor-pointer"
                        >
                          <span className="group-hover:translate-x-1 transition-transform inline-block">
                            {link.name}
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center group cursor-pointer"
                        >
                          <span className="group-hover:translate-x-1 transition-transform inline-block">
                            {link.name}
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
              <p>© 2026 Dinas Komunikasi dan Informatika Kab. Penajam Paser Utara. Hak Cipta Dilindungi.</p>
              <div className="flex gap-6">
                <Link href="/kontak" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
                <Link href="/" className="hover:text-white transition-colors">Peta Situs</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {isAdmin && (
        <InlineEditToolbar
          hasChanges={hasChanges}
          saving={saving}
          onSave={save}
          onReset={reset}
          className="bottom-28"
        />
      )}
    </>
  );
}
