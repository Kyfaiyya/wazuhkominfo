"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion } from 'framer-motion';
import { Target, Award } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const VISI_MISI_DEFAULTS = {
  page_category: 'Profil',
  page_title: 'Visi & Misi',
  page_description: 'Visi dan Misi Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara',

  visi: '"Terwujudnya Kabupaten Penajam Paser Utara yang Maju, Modern, dan Religius"',
  visi_deskripsi: 'Menjadikan Diskominfo PPU sebagai pilar utama akselerasi transformasi digital yang mendukung terwujudnya Kabupaten Penajam Paser Utara yang berdaya saing tinggi dan berlandaskan nilai-nilai keagamaan.',
  misi_1: 'Meningkatkan infrastruktur teknologi informasi dan komunikasi untuk memperluas jangkauan layanan internet publik hingga ke pedesaan.',
  misi_2: 'Mendorong percepatan implementasi Sistem Pemerintahan Berbasis Elektronik (SPBE) untuk tata kelola pemerintahan yang cepat dan efisien.',
  misi_3: 'Meningkatkan penyediaan dan penyebaran informasi publik yang transparan, akurat, dan mendidik guna mendukung partisipasi aktif masyarakat.',
  misi_4: 'Memperkuat keamanan siber dan persandian daerah untuk melindungi kerahasiaan data serta integritas sistem informasi pemerintah.',
  misi_5: 'Meningkatkan literasi digital masyarakat Penajam Paser Utara agar siap menghadapi tantangan di era global.',
};

export default function VisiMisiPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'visi-misi',
    defaultFields: VISI_MISI_DEFAULTS,
  });

  const misiKeys = Object.keys(fields).filter(key => key.startsWith('misi_')).sort();

  return (
    <div>
      <PageHeader
        title={fields.page_title || "Visi & Misi"}
        description={fields.page_description || "Visi dan Misi Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara"}
        category={fields.page_category || "Profil"}
        onCategoryChange={(v) => updateField('page_category', v)}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Visi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Target className="w-32 h-32 text-[#1E6F3D]" />
            </div>
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                Visi
              </span>
              <EditableText
                value={fields.visi}
                onChange={(v) => updateField('visi', v)}
                as="h2"
                multiline
                className="text-3xl font-bold text-gray-900 leading-tight"
              />
              <EditableText
                value={fields.visi_deskripsi}
                onChange={(v) => updateField('visi_deskripsi', v)}
                as="p"
                multiline
                className="text-gray-600 leading-relaxed"
              />
            </div>
          </Card>
        </motion.div>

        {/* Misi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Award className="w-32 h-32 text-[#1E6F3D]" />
            </div>
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                Misi
              </span>
              <h2 className="text-3xl font-bold text-gray-900">Misi Diskominfo PPU</h2>
              <div className="space-y-4">
                {misiKeys.map((key, index) => (
                  <div key={key} className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                    <EditableText
                      value={fields[key]}
                      onChange={(v) => updateField(key, v)}
                      as="p"
                      multiline
                      className="text-gray-700 leading-relaxed pt-0.5"
                    />
                  </div>
                ))}
              </div>
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
