"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion } from 'framer-motion';
import { Landmark, Compass, Award, ShieldAlert } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Profil',

  page_title: 'Organisasi Internal',
  page_description: 'Rincian Unit Kerja dan Bidang Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara',
  unit1_title: 'Sekretariat',
  unit1_desc: 'Sekretariat mempunyai tugas memberikan pelayanan administratif dan teknis kepada semua unsur di lingkungan dinas, meliputi penyusunan program, kepegawaian, keuangan, perlengkapan, dan umum.',
  unit2_title: 'Bidang Informasi Komunikasi Publik (IKP)',
  unit2_desc: 'Bidang IKP mempunyai tugas merumuskan dan melaksanakan kebijakan teknis, pembinaan, koordinasi, pemantauan, evaluasi dan pelaporan di bidang kemitraan media, pengelolaan opini publik, penyebaran informasi pembangunan daerah, serta PPID.',
  unit3_title: 'Bidang Aplikasi Informatika & E-Government',
  unit3_desc: 'Bidang Aplikasi Informatika & E-Gov mempunyai tugas merancang pembangunan sistem aplikasi kepemerintahan, pengawalan standardisasi arsitektur SPBE kabupaten, pengelolaan domain desa.id/go.id, integrasi database, dan pemeliharaan server.',
  unit4_title: 'Bidang Sumber Daya TIK & Persandian',
  unit4_desc: 'Bidang TIK & Sandi mempunyai tugas merancang penyebaran jaringan internet desa gratis, monitoring menara telekomunikasi BTS seluler, pengamanan data rahasia daerah melalui enkripsi, audit celah keamanan, dan penanganan insiden siber.',
};

const icons = [Landmark, Compass, Award, ShieldAlert];

export default function OrganisasiPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'organisasi',
    defaultFields: DEFAULTS,
  });

  const units = [
    { icon: icons[0], titleKey: 'unit1_title', descKey: 'unit1_desc' },
    { icon: icons[1], titleKey: 'unit2_title', descKey: 'unit2_desc' },
    { icon: icons[2], titleKey: 'unit3_title', descKey: 'unit3_desc' },
    { icon: icons[3], titleKey: 'unit4_title', descKey: 'unit4_desc' },
  ];

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
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {units.map((unit, index) => {
          const Icon = unit.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="p-8 border border-gray-200/50 shadow-lg bg-white flex flex-col sm:flex-row gap-6 items-start hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shadow-lg shrink-0">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-2">
                  <EditableText
                    value={fields[unit.titleKey]}
                    onChange={(v) => updateField(unit.titleKey, v)}
                    as="h3"
                    className="text-xl font-bold text-gray-900"
                  />
                  <EditableText
                    value={fields[unit.descKey]}
                    onChange={(v) => updateField(unit.descKey, v)}
                    as="p"
                    multiline
                    className="text-gray-600 leading-relaxed text-sm"
                  />
                </div>
              </Card>
            </motion.div>
          );
        })}
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
