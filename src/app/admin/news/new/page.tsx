"use client";

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { 
  ArrowLeft, Save, Loader2, Eye, CheckCircle2, XCircle, 
  Upload, AlertCircle, FileText, Globe, Clock, Tag,
  Maximize2, Minimize2, X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const RichTextEditor = lazy(() => import('@/frontend/components/ui/rich-text-editor'));

interface QualityCheck {
  label: string;
  passed: boolean;
  hint: string;
  weight: 'critical' | 'important' | 'nice';
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getQualityChecks(title: string, content: string, image: string, author: string, tags: string[]): QualityCheck[] {
  const plainText = stripHtmlTags(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const hasHeading = /<h[2-4][^>]*>/i.test(content);
  const hasImage = /<img[^>]*>/i.test(content) || image.trim().length > 0;
  const titleLen = title.trim().length;
  
  return [
    {
      label: 'Judul cukup deskriptif (min. 15 karakter)',
      passed: titleLen >= 15,
      hint: titleLen < 15 ? `${titleLen}/15 karakter` : 'Judul sudah baik',
      weight: 'critical',
    },
    {
      label: 'Panjang judul ideal untuk SEO (50-60 karakter)',
      passed: titleLen >= 40 && titleLen <= 70,
      hint: titleLen < 40 ? `Terlalu pendek (${titleLen} karakter)` : titleLen > 70 ? `Terlalu panjang (${titleLen} karakter)` : `${titleLen} karakter — optimal`,
      weight: 'important',
    },
    {
      label: 'Gambar banner tersedia',
      passed: image.trim().length > 0,
      hint: image.trim().length === 0 ? 'Akan menggunakan gambar default' : 'Gambar sudah terpasang',
      weight: 'important',
    },
    {
      label: 'Konten cukup panjang (min. 30 kata)',
      passed: wordCount >= 30,
      hint: wordCount < 30 ? `${wordCount}/30 kata` : `${wordCount} kata — cukup`,
      weight: 'critical',
    },
    {
      label: 'Konten memiliki sub-heading (H2/H3/H4)',
      passed: hasHeading,
      hint: hasHeading ? 'Struktur heading sudah baik' : 'Tambahkan sub-heading untuk keterbacaan',
      weight: 'nice',
    },
    {
      label: 'Konten memiliki gambar inline',
      passed: /<img[^>]*>/i.test(content),
      hint: /<img[^>]*>/i.test(content) ? 'Gambar dalam konten sudah ada' : 'Gambar memperkaya artikel',
      weight: 'nice',
    },
    {
      label: 'Penulis tercantum',
      passed: author.trim().length > 0,
      hint: author.trim().length === 0 ? 'Nama penulis kosong' : `Penulis: ${author}`,
      weight: 'critical',
    },
    {
      label: 'Tags / label ditambahkan',
      passed: tags.length > 0,
      hint: tags.length === 0 ? 'Tambahkan tag untuk kategorisasi' : `${tags.length} tag`,
      weight: 'nice',
    },
  ];
}

// =================== TAGS INPUT COMPONENT ===================
function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const cleaned = tag.trim().toUpperCase();
    if (cleaned && !tags.includes(cleaned)) {
      onChange([...tags, cleaned]);
    }
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="tags-input-wrapper" onClick={() => inputRef.current?.focus()}>
      {tags.map((tag, idx) => (
        <div key={idx} className="tag-chip">
          {tag}
          <button type="button" onClick={() => removeTag(idx)} title="Hapus tag">×</button>
        </div>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
        placeholder={tags.length === 0 ? "Ketik tag, tekan Enter..." : "Tambah tag..."}
      />
    </div>
  );
}

// =================== AUTO-SAVE INDICATOR ===================
function AutoSaveIndicator({ lastSaved }: { lastSaved: Date | null }) {
  if (!lastSaved) return null;
  
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>Draft tersimpan {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
}

// =================== MAIN COMPONENT ===================
export default function NewNewsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('BERITA TERKINI');
  const [image, setImage] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Auto-save key
  const AUTOSAVE_KEY = 'news-draft-new';

  // Fetch current logged in user display name
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.name) {
          setCurrentUserName(data.user.name);
          setAuthor(data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  // Load auto-saved draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title || draft.content) {
          setTitle(draft.title || '');
          setContent(draft.content || '');
          setCategory(draft.category || 'BERITA TERKINI');
          setImage(draft.image || '');
          setAuthor(draft.author || '');
          setTags(draft.tags || []);
          setLastAutoSaved(new Date(draft.savedAt));
          toast.info('Draft sebelumnya berhasil dimuat', { duration: 3000 });
        }
      }
    } catch {}
  }, []);

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title.trim() || stripHtmlTags(content).trim()) {
        const draft = { title, content, category, image, author, tags, savedAt: new Date().toISOString() };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
        setLastAutoSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [title, content, category, image, author, tags]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [title, content, category, image, author, tags]);

  // Sync to preview localStorage
  useEffect(() => {
    const previewData = {
      title,
      content,
      category,
      tags,
      image: image.trim() || 'https://diskominfo.penajamkab.go.id/wp-content/uploads/2023/02/BANNER-KOMINFO.jpg',
      author: author || 'Humas Diskominfo',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('news_preview_data', JSON.stringify(previewData));
  }, [title, content, category, tags, image, author]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && (title.trim() || stripHtmlTags(content).trim())) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, title, content]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah gambar');

      setImage(data.url);
      toast.success('Gambar sampul utama berhasil diunggah!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent, status: 'published' | 'draft' = 'published') => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Auto-generate excerpt from plain text content (strip HTML)
    const plainText = stripHtmlTags(content);
    const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    const payload = {
      title: title.trim(),
      excerpt,
      content: content.trim(),
      category: category.trim(),
      image: image.trim(),
      author: author.trim(),
      status,
      tags: tags.join(','),
    };

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan berita');
      }

      // Clear auto-save
      localStorage.removeItem(AUTOSAVE_KEY);
      setHasUnsavedChanges(false);

      if (status === 'draft') {
        toast.success('Berita disimpan sebagai draft!');
      } else {
        toast.success('Berita baru berhasil diterbitkan!');
      }
      router.push('/admin/news');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setTitle('');
    setContent('');
    setCategory('BERITA TERKINI');
    setImage('');
    setAuthor(currentUserName);
    setTags([]);
    setLastAutoSaved(null);
    toast.success('Draft berhasil dihapus');
  };

  const qualityChecks = getQualityChecks(title, content, image, author, tags);
  const passedChecks = qualityChecks.filter(c => c.passed).length;
  const totalChecks = qualityChecks.length;
  const criticalPassed = qualityChecks.filter(c => c.weight === 'critical' && c.passed).length;
  const criticalTotal = qualityChecks.filter(c => c.weight === 'critical').length;

  const previewImage = image.trim() || 'https://diskominfo.penajamkab.go.id/wp-content/uploads/2023/02/BANNER-KOMINFO.jpg';
  const previewDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const plainText = stripHtmlTags(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const isContentEmpty = !content || content === '<p></p>' || stripHtmlTags(content).trim().length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/news">
            <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Buat Berita Baru</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tulis dan terbitkan artikel berita ke portal utama</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              window.open('/admin/news/preview', '_blank');
            }}
            variant="outline"
            className="rounded-xl border-gray-200 text-gray-700 flex items-center gap-1.5 h-10 cursor-pointer hover:bg-gray-50 text-xs font-bold shadow-sm"
          >
            <Eye className="w-4 h-4" /> Preview Halaman
          </Button>
          <AutoSaveIndicator lastSaved={lastAutoSaved} />
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      {/* Auto-save recovery banner */}
      {lastAutoSaved && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] text-amber-700">
              Draft otomatis tersimpan pada {lastAutoSaved.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="text-[10px] font-bold text-amber-600 hover:text-red-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Hapus Draft
          </button>
        </div>
      )}

      {/* Full Width Form Container */}
      <div className="max-w-4xl mx-auto w-full">
        <Card className="p-6 border border-gray-200/60 shadow-sm bg-white rounded-2xl space-y-6">
          <form onSubmit={(e) => handleSave(e)} className="space-y-6">
            
            {/* STEP 1: IDENTITAS BERITA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-[#1E6F3D] text-white text-[11px] font-black flex items-center justify-center">1</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Identitas Berita</h3>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700">Judul Berita</label>
                  <span className={`text-[10px] font-bold ${title.trim().length >= 40 && title.trim().length <= 70 ? 'text-emerald-500' : title.trim().length > 70 ? 'text-red-500' : 'text-gray-400'}`}>
                    {title.trim().length} karakter
                  </span>
                </div>
                <Input
                  required
                  placeholder="Tulis judul berita yang menarik dan deskriptif..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl h-10 border-gray-200"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Kategori</label>
                  <Input
                    placeholder="Cth: BERITA TERKINI"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-xl h-10 border-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Penulis</label>
                  <Input
                    required
                    placeholder="Nama penulis berita"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="rounded-xl h-10 border-gray-200"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Tags / Label</label>
                  <Tag className="w-3 h-3 text-gray-400" />
                </div>
                <TagsInput tags={tags} onChange={setTags} />
                <p className="text-[10px] text-gray-400">Tekan Enter atau koma untuk menambahkan tag</p>
              </div>
            </div>

            {/* STEP 2: GAMBAR BANNER UTAMA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-[#1E6F3D] text-white text-[11px] font-black flex items-center justify-center">2</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Gambar Banner Utama</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-500">Gambar cover utama paling atas berita</span>
                  <div className="flex bg-gray-100 rounded-lg p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${uploadMode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${uploadMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                      Input URL
                    </button>
                  </div>
                </div>

                {uploadMode === 'upload' ? (
                  <div className="border border-dashed border-gray-200 hover:border-[#1E6F3D]/50 rounded-2xl p-5 transition-colors text-center bg-gray-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      id="banner-file-new"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="banner-file-new" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#1E6F3D]/10 flex items-center justify-center text-[#1E6F3D]">
                        {uploading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Upload className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800">Klik untuk upload gambar banner baru</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, atau WEBP</p>
                      </div>
                    </label>
                    {image && (
                      <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 text-left">
                        <img src={image} className="w-12 h-9 object-cover rounded-lg" alt="" />
                        <div className="overflow-hidden flex-1">
                          <p className="text-[10px] font-bold text-gray-800 truncate">{image}</p>
                          <span className="text-[9px] text-[#1E6F3D] font-bold">Terpilih</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setImage('')}
                          className="h-7 w-7 text-red-500 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    placeholder="Masukkan link/URL gambar..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="rounded-xl h-10 border-gray-200"
                  />
                )}
              </div>
            </div>

            {/* STEP 3: ISI KONTEN (Rich Text Editor) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1E6F3D] text-white text-[11px] font-black flex items-center justify-center">3</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Isi Konten Berita</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-[10px] text-gray-400 hover:text-[#1E6F3D] flex items-center gap-1 cursor-pointer font-bold transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  {isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    💡 Gunakan toolbar untuk format teks, sisipkan tabel, embed YouTube, dan tambahkan gambar. 
                    Ketik <kbd className="px-1 py-0.5 bg-blue-100 rounded text-[10px] font-mono font-bold">/</kbd> di baris baru untuk menu insert cepat.
                  </p>
                </div>

                <Suspense fallback={
                  <div className="border border-gray-200 rounded-xl bg-white overflow-hidden min-h-[350px] flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                }>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                  />
                </Suspense>

                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>Double-klik gambar untuk crop · Seret sudut gambar untuk resize</span>
                  <span>{wordCount} kata · ~{readingTime} menit baca</span>
                </div>
              </div>
            </div>

            {/* Quality Score */}
            <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cek Kualitas Artikel</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    criticalPassed === criticalTotal 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-red-50 text-red-500 border border-red-100'
                  }`}>
                    {criticalPassed}/{criticalTotal} wajib
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    passedChecks === totalChecks 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {passedChecks}/{totalChecks} total
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                {qualityChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${check.passed ? 'text-emerald-500' : check.weight === 'critical' ? 'text-red-300' : 'text-gray-300'}`} />
                    <span className={`${check.passed ? 'text-gray-700' : 'text-gray-400'} ${check.weight === 'critical' && !check.passed ? 'font-semibold' : ''}`}>
                      {check.label}
                      {check.weight === 'critical' && !check.passed && <span className="text-red-400 ml-1">*</span>}
                    </span>
                    <span className="text-gray-300 ml-auto text-[10px]">{check.hint}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-3 pt-3 border-t border-gray-100">
              <Link href="/admin/news">
                <Button type="button" variant="outline" className="rounded-xl cursor-pointer h-10">
                  Batal
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => handleSave(e, 'draft')}
                  disabled={saving || !title.trim() || isContentEmpty}
                  className="rounded-xl cursor-pointer flex items-center gap-1.5 h-10 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <FileText className="w-4 h-4" />
                  Simpan Draft
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !title.trim() || isContentEmpty}
                  className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] hover:shadow-lg text-white rounded-xl cursor-pointer flex items-center gap-1.5 h-10 min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" /> Publish Berita
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
