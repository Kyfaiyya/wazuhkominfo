"use client";

import { use, useState, useEffect } from 'react';
import { PageHeader } from "@/frontend/components/layout/page-header";
import { Card } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { EditableText } from "@/frontend/components/shared/editable-text";
import { InlineEditToolbar } from "@/frontend/components/shared/inline-edit-toolbar";
import { useAuth } from "@/frontend/components/shared/auth-context";
import { Bell, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  date: string;
  type: string;
  urgent: boolean;
  desc: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { isAdmin, isEditMode } = useAuth();

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [desc, setDesc] = useState('');
  const [urgent, setUrgent] = useState(false);

  // Available categories dynamic state
  const [availableTypes, setAvailableTypes] = useState<string[]>(['Pengumuman', 'Info Layanan', 'Agenda']);

  // Fetch unique categories on mount
  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const uniqueTypes = new Set(['Pengumuman', 'Info Layanan', 'Agenda']);
          data.forEach((ann) => {
            if (ann.type) {
              uniqueTypes.add(ann.type);
            }
          });
          setAvailableTypes(Array.from(uniqueTypes));
        }
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`/api/announcements?id=${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnnouncement(data);
      
      setTitle(data.title);
      setType(data.type);
      setDesc(data.desc);
      setUrgent(data.urgent);
    } catch (err) {
      toast.error("Gagal memuat pengumuman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const hasChanges = 
    announcement !== null &&
    (title !== announcement.title ||
     type !== announcement.type ||
     desc !== announcement.desc ||
     urgent !== announcement.urgent);

  const handleReset = () => {
    if (!announcement) return;
    setTitle(announcement.title);
    setType(announcement.type);
    setDesc(announcement.desc);
    setUrgent(announcement.urgent);
  };

  const handleSave = async () => {
    if (!announcement) return;
    setSaving(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: announcement.id,
          title: title.trim(),
          type: type.trim(),
          desc: desc.trim(),
          urgent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan');

      setAnnouncement(data.announcement);
      toast.success('Perubahan pengumuman berhasil disimpan!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1E6F3D]" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Memuat pengumuman...</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Pengumuman Tidak Ditemukan</h2>
        <p className="text-gray-500 mt-2">Halaman pengumuman yang Anda cari tidak dapat ditemukan.</p>
        <Link href="/informasi/pengumuman" className="text-sm font-bold text-[#1E6F3D] hover:underline mt-4 inline-block">
          &larr; Kembali ke Pengumuman
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={`Detail Pengumuman Resmi - ${type}`}
        category="Informasi"
        onTitleChange={isAdmin && isEditMode ? setTitle : undefined}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 sm:p-12 border border-gray-200/50 shadow-xl bg-white relative overflow-hidden">
          {/* Urgent Ribbon badge */}
          {urgent && (
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
              <div className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 absolute top-4 -right-6 w-24 rotate-45 shadow">
                Penting
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-[#F57C00]" />
                {announcement.date}
              </span>

              {isAdmin && isEditMode ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kategori:</span>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="text-xs font-bold px-2 py-0.5 bg-white border border-gray-200 text-gray-700 rounded-md outline-none focus:border-[#1E6F3D] cursor-pointer shadow-sm"
                    >
                      {availableTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Urgensi:</span>
                    <button
                      type="button"
                      onClick={() => setUrgent(!urgent)}
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                        urgent
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {urgent ? "Penting" : "Normal"}
                    </button>
                  </div>
                </div>
              ) : (
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                  {type}
                </Badge>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                urgent 
                  ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white'
                  : 'bg-gradient-to-br from-[#F57C00] to-[#FF9800] text-white'
              }`}>
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-4 flex-1">
                {isAdmin && isEditMode ? (
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Judul Pengumuman</label>
                    <EditableText
                      value={title}
                      onChange={setTitle}
                      as="h1"
                      className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                    {title}
                  </h1>
                )}
                
                {/* Description content */}
                {isAdmin && isEditMode ? (
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Isi Deskripsi Pengumuman</label>
                    <EditableText
                      value={desc}
                      onChange={setDesc}
                      multiline={true}
                      className="prose max-w-none text-gray-700 leading-relaxed text-base whitespace-pre-line min-h-[150px] p-2 border border-dashed border-gray-300 rounded"
                    />
                  </div>
                ) : (
                  <div className="prose max-w-none text-gray-700 leading-relaxed text-base whitespace-pre-line">
                    {desc}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-8 flex justify-between items-center">
              <Link 
                href="/informasi/pengumuman"
                className="text-xs font-bold text-[#1E6F3D] hover:text-[#2E8B57] flex items-center gap-1 transition-colors"
              >
                &larr; Kembali ke Pengumuman
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Save / Reset Toolbar at the bottom right */}
      {isAdmin && (
        <InlineEditToolbar
          hasChanges={hasChanges}
          saving={saving}
          onSave={handleSave}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
