"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export function PreviewBadge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("preview=true")) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-white/95 backdrop-blur-md border border-emerald-100 shadow-2xl p-4.5 rounded-2xl max-w-xs flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold text-gray-900">Mode Live Preview</span>
      </div>
      <p className="text-[10px] text-gray-500 leading-normal">
        Menampilkan perubahan sementara (belum disimpan ke database) pada halaman ini.
      </p>
      <button
        onClick={() => window.close()}
        className="w-full flex items-center justify-center gap-1.5 bg-[#1E6F3D] hover:bg-[#15522c] text-white font-bold rounded-xl text-xs h-9 cursor-pointer transition-all active:scale-[0.97]"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Tutup & Kembali
      </button>
    </div>
  );
}
