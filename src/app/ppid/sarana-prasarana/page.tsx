"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion } from 'framer-motion';
import { ShieldCheck, Monitor, HelpCircle, User } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'PPID',

  page_title: 'Aspek Sarana & Prasarana',
  page_description: 'Fasilitas Pelayanan Informasi Publik Pejabat Pengelola Informasi dan Dokumentasi Kabupaten Penajam Paser Utara',
  heading: 'Komitmen Ketersediaan Sarana Layanan',
  description: 'PPID Kabupaten Penajam Paser Utara secara rutin melakukan pemeliharaan sarana dan prasarana guna menunjang kelancaran pelayanan informasi publik. Hal ini sejalan dengan amanah UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.',
  fac1_title: 'Meja Layanan Informasi Fisik',
  fac1_desc: 'Disediakan meja layanan khusus di lobi kantor Diskominfo PPU bagi pemohon informasi yang hadir langsung.',
  fac2_title: 'Portal PPID Online',
  fac2_desc: 'Aplikasi berbasis web untuk memudahkan permohonan informasi secara daring di ppidppu.penajamkab.go.id.',
  fac3_title: 'Petugas Layanan Khusus',
  fac3_desc: 'Petugas bersertifikasi yang siap melayani pemohon informasi secara ramah dan profesional.',
  fac4_title: 'Ruang Konsultasi PPID',
  fac4_desc: 'Ruang khusus untuk mediasi atau penjelasan detail mengenai berkas/informasi daerah.',
};

const facIcons = [Monitor, ShieldCheck, User, HelpCircle];

export default function PPIDSaranaPrasaranaPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'ppid-sarana-prasarana',
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
            <EditableText value={fields.heading} onChange={(v) => updateField('heading', v)} as="h2" className="text-2xl font-bold text-[#1E6F3D]" />
            <EditableText value={fields.description} onChange={(v) => updateField('description', v)} as="p" multiline className="text-gray-700 leading-relaxed" />
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              {[1, 2, 3, 4].map((n) => {
                const Icon = facIcons[n - 1];
                return (
                  <div key={n} className="p-6 border rounded-2xl bg-gray-50 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shrink-0 shadow">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <EditableText value={fields[`fac${n}_title`]} onChange={(v) => updateField(`fac${n}_title`, v)} as="h3" className="font-bold text-gray-900 text-sm mb-1" />
                      <EditableText value={fields[`fac${n}_desc`]} onChange={(v) => updateField(`fac${n}_desc`, v)} as="p" multiline className="text-xs text-gray-500 leading-relaxed" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
