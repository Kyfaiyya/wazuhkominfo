"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion } from 'framer-motion';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Profil',

  page_title: 'Diskominfo & Sandi',
  page_description: 'Profil Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara',
  tentang_heading: 'Tentang Kami',
  tentang_p1: 'Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Penajam Paser Utara merupakan unsur pelaksana urusan pemerintahan di bidang komunikasi, informatika, statistik, dan persandian yang menjadi kewenangan daerah.',
  tentang_p2: 'Kami berkomitmen untuk terus meningkatkan kualitas pelayanan informasi publik, memperkuat infrastruktur teknologi informasi dan komunikasi (TIK) hingga ke tingkat desa, serta mengawal implementasi Sistem Pemerintahan Berbasis Elektronik (SPBE) demi mewujudkan tata kelola pemerintahan yang bersih, efektif, transparan, dan akuntabel.',
  tupoksi_heading: 'Tugas Pokok & Bidang Pelayanan',
  tupoksi_intro: 'Diskominfo PPU dipimpin oleh Kepala Dinas dan dibantu oleh Sekretariat serta 3 Bidang teknis:',
  tupoksi_1: 'Sekretariat: Melaksanakan koordinasi perencanaan, evaluasi, pelaporan, keuangan, umum, dan kepegawaian dinas.',
  tupoksi_2: 'Bidang Informasi Komunikasi Publik (IKP): Mengelola penyebaran informasi publik, hubungan media, kemitraan komunitas (KIM), serta PPID.',
  tupoksi_3: 'Bidang Aplikasi Informatika & E-Government: Mengembangkan aplikasi kepemerintahan, tata kelola SPBE, dan pemeliharaan server.',
  tupoksi_4: 'Bidang Sumber Daya TIK & Persandian: Mengelola jaringan internet desa, menara telekomunikasi (BTS), keamanan informasi siber, dan persandian daerah.',
};

export default function DiskominfoSandiPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'diskominfo-sandi',
    defaultFields: DEFAULTS,
  });

  const tupoksiKeys = Object.keys(fields).filter(k => k.startsWith('tupoksi_') && k !== 'tupoksi_heading' && k !== 'tupoksi_intro').sort();

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "Profil"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <EditableText
              value={fields.tentang_heading}
              onChange={(v) => updateField('tentang_heading', v)}
              as="h2"
              className="text-2xl font-bold text-[#1E6F3D]"
            />
            <EditableText
              value={fields.tentang_p1}
              onChange={(v) => updateField('tentang_p1', v)}
              as="p"
              multiline
              className="text-gray-700 leading-relaxed"
            />
            <EditableText
              value={fields.tentang_p2}
              onChange={(v) => updateField('tentang_p2', v)}
              as="p"
              multiline
              className="text-gray-700 leading-relaxed"
            />
            <EditableText
              value={fields.tupoksi_heading}
              onChange={(v) => updateField('tupoksi_heading', v)}
              as="h2"
              className="text-2xl font-bold text-[#1E6F3D] pt-4"
            />
            <EditableText
              value={fields.tupoksi_intro}
              onChange={(v) => updateField('tupoksi_intro', v)}
              as="p"
              className="text-gray-700 leading-relaxed"
            />
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              {tupoksiKeys.map((key) => (
                <li key={key}>
                  <EditableText
                    value={fields[key]}
                    onChange={(v) => updateField(key, v)}
                    as="span"
                    multiline
                    className="text-gray-700"
                  />
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>
      {isAdmin && (
        <InlineEditToolbar
          hasChanges={hasChanges}
          saving={saving}
          onSave={save}
          onReset={reset}
        />
      )}
    </div>
  );
}
