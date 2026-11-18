"use client";

import { use, useState, useRef } from 'react';
import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { motion } from 'framer-motion';
import { BookOpen, Heading2, Heading3, Bold, List, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useInlineEdit } from "@/frontend/components/shared/use-inline-edit";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";
import { useAuth } from "@/frontend/components/shared/auth-context";

const DYNAMIC_PAGE_DEFAULTS = {
  page_category: 'Profil',

  page_title: 'Halaman Baru',
  page_description: 'Deskripsi halaman baru ini. Aktifkan Mode Edit untuk menyesuaikan isi konten.',
  content_heading: 'Detail Informasi',
  content_body: '## Selamat Datang\n\nIni adalah halaman baru yang dibuat secara dinamis.\n\n### Cara Mengedit:\n- Aktifkan **Mode Edit** di bilah administrator atas.\n- Gunakan toolbar editor di bawah untuk menambahkan **Headline**, **Subheadline**, **Teks Tebal**, atau **Daftar Bulat**.\n- Anda juga dapat langsung mengunggah gambar dari komputer Anda dengan mengeklik tombol **Tambah Gambar**.',
};

interface ListLine {
  text: string;
  indent: number;
}

function parseList(blockText: string, blockIdx: number) {
  const lines = blockText.split(/\n/);
  const listItems: ListLine[] = [];

  for (const line of lines) {
    const match = line.match(/^(\s*)([-*])\s*(.*)$/);
    if (match) {
      listItems.push({
        indent: match[1].length,
        text: match[3]
      });
    } else {
      if (listItems.length > 0) {
        listItems[listItems.length - 1].text += ' ' + line.trim();
      }
    }
  }

  const renderListItems = (startIndex: number, currentIndent: number): { elements: React.ReactNode[]; nextIndex: number } => {
    const elements: React.ReactNode[] = [];
    let i = startIndex;

    while (i < listItems.length) {
      const item = listItems[i];

      if (item.indent > currentIndent) {
        const { elements: nestedElements, nextIndex } = renderListItems(i, item.indent);
        if (elements.length > 0) {
          const lastIndex = elements.length - 1;
          const lastEl = elements[lastIndex] as React.ReactElement;
          elements[lastIndex] = (
            <li key={lastEl.key} className="space-y-1">
              <span dangerouslySetInnerHTML={{ __html: (lastEl.props as any).dangerouslySetInnerHTML?.__html || '' }} />
              <ul className="list-[circle] pl-6 space-y-1.5 mt-1 text-gray-500 text-sm">
                {nestedElements}
              </ul>
            </li>
          );
        }
        i = nextIndex;
      } else if (item.indent < currentIndent) {
        break;
      } else {
        let html = item.text;
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        elements.push(
          <li key={i} dangerouslySetInnerHTML={{ __html: html }} />
        );
        i++;
      }
    }

    return { elements, nextIndex: i };
  };

  const { elements } = renderListItems(0, listItems[0]?.indent || 0);

  return (
    <ul key={blockIdx} className="list-disc pl-6 space-y-1.5 my-4 text-gray-700 text-base">
      {elements}
    </ul>
  );
}

function parseMarkdown(md: string) {
  if (!md) return null;
  
  const blocks = md.split(/\n\s*\n/);
  
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Headers
    if (trimmed.startsWith('# ')) {
      return <h1 key={idx} className="text-3xl font-extrabold text-gray-900 mt-6 mb-4">{trimmed.slice(2)}</h1>;
    }
    if (trimmed.startsWith('## ')) {
      return <h2 key={idx} className="text-2xl font-bold text-gray-900 mt-6 mb-3 border-b border-gray-100 pb-2">{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith('### ')) {
      return <h3 key={idx} className="text-xl font-bold text-gray-900 mt-5 mb-2">{trimmed.slice(4)}</h3>;
    }

    // Images: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      return (
        <div key={idx} className="my-6">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1]}
            className="rounded-xl shadow-lg max-h-[450px] w-full object-cover border border-gray-100"
          />
          {imgMatch[1] && (
            <p className="text-xs text-center text-gray-500 mt-2 italic">{imgMatch[1]}</p>
          )}
        </div>
      );
    }

    // Unordered lists (with optional indentation / nested lists)
    if (trimmed.match(/^(\s*)([-*])\s*/)) {
      return parseList(trimmed, idx);
    }

    // Normal paragraph
    const formattedText = trimmed.split('\n').map((line, lineIdx) => {
      let html = line;
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <span 
          key={lineIdx} 
          className="block"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });

    return (
      <p key={idx} className="text-gray-700 text-base leading-relaxed my-4">
        {formattedText}
      </p>
    );
  });
}

function RichMarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);
    
    const replacement = before + (selectedText || 'Teks') + after;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    
    onChange(newVal);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText || 'Teks').length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        insertText(`\n![${file.name.split('.')[0]}](${data.url})\n`);
      } else {
        alert(data.error || 'Gagal mengunggah gambar');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Editor Toolbar with Tabs */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'write'
                ? 'bg-[#1E6F3D] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            Tulis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#1E6F3D] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            Pratinjau
          </button>
        </div>

        {activeTab === 'write' && (
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => insertText('## ', '')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Headline 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('### ', '')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Subheadline 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => insertText('**', '**')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Teks Tebal"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('- ', '')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Daftar Bulat"
            >
              <List className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <label className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors cursor-pointer flex items-center gap-1.5">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#1E6F3D]" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              <span className="text-xs font-semibold text-gray-700">Tambah Gambar</span>
            </label>
          </div>
        )}
      </div>

      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[300px] p-4 text-sm text-gray-900 focus:outline-none resize-y leading-relaxed font-mono"
          placeholder="Tulis konten Anda di sini... Gunakan toolbar di atas untuk memformat teks atau mengunggah gambar."
        />
      ) : (
        <div className="p-6 min-h-[300px] bg-gray-50/20 border-t border-gray-100 prose max-w-none text-gray-700 leading-relaxed overflow-y-auto">
          {value.trim() ? (
            parseMarkdown(value)
          ) : (
            <p className="text-gray-400 italic">Belum ada konten untuk dipratinjau.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DynamicProfilPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { isEditMode } = useAuth();

  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: `profil-${slug}`,
    defaultFields: DYNAMIC_PAGE_DEFAULTS,
  });

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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <BookOpen className="w-48 h-48 text-[#1E6F3D]" />
            </div>
            <div className="space-y-6">
              <EditableText
                value={fields.content_heading}
                onChange={(v) => updateField('content_heading', v)}
                as="h2"
                className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3"
              />
              
              {isAdmin && isEditMode ? (
                <RichMarkdownEditor
                  value={fields.content_body}
                  onChange={(v) => updateField('content_body', v)}
                />
              ) : (
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {parseMarkdown(fields.content_body)}
                </div>
              )}
            </div>
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
