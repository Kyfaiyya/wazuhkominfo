"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { motion } from 'framer-motion';
import { ShieldAlert, BookOpen, ExternalLink, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'PPID',

  page_title: 'PPID Utama',
  page_description: 'Pejabat Pengelola Informasi dan Dokumentasi Kabupaten Penajam Paser Utara',
  tentang_heading: 'Tentang PPID PPU',
  tentang_desc: 'Selamat datang di PPID Utama Kabupaten Penajam Paser Utara. Layanan ini merupakan sarana penyediaan informasi publik bagi masyarakat guna mewujudkan keterbukaan informasi publik yang transparan dan akuntabel.',
  cta_heading: 'Ajukan Permohonan Informasi Online',
  cta_desc: 'Masuk ke sistem portal PPID Utama untuk melakukan permohonan informasi publik secara mandiri.',
};

export default function PPIDMainPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'ppid-utama',
    defaultFields: DEFAULTS,
  });

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "PPID"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <EditableText value={fields.tentang_heading} onChange={(v) => updateField('tentang_heading', v)} as="h2" className="text-2xl font-bold text-gray-900" />
            <EditableText value={fields.tentang_desc} onChange={(v) => updateField('tentang_desc', v)} as="p" multiline className="text-gray-700 leading-relaxed" />

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <Link href="/ppid/sarana-prasarana" className="group">
                <div className="p-6 border-2 border-gray-100 rounded-2xl text-center hover:border-[#1E6F3D] transition-colors h-full flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ClipboardCheck className="w-6 h-6 text-[#1E6F3D]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Sarana & Prasarana</h3>
                  <p className="text-xs text-gray-500">Fasilitas pelayanan fisik & online</p>
                </div>
              </Link>
              <Link href="/ppid/komitmen-organisasi" className="group">
                <div className="p-6 border-2 border-gray-100 rounded-2xl text-center hover:border-[#1E6F3D] transition-colors h-full flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-6 h-6 text-[#1E6F3D]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Komitmen Organisasi</h3>
                  <p className="text-xs text-gray-500">Dasar hukum dan kebijakan PPID</p>
                </div>
              </Link>
              <Link href="/ppid/informasi-berkala" className="group">
                <div className="p-6 border-2 border-gray-100 rounded-2xl text-center hover:border-[#1E6F3D] transition-colors h-full flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-[#1E6F3D]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Informasi Berkala</h3>
                  <p className="text-xs text-gray-500">Dokumen laporan tahunan & berkala</p>
                </div>
              </Link>
            </div>

            <div className="bg-gradient-to-r from-[#1E6F3D] to-[#3CB371] text-white p-8 rounded-2xl shadow-lg mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <EditableText value={fields.cta_heading} onChange={(v) => updateField('cta_heading', v)} as="h3" className="font-bold text-xl text-white" />
                <EditableText value={fields.cta_desc} onChange={(v) => updateField('cta_desc', v)} as="p" multiline className="text-white/80 text-sm" />
              </div>
              <a href="https://ppidppu.penajamkab.go.id/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button className="bg-white text-[#1E6F3D] hover:bg-white/95 rounded-full px-6 font-bold shadow-md">
                  PPID Online <ExternalLink className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
      {isAdmin && (
        <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />
      )}
    </div>
  );
}
