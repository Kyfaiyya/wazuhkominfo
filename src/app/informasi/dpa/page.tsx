"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Informasi',

  page_title: 'DPA 2024',
  page_description: 'Dokumen Pelaksanaan Anggaran Dinas Komunikasi dan Informatika PPU Tahun Anggaran 2024',
  heading: 'Berkas DPA 2024',
  file1_name: 'DPA Diskominfo PPU Tahun Anggaran 2024 - Ringkasan Belanja', file1_size: '1.8 MB', file1_date: 'Januari 2024',
  file2_name: 'DPA Diskominfo PPU Tahun Anggaran 2024 - Rincian Belanja Administrasi', file2_size: '2.5 MB', file2_date: 'Januari 2024',
  file3_name: 'DPA Diskominfo PPU Tahun Anggaran 2024 - Rincian Belanja Urusan TIK & Sandi', file3_size: '4.2 MB', file3_date: 'Januari 2024',
  file4_name: 'DPA Diskominfo PPU Tahun Anggaran 2024 - Rincian Belanja IKP', file4_size: '3.1 MB', file4_date: 'Januari 2024',
};

export default function DPAPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'dpa',
    defaultFields: DEFAULTS,
  });

  const fileCount = Object.keys(fields).filter(k => k.match(/^file\d+_name$/)).length;

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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <EditableText value={fields.heading} onChange={(v) => updateField('heading', v)} as="h2" className="text-2xl font-bold text-gray-900 border-b pb-4" />
            <div className="space-y-4">
              {Array.from({ length: fileCount }, (_, i) => i + 1).map((n) => (
                <div key={n} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex gap-3 items-center">
                    <FileText className="w-6 h-6 text-gray-400 shrink-0" />
                    <div>
                      <EditableText value={fields[`file${n}_name`]} onChange={(v) => updateField(`file${n}_name`, v)} as="h3" className="font-semibold text-gray-900 text-sm" />
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tanggal Publikasi: <EditableText value={fields[`file${n}_date`]} onChange={(v) => updateField(`file${n}_date`, v)} as="span" className="text-gray-500" /> | Ukuran: <EditableText value={fields[`file${n}_size`]} onChange={(v) => updateField(`file${n}_size`, v)} as="span" className="text-gray-500" />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0">
                    <Badge variant="secondary" className="text-xs uppercase">PDF</Badge>
                    <Button variant="ghost" size="sm" className="text-[#1E6F3D] hover:bg-[#1E6F3D]/5">
                      <Download className="w-4 h-4 mr-1.5" /> Unduh
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
      {isAdmin && <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />}
    </div>
  );
}
