"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { DigitalServices } from "@/frontend/components/home/digital-services";
import { motion } from 'framer-motion';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";
import { useAuth } from "@/frontend/components/shared/auth-context";

const DEFAULTS = {
  page_category: 'Layanan',

  page_title: 'Layanan',
  page_description: 'Informasi terkini dari Dinas Komunikasi dan Informatika Kabupaten.',
};

export default function LayananPage() {
  const { isEditMode } = useAuth();
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'layanan',
    defaultFields: DEFAULTS,
  });

  return (
    <div>
      <PageHeader
        title={fields.page_title}
        description={fields.page_description}
        category={fields.page_category || "Layanan"}
        onTitleChange={(v) => updateField('page_title', v)}
        onDescriptionChange={(v) => updateField('page_description', v)}
        onCategoryChange={(v) => updateField('page_category', v)}
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <DigitalServices />
      </motion.div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
