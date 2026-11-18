"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Events } from "@/frontend/components/features/events";
import { motion } from 'framer-motion';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Informasi',

  page_title: 'Agenda Kegiatan',
  page_description: 'Jadwal rapat, sosialisasi, safari dinas, dan acara penting Kabupaten Penajam Paser Utara',
};

export default function InformasiAgendaPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'informasi-agenda',
    defaultFields: DEFAULTS,
  });

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "Informasi"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Events />
      </motion.div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
