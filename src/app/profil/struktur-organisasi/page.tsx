"use client";

import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Plus, Trash2 } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";

const DEFAULTS = {
  page_category: 'Profil',

  page_title: 'Struktur Organisasi',
  page_description: 'Bagan Struktur Organisasi Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara',
  bagan_heading: 'Bagan Struktur Dinamis',
  tahun_label: 'Tahun 2026',
  kepala_jabatan: 'Kepala Dinas',
  kepala_nama: 'Plt. Eko Setiawan, S.H., M.H.',
  sekretariat_label: 'Sekretariat',
  sekretariat_nama: 'Sekretaris Dinas',
  
  // Dynamic fields
  'bidang_1_label': 'Bidang IKP',
  'bidang_1_nama': 'Informasi Komunikasi Publik',
  'bidang_1_seksi_1': 'Seksi Hubungan Media & Kemitraan',
  
  'bidang_2_label': 'Bidang Aplikasi',
  'bidang_2_nama': 'Aplikasi Informatika (Aptika)',
  'bidang_2_seksi_1': 'Seksi Tata Kelola SPBE & E-Gov',
  
  'bidang_3_label': 'Bidang TIK & Sandi',
  'bidang_3_nama': 'Infrastruktur & Persandian',
  'bidang_3_seksi_1': 'Seksi Internet Desa & Siber',
  
  unduh_heading: 'Unduh Bagan Resmi',
  unduh_desc: 'Anda dapat mendownload dokumen struktur organisasi resmi Diskominfo PPU dalam format PDF resolusi tinggi.',
  unduh_url: '#',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

const gridColsClassMap: Record<number, string> = {
  1: "md:grid-cols-1 max-w-sm",
  2: "md:grid-cols-2 max-w-2xl",
  3: "md:grid-cols-3 max-w-4xl",
  4: "md:grid-cols-4 max-w-5xl",
  5: "md:grid-cols-5 max-w-6xl",
};

export default function StrukturOrganisasiPage() {
  const { fields, updateField, addField, removeField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'struktur-organisasi',
    defaultFields: DEFAULTS,
  });

  // Extract unique Bidang IDs (supports both new 'bidang_X_' and old 'bidangX_' formats)
  const bidangIdsSet = new Set<string>();
  Object.keys(fields).forEach(key => {
    const match = key.match(/^bidang_?([0-9]+)_label$/);
    if (match) {
      bidangIdsSet.add(match[1]);
    }
  });
  const bidangIds = Array.from(bidangIdsSet).sort((a, b) => Number(a) - Number(b));

  // Extract Seksi keys for a given Bidang ID
  const getSeksiKeys = (bidangId: string) => {
    const seksiKeysSet = new Set<string>();
    
    // Support old style single seksi
    const oldSeksiKey = `bidang${bidangId}_seksi`;
    if (fields[oldSeksiKey] !== undefined) {
      seksiKeysSet.add(oldSeksiKey);
    }

    // New style multiple seksi
    Object.keys(fields).forEach(key => {
      const regex = new RegExp(`^bidang_?${bidangId}_seksi_?([0-9]+)$`);
      if (regex.test(key)) {
        seksiKeysSet.add(key);
      }
    });

    return Array.from(seksiKeysSet).sort((a, b) => {
      const numA = a.match(/\d+$/)?.[0];
      const numB = b.match(/\d+$/)?.[0];
      return Number(numA || 0) - Number(numB || 0);
    });
  };

  // CRUD handlers
  const handleAddBidang = () => {
    let nextId = 1;
    while (
      fields[`bidang_${nextId}_label`] !== undefined ||
      fields[`bidang${nextId}_label`] !== undefined
    ) {
      nextId++;
    }
    
    addField(`bidang_${nextId}_label`, 'Bidang Baru');
    addField(`bidang_${nextId}_nama`, 'Nama Bidang Baru');
    addField(`bidang_${nextId}_seksi_1`, 'Seksi Pertama');
  };

  const handleRemoveBidang = (bidangId: string) => {
    const keysToDelete = Object.keys(fields).filter(
      key => key.startsWith(`bidang_${bidangId}_`) || key.startsWith(`bidang${bidangId}_`)
    );
    keysToDelete.forEach(key => removeField(key));
  };

  const handleAddSeksi = (bidangId: string) => {
    let nextSeksiId = 1;
    while (
      fields[`bidang_${bidangId}_seksi_${nextSeksiId}`] !== undefined ||
      fields[`bidang${bidangId}_seksi_${nextSeksiId}`] !== undefined
    ) {
      nextSeksiId++;
    }
    addField(`bidang_${bidangId}_seksi_${nextSeksiId}`, 'Seksi Baru');
  };

  const handleRemoveSeksi = (seksiKey: string) => {
    removeField(seksiKey);
  };

  const gridClass = gridColsClassMap[bidangIds.length] || "md:grid-cols-3 max-w-4xl";
  const percentSpan = bidangIds.length > 1 ? 100 / (2 * bidangIds.length) : 0;

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
      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <Network className="w-8 h-8 text-[#1E6F3D]" />
                <EditableText value={fields.bagan_heading} onChange={(v) => updateField('bagan_heading', v)} as="h2" className="text-2xl font-bold text-gray-900" />
              </div>
              <EditableText value={fields.tahun_label} onChange={(v) => updateField('tahun_label', v)} as="span" className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full" />
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center py-6"
            >
              {/* Level 1: Kepala Dinas */}
              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-[#0a3d1f] to-[#1E6F3D] text-white p-4 rounded-xl shadow-lg w-64 text-center hover:scale-105 transition-transform duration-300">
                  <EditableText value={fields.kepala_jabatan} onChange={(v) => updateField('kepala_jabatan', v)} as="div" className="text-xs text-yellow-300 font-bold uppercase tracking-wider mb-1" />
                  <EditableText value={fields.kepala_nama} onChange={(v) => updateField('kepala_nama', v)} as="div" className="font-bold text-sm text-white" />
                </div>
                <div className="w-0.5 h-8 bg-gray-300" />
              </motion.div>

              {/* Level 2: Sekretariat */}
              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="bg-gray-800 text-white p-4 rounded-xl shadow-md w-60 text-center hover:scale-105 transition-transform duration-300">
                  <EditableText value={fields.sekretariat_label} onChange={(v) => updateField('sekretariat_label', v)} as="div" className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-1" />
                  <EditableText value={fields.sekretariat_nama} onChange={(v) => updateField('sekretariat_nama', v)} as="div" className="font-semibold text-sm text-white" />
                </div>
                <div className="w-0.5 h-8 bg-gray-300" />
              </motion.div>

              {/* Level 3: Bidang-Bidang */}
              <div className="relative w-full flex flex-col items-center pt-6">
                {/* Horizontal connection line for desktop */}
                {bidangIds.length > 1 && (
                  <div 
                    className="hidden md:block absolute top-0 h-0.5 bg-gray-300"
                    style={{
                      left: `${percentSpan}%`,
                      right: `${percentSpan}%`,
                    }}
                  />
                )}
                
                <div className={`grid grid-cols-1 ${gridClass} gap-8 w-full justify-items-center`}>
                  {bidangIds.map((bidangId, index) => {
                    const labelKey = fields[`bidang_${bidangId}_label`] !== undefined ? `bidang_${bidangId}_label` : `bidang${bidangId}_label`;
                    const namaKey = fields[`bidang_${bidangId}_nama`] !== undefined ? `bidang_${bidangId}_nama` : `bidang${bidangId}_nama`;
                    const seksiKeys = getSeksiKeys(bidangId);

                    return (
                      <motion.div 
                        variants={itemVariants} 
                        key={bidangId} 
                        className="flex flex-col items-center w-full"
                      >
                        {/* Desktop connector line down from horizontal distributor */}
                        <div className="hidden md:block w-0.5 h-6 bg-gray-300" />
                        
                        {/* Mobile connector */}
                        {index > 0 && <div className="block md:hidden w-0.5 h-8 bg-gray-300" />}

                        {/* Bidang Card */}
                        <div className="bg-white border-2 border-[#1E6F3D]/25 p-5 rounded-xl shadow-sm w-full text-center hover:border-[#1E6F3D] hover:shadow-md transition-all duration-300 relative group/bidang">
                          {isAdmin && bidangIds.length > 1 && (
                            <button
                              onClick={() => handleRemoveBidang(bidangId)}
                              className="absolute top-2 right-2 opacity-0 group-hover/bidang:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                              title="Hapus Bidang ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <EditableText value={fields[labelKey]} onChange={(v) => updateField(labelKey, v)} as="div" className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1" />
                          <EditableText value={fields[namaKey]} onChange={(v) => updateField(namaKey, v)} as="div" className="font-bold text-sm text-[#1E6F3D]" />
                          
                          {/* Seksi list in Bidang */}
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                            {seksiKeys.map((seksiKey) => (
                              <div key={seksiKey} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 group/seksi relative">
                                <div className="text-center w-full pr-6 pl-2">
                                  <EditableText value={fields[seksiKey]} onChange={(v) => updateField(seksiKey, v)} as="div" className="text-xs text-gray-700 leading-normal" />
                                </div>
                                {isAdmin && seksiKeys.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveSeksi(seksiKey)}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/seksi:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-100/50 text-gray-400 hover:text-red-500 cursor-pointer"
                                    title="Hapus seksi ini"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            
                            {/* Add seksi button */}
                            {isAdmin && (
                              <button
                                onClick={() => handleAddSeksi(bidangId)}
                                className="flex items-center justify-center gap-1.5 text-[10px] text-[#1E6F3D] font-bold hover:bg-[#1E6F3D]/5 py-1.5 rounded-lg border border-dashed border-[#1E6F3D]/20 hover:border-[#1E6F3D]/40 w-full cursor-pointer transition-colors"
                              >
                                <Plus className="w-3 h-3" /> Tambah Seksi
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Add Bidang Button at bottom of bagan */}
              {isAdmin && (
                <motion.div variants={itemVariants} className="mt-8">
                  <button
                    onClick={handleAddBidang}
                    className="flex items-center gap-2 text-sm text-[#1E6F3D] font-bold hover:bg-[#1E6F3D]/5 px-6 py-3 rounded-xl border-2 border-dashed border-[#1E6F3D]/30 hover:border-[#1E6F3D]/60 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Tambah Bidang Organisasi Baru
                  </button>
                </motion.div>
              )}
            </motion.div>

            <div className="bg-gray-50 p-6 rounded-2xl border text-center space-y-3">
              <EditableText value={fields.unduh_heading} onChange={(v) => updateField('unduh_heading', v)} as="h3" className="font-bold text-gray-900" />
              <EditableText value={fields.unduh_desc} onChange={(v) => updateField('unduh_desc', v)} as="p" multiline className="text-sm text-gray-600" />
              
              {isAdmin ? (
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center max-w-md mx-auto pt-2">
                  <span className="text-xs text-gray-500 font-medium shrink-0">Link Download PDF:</span>
                  <input
                    type="text"
                    value={fields.unduh_url || "#"}
                    onChange={(e) => updateField('unduh_url', e.target.value)}
                    placeholder="URL file PDF (misal: /uploads/struktur.pdf)..."
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs w-full focus:outline-none focus:border-[#1E6F3D]"
                  />
                </div>
              ) : (
                <a 
                  href={fields.unduh_url || "#"} 
                  className="inline-flex items-center gap-1.5 text-sm text-[#1E6F3D] font-bold hover:underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Download PDF Struktur
                </a>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
      {isAdmin && (
        <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />
      )}
    </div>
  );
}
