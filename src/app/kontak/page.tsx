"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Contact } from "@/frontend/components/features/contact";
import { FAQ } from "@/frontend/components/home/faq";
import { motion } from 'framer-motion';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const CONTACT_DEFAULTS = {
  page_category: 'Kontak',

  page_title: 'Hubungi & FAQ',
  page_description: 'Kontak resmi Dinas Komunikasi dan Informatika PPU, peta lokasi kantor, serta jawaban atas pertanyaan umum',
  alamat: 'Jl. Propinsi KM.09 Nipah-nipah, Penajam, Kab. PPU, Kalimantan Timur',
  telepon: '(0542) 7211234',
  email: 'diskominfo@penajamkab.go.id',
  jam_kerja: 'Senin - Jumat, 08:00 - 16:00 WITA',
};

export default function KontakPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'kontak',
    defaultFields: CONTACT_DEFAULTS,
  });

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "Kontak"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Contact fields={fields} updateField={updateField} />
        <FAQ />
      </motion.div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
