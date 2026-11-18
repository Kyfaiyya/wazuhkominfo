"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Gallery } from "@/frontend/components/features/gallery";
import { motion } from 'framer-motion';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Galeri',

  page_title: 'Galeri Foto',
  page_description: 'Dokumentasi berupa foto-foto kegiatan pembangunan dan pelayanan publik di Kabupaten Penajam Paser Utara',
};

export default function GalleryFotoPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'gallery-foto',
    defaultFields: DEFAULTS,
  });

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "Galeri"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Gallery />
      </motion.div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
