"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Videos } from "@/frontend/components/features/videos";
import { motion } from 'framer-motion';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Galeri',

  page_title: 'Galeri Video',
  page_description: 'Dokumentasi berupa video liputan, profil dinas, dan rilis pers Kabupaten Penajam Paser Utara',
};

export default function GalleryVideoPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'gallery-video',
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
        <Videos />
      </motion.div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
