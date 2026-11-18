"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion } from 'framer-motion';
import { Briefcase, Settings, Plus, Trash2 } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Profil',

  page_title: 'Tugas Pokok & Fungsi',
  page_description: 'Uraian Tugas Pokok dan Fungsi Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara',
  tugas_title: 'Tugas Pokok Dinas',
  tugas_content: 'Dinas Komunikasi dan Informatika mempunyai tugas melaksanakan urusan pemerintahan daerah di bidang komunikasi, informatika, statistik, dan persandian berdasarkan asas otonomi dan tugas pembantuan.',
  fungsi_title: 'Fungsi Dinas',
  fungsi_1: 'Perumusan kebijakan teknis di bidang komunikasi, informatika, statistik, dan persandian sesuai rencana strategis kabupaten.',
  fungsi_2: 'Penyelenggaraan pelayanan umum, pembinaan, dan koordinasi pelaksanaan tugas di bidang informasi publik, teknologi komunikasi, serta persandian.',
  fungsi_3: 'Pengembangan aplikasi informatika dan implementasi e-government/SPBE secara terintegrasi.',
  fungsi_4: 'Pengelolaan dan pemeliharaan infrastruktur jaringan internet, intranet, serta pusat data pemerintah daerah.',
  fungsi_5: 'Penyelenggaraan urusan persandian dan keamanan informasi siber pemerintah kabupaten.',
  fungsi_6: 'Penyelenggaraan urusan statistik sektoral untuk mendukung Satu Data Indonesia di tingkat kabupaten.',
};

export default function TupoksiPage() {
  const { fields, updateField, addField, removeField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'tupoksi',
    defaultFields: DEFAULTS,
  });

  const fungsiKeys = Object.keys(fields).filter(k => k.startsWith('fungsi_') && k !== 'fungsi_title').sort();

  const handleAddFungsi = () => {
    // Find the next available number
    let nextNum = 1;
    while (fields[`fungsi_${nextNum}`] !== undefined) {
      nextNum++;
    }
    addField(`fungsi_${nextNum}`, 'Poin fungsi baru — klik untuk mengedit.');
  };

  const handleRemoveFungsi = (key: string) => {
    removeField(key);
  };

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
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Tugas Pokok */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shadow-lg shrink-0">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <EditableText
                value={fields.tugas_title}
                onChange={(v) => updateField('tugas_title', v)}
                as="h2"
                className="text-2xl font-bold text-gray-900"
              />
            </div>
            <EditableText
              value={fields.tugas_content}
              onChange={(v) => updateField('tugas_content', v)}
              as="p"
              multiline
              className="text-gray-700 leading-relaxed text-lg"
            />
          </Card>
        </motion.div>

        {/* Fungsi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shadow-lg shrink-0">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <EditableText
                value={fields.fungsi_title}
                onChange={(v) => updateField('fungsi_title', v)}
                as="h2"
                className="text-2xl font-bold text-gray-900"
              />
            </div>
            <div className="space-y-3 pl-2">
              {fungsiKeys.map((key) => (
                <div key={key} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1E6F3D] shrink-0 mt-2.5" />
                  <EditableText
                    value={fields[key]}
                    onChange={(v) => updateField(key, v)}
                    as="p"
                    multiline
                    className="text-gray-700 leading-relaxed flex-1"
                  />
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveFungsi(key)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 shrink-0 mt-0.5 cursor-pointer"
                      title="Hapus poin ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new fungsi button — only visible to admin */}
            {isAdmin && (
              <button
                onClick={handleAddFungsi}
                className="flex items-center gap-2 text-sm text-[#1E6F3D] font-medium hover:bg-[#1E6F3D]/5 px-4 py-2.5 rounded-xl transition-colors cursor-pointer border border-dashed border-[#1E6F3D]/30 hover:border-[#1E6F3D]/60 w-full justify-center mt-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Poin Fungsi Baru
              </button>
            )}
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
