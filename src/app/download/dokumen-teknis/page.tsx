"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Downloads } from "@/frontend/components/features/downloads";
import { motion } from 'framer-motion';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Download',

  page_title: 'Dokumen Teknis & Masterplan',
  page_description: 'Dokumen standar operasional prosedur (SOP), arsitektur SPBE, dan masterplan infrastruktur TIK',
};

export default function DownloadDokumenTeknisPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'download-dokumen-teknis',
    defaultFields: DEFAULTS,
  });

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "Download"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Downloads />
      </motion.div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
