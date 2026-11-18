"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion } from 'framer-motion';
import { HeartHandshake } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'PPID',

  page_title: 'Aspek Komitmen Organisasi',
  page_description: 'Komitmen dan Dasar Kebijakan PPID Kabupaten Penajam Paser Utara',
  heading: 'Pernyataan Komitmen PPID PPU',
  description: 'Kami berkomitmen untuk menyelenggarakan keterbukaan informasi publik secara profesional, cepat, tepat, dan berbiaya ringan demi pemenuhan hak asasi masyarakat atas informasi yang benar dan akuntabel di Penajam Paser Utara.',
  sk_title: 'SK Bupati Pembentukan PPID',
  sk_desc: 'Landasan hukum operasional PPID Utama Kabupaten PPU diatur berdasarkan Keputusan Bupati Penajam Paser Utara.',
  sop_title: 'Standar Pelayanan Operasional (SOP)',
  sop_desc: 'Prosedur penanganan berkas permohonan informasi dijamin kepatuhannya sesuai dengan SOP Keterbukaan Informasi Publik PPID PPU.',
};

export default function PPIDKomitmenOrganisasiPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'ppid-komitmen',
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-[#1E6F3D]" />
              <EditableText value={fields.heading} onChange={(v) => updateField('heading', v)} as="h2" className="text-2xl font-bold text-[#1E6F3D]" />
            </div>
            <EditableText value={fields.description} onChange={(v) => updateField('description', v)} as="p" multiline className="text-gray-700 leading-relaxed" />
            <div className="space-y-4 pt-4">
              <div className="p-5 border-l-4 border-yellow-500 bg-yellow-50/50 rounded-r-xl">
                <EditableText value={fields.sk_title} onChange={(v) => updateField('sk_title', v)} as="h3" className="font-bold text-gray-900 mb-1" />
                <EditableText value={fields.sk_desc} onChange={(v) => updateField('sk_desc', v)} as="p" multiline className="text-sm text-gray-600" />
              </div>
              <div className="p-5 border-l-4 border-green-500 bg-green-50/50 rounded-r-xl">
                <EditableText value={fields.sop_title} onChange={(v) => updateField('sop_title', v)} as="h3" className="font-bold text-gray-900 mb-1" />
                <EditableText value={fields.sop_desc} onChange={(v) => updateField('sop_desc', v)} as="p" multiline className="text-sm text-gray-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
