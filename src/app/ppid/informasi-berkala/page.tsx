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
  page_category: 'PPID',

  page_title: 'Informasi Berkala',
  page_description: 'Daftar Laporan dan Informasi Publik yang Wajib Disediakan dan Diumumkan secara Berkala',
  heading: 'Berkas Informasi Berkala',
  report1_title: 'Laporan Keuangan Diskominfo PPU 2023', report1_size: '2.4 MB', report1_date: 'Maret 2024',
  report2_title: 'Laporan Akuntabilitas Kinerja Instansi Pemerintah (LAKIP) 2023', report2_size: '4.8 MB', report2_date: 'Maret 2024',
  report3_title: 'Dokumen Pelaksanaan Anggaran (DPA) Diskominfo PPU 2024', report3_size: '5.2 MB', report3_date: 'Januari 2024',
  report4_title: 'Rencana Strategis (Renstra) Diskominfo PPU 2023-2026', report4_size: '8.1 MB', report4_date: 'Agustus 2023',
  report5_title: 'Rencana Kerja (Renja) Diskominfo PPU 2024', report5_size: '3.6 MB', report5_date: 'Desember 2023',
};

export default function PPIDInformasiBerkalaPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'ppid-informasi-berkala',
    defaultFields: DEFAULTS,
  });

  const reportCount = Object.keys(fields).filter(k => k.match(/^report\d+_title$/)).length;

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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <EditableText value={fields.heading} onChange={(v) => updateField('heading', v)} as="h2" className="text-2xl font-bold text-gray-900 border-b pb-4" />
            <div className="space-y-4">
              {Array.from({ length: reportCount }, (_, i) => i + 1).map((n) => (
                <div key={n} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex gap-3 items-center">
                    <FileText className="w-6 h-6 text-gray-400 shrink-0" />
                    <div>
                      <EditableText value={fields[`report${n}_title`]} onChange={(v) => updateField(`report${n}_title`, v)} as="h3" className="font-semibold text-gray-900 text-sm" />
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tanggal: <EditableText value={fields[`report${n}_date`]} onChange={(v) => updateField(`report${n}_date`, v)} as="span" className="text-gray-500" /> | Ukuran: <EditableText value={fields[`report${n}_size`]} onChange={(v) => updateField(`report${n}_size`, v)} as="span" className="text-gray-500" />
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
