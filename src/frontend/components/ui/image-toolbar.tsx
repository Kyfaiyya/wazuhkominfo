"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface ImageToolbarProps {
  alignment: string;
  width: string;
  onAlignChange: (align: string) => void;
  onWidthChange: (width: string) => void;
  onDelete: () => void;
}

export function ImageToolbar({
  alignment,
  width,
  onAlignChange,
  onWidthChange,
  onDelete,
}: ImageToolbarProps) {
  const alignments = [
    { value: "left", label: "Float Kiri" },
    { value: "right", label: "Float Kanan" },
    { value: "center", label: "Tengah" },
    { value: "left-block", label: "Kiri" },
    { value: "inline", label: "Berdampingan" },
  ];

  const widths = ["25%", "50%", "75%", "100%"];

  return (
    <div 
      className="absolute bottom-[102%] left-1/2 -translate-x-1/2 mb-2 z-[99] bg-white/95 backdrop-blur border border-gray-200/80 shadow-xl rounded-xl p-2 flex flex-col md:flex-row items-center gap-2 whitespace-nowrap select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
      onClick={(e) => {
        // Prevent click events inside the toolbar from triggering ProseMirror bubble menus or deselecting the node
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Crucial: prevent editor from losing selection when clicking buttons
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Layout:
        </span>
        <div className="flex items-center gap-0.5 bg-gray-50/50 border border-gray-100 rounded-lg p-0.5">
          {alignments.map((align) => {
            const isActive = alignment === align.value || (align.value === "center" && !alignment);
            return (
              <button
                key={align.value}
                type="button"
                onClick={() => onAlignChange(align.value)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                {align.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block w-px h-6 bg-gray-200 mx-1" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Ukuran:
        </span>
        <div className="flex items-center gap-0.5 bg-gray-50/50 border border-gray-100 rounded-lg p-0.5">
          {widths.map((w) => {
            const isActive = width === w || (w === "100%" && !width);
            return (
              <button
                key={w}
                type="button"
                onClick={() => onWidthChange(w)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block w-px h-6 bg-gray-200 mx-1" />

      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-1 px-2.5 py-1 text-red-500 hover:text-red-700 hover:bg-red-50/80 rounded-lg border border-red-100 bg-white transition-all cursor-pointer shadow-sm text-[11px] font-bold"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
        Hapus
      </button>
    </div>
  );
}
