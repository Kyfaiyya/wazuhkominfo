"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { motion } from 'framer-motion';
import { Radio, MapPin } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Informasi',

  page_title: 'Menara Telekomunikasi',
  page_description: 'Peta sebaran dan monitoring menara BTS seluler di Kabupaten Penajam Paser Utara',
  heading: 'Data Menara BTS Seluler',
  description: 'Diskominfo PPU melakukan pengawasan dan pengendalian menara telekomunikasi secara berkala guna menjamin kelayakan struktur dan ketersediaan jangkauan sinyal (coverage) seluler di seluruh daerah.',
  tower1_name: 'BTS Penajam Kota', tower1_location: 'Kec. Penajam', tower1_provider: 'Telkomsel / Indosat', tower1_status: 'Aktif',
  tower2_name: 'BTS Nipah-nipah', tower2_location: 'Kec. Penajam', tower2_provider: 'XL Axiata / Smartfren', tower2_status: 'Aktif',
  tower3_name: 'BTS Waru', tower3_location: 'Kec. Waru', tower3_provider: 'Multi-Provider', tower3_status: 'Aktif',
  tower4_name: 'BTS Babulu', tower4_location: 'Kec. Babulu', tower4_provider: 'Telkomsel', tower4_status: 'Aktif',
  tower5_name: 'BTS Sepaku IKN', tower5_location: 'Kec. Sepaku', tower5_provider: 'All Providers', tower5_status: 'Aktif',
};

export default function MenaraTelekomunikasiPage() {
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'menara-telekomunikasi',
    defaultFields: DEFAULTS,
  });

  const towerCount = Object.keys(fields).filter(k => k.match(/^tower\d+_name$/)).length;

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
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-6">
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6 text-[#1E6F3D]" />
              <EditableText value={fields.heading} onChange={(v) => updateField('heading', v)} as="h2" className="text-2xl font-bold text-gray-900" />
            </div>
            <EditableText value={fields.description} onChange={(v) => updateField('description', v)} as="p" multiline className="text-gray-700 leading-relaxed" />
            <div className="space-y-4 pt-4">
              {Array.from({ length: towerCount }, (_, i) => i + 1).map((n) => (
                <div key={n} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-xl bg-gray-50 gap-4">
                  <div className="flex gap-3 items-center">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <EditableText value={fields[`tower${n}_name`]} onChange={(v) => updateField(`tower${n}_name`, v)} as="h3" className="font-bold text-gray-900 text-sm" />
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lokasi: <EditableText value={fields[`tower${n}_location`]} onChange={(v) => updateField(`tower${n}_location`, v)} as="span" className="text-gray-500" /> | Provider: <EditableText value={fields[`tower${n}_provider`]} onChange={(v) => updateField(`tower${n}_provider`, v)} as="span" className="text-gray-500" />
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                      <EditableText value={fields[`tower${n}_status`]} onChange={(v) => updateField(`tower${n}_status`, v)} as="span" className="text-green-700" />
                    </Badge>
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
