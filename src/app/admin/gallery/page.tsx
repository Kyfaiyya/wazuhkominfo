"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  Play,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Types ───
interface PhotoItem {
  src: string;
  title: string;
  category: string;
}

interface VideoItem {
  title: string;
  thumbnail: string;
  duration: string;
  date: string;
  href: string;
}

// ─── Toast ───
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ─── Main Page ───
export default function AdminGalleryPage() {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<number | null>(null);
  const [editingVideo, setEditingVideo] = useState<number | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.photos) setPhotos(data.photos);
      if (data.videos) setVideos(data.videos);
    } catch (err) {
      console.error(err);
      setToast({ message: "Gagal memuat data galeri", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Photo Operations ───
  const savePhotos = async (newPhotos: PhotoItem[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "photos", items: newPhotos }),
      });
      if (res.ok) {
        setPhotos(newPhotos);
        setToast({ message: "Foto berhasil disimpan", type: "success" });
      } else {
        throw new Error("Save failed");
      }
    } catch {
      setToast({ message: "Gagal menyimpan foto", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const addPhoto = () => {
    const newPhotos = [...photos, { src: "", title: "", category: "Kegiatan" }];
    setPhotos(newPhotos);
    setEditingPhoto(newPhotos.length - 1);
  };

  const deletePhoto = async (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    await savePhotos(newPhotos);
    if (editingPhoto === index) setEditingPhoto(null);
  };

  const movePhoto = (index: number, direction: "up" | "down") => {
    const newPhotos = [...photos];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newPhotos.length) return;
    [newPhotos[index], newPhotos[target]] = [newPhotos[target], newPhotos[index]];
    setPhotos(newPhotos);
  };

  const updatePhoto = (index: number, field: keyof PhotoItem, value: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], [field]: value };
    setPhotos(newPhotos);
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        updatePhoto(index, "src", data.url);
        setToast({ message: "Gambar berhasil diupload", type: "success" });
      }
    } catch {
      setToast({ message: "Gagal mengupload gambar", type: "error" });
    }
  };

  // ─── Video Operations ───
  const saveVideos = async (newVideos: VideoItem[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "videos", items: newVideos }),
      });
      if (res.ok) {
        setVideos(newVideos);
        setToast({ message: "Video berhasil disimpan", type: "success" });
      } else {
        throw new Error("Save failed");
      }
    } catch {
      setToast({ message: "Gagal menyimpan video", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const addVideo = () => {
    const newVideos = [...videos, { title: "", thumbnail: "", duration: "", date: new Date().getFullYear().toString(), href: "" }];
    setVideos(newVideos);
    setEditingVideo(newVideos.length - 1);
  };

  const deleteVideo = async (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    await saveVideos(newVideos);
    if (editingVideo === index) setEditingVideo(null);
  };

  const moveVideo = (index: number, direction: "up" | "down") => {
    const newVideos = [...videos];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newVideos.length) return;
    [newVideos[index], newVideos[target]] = [newVideos[target], newVideos[index]];
    setVideos(newVideos);
  };

  const updateVideo = (index: number, field: keyof VideoItem, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setVideos(newVideos);
  };

  const handleVideoThumbnailUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        updateVideo(index, "thumbnail", data.url);
        setToast({ message: "Thumbnail berhasil diupload", type: "success" });
      }
    } catch {
      setToast({ message: "Gagal mengupload thumbnail", type: "error" });
    }
  };

  // Extract YouTube video ID for thumbnail preview
  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-gray-400 text-sm">Memuat data galeri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kelola Galeri</h1>
              <p className="text-xs text-gray-400">Kelola foto dan video Diskominfo PPU</p>
            </div>
          </div>
          <a
            href="/admin"
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors"
          >
            ← Kembali ke Admin
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "photos"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <Camera className="w-4 h-4" />
            Foto ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "videos"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <Play className="w-4 h-4" />
            Video ({videos.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ─── Photos Tab ─── */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{photos.length} foto dalam galeri</p>
              <div className="flex gap-2">
                <button
                  onClick={addPhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Foto
                </button>
                <button
                  onClick={() => savePhotos(photos)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Semua"}
                </button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all group"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    {photo.src ? (
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/uploads/banner-kominfo.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <span className="text-xs">Belum ada gambar</span>
                      </div>
                    )}
                    {/* Overlay Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => movePhoto(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 bg-gray-900/80 hover:bg-gray-800 rounded-lg text-gray-300 disabled:opacity-30"
                        title="Pindah ke atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePhoto(index, "down")}
                        disabled={index === photos.length - 1}
                        className="p-1.5 bg-gray-900/80 hover:bg-gray-800 rounded-lg text-gray-300 disabled:opacity-30"
                        title="Pindah ke bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePhoto(index)}
                        className="p-1.5 bg-red-900/80 hover:bg-red-800 rounded-lg text-red-300"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Index Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-xs text-gray-300 font-mono">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="p-3 space-y-2">
                    {editingPhoto === index ? (
                      <>
                        <input
                          type="text"
                          value={photo.title}
                          onChange={(e) => updatePhoto(index, "title", e.target.value)}
                          placeholder="Judul foto..."
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={photo.category}
                          onChange={(e) => updatePhoto(index, "category", e.target.value)}
                          placeholder="Kategori..."
                          className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={photo.src}
                            onChange={(e) => updatePhoto(index, "src", e.target.value)}
                            placeholder="URL gambar atau upload..."
                            className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                          />
                          <label className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handlePhotoUpload(index, e.target.files[0]);
                              }}
                            />
                          </label>
                        </div>
                        <button
                          onClick={() => setEditingPhoto(null)}
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Selesai edit
                        </button>
                      </>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => setEditingPhoto(index)}
                      >
                        <h4 className="text-sm font-medium text-white truncate">
                          {photo.title || <span className="text-gray-500 italic">Tanpa judul</span>}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">
                            {photo.category || "Uncategorized"}
                          </span>
                          <Edit3 className="w-3.5 h-3.5 text-gray-500 hover:text-blue-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Card */}
              <button
                onClick={addPhoto}
                className="flex flex-col items-center justify-center aspect-video bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group min-h-[200px]"
              >
                <Plus className="w-8 h-8 text-gray-600 group-hover:text-blue-400 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-blue-400 mt-2 transition-colors">
                  Tambah Foto Baru
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Videos Tab ─── */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{videos.length} video dalam galeri</p>
              <div className="flex gap-2">
                <button
                  onClick={addVideo}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Video
                </button>
                <button
                  onClick={() => saveVideos(videos)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Semua"}
                </button>
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-red-500/30 transition-all group"
                >
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="relative w-48 min-h-[120px] bg-gray-900 flex-shrink-0 overflow-hidden">
                      {video.thumbnail || video.href ? (
                        <img
                          src={video.thumbnail || getYoutubeThumbnail(video.href)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/uploads/banner-kominfo.jpg";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-600">
                          <Play className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-10 h-10 bg-red-600/80 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white font-mono">
                          {video.duration}
                        </span>
                      )}
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-gray-300 font-mono">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      {editingVideo === index ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={video.title}
                            onChange={(e) => updateVideo(index, "title", e.target.value)}
                            placeholder="Judul video..."
                            className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={video.href}
                            onChange={(e) => updateVideo(index, "href", e.target.value)}
                            placeholder="YouTube URL (misal: https://youtube.com/watch?v=...)"
                            className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={video.duration}
                              onChange={(e) => updateVideo(index, "duration", e.target.value)}
                              placeholder="Durasi (5:30)"
                              className="w-24 px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={video.date}
                              onChange={(e) => updateVideo(index, "date", e.target.value)}
                              placeholder="Tahun"
                              className="w-20 px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                            />
                            <label className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 text-xs cursor-pointer transition-colors">
                              <Upload className="w-3 h-3" /> Thumb
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleVideoThumbnailUpload(index, e.target.files[0]);
                                }}
                              />
                            </label>
                          </div>
                          <button
                            onClick={() => setEditingVideo(null)}
                            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Selesai edit
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h4
                              className="text-sm font-medium text-white line-clamp-2 cursor-pointer hover:text-red-400 transition-colors"
                              onClick={() => setEditingVideo(index)}
                            >
                              {video.title || <span className="text-gray-500 italic">Tanpa judul</span>}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{video.date}</p>
                            {video.href && (
                              <a
                                href={video.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-red-400/70 hover:text-red-400 mt-1 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                YouTube
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <button onClick={() => setEditingVideo(index)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Edit">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => moveVideo(index, "up")} disabled={index === 0} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors" title="Pindah ke atas">
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => moveVideo(index, "down")} disabled={index === videos.length - 1} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors" title="Pindah ke bawah">
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteVideo(index)} className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Card */}
              <button
                onClick={addVideo}
                className="flex items-center justify-center min-h-[120px] bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center">
                  <Plus className="w-8 h-8 text-gray-600 group-hover:text-red-400 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-red-400 mt-2 transition-colors">
                    Tambah Video Baru
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
