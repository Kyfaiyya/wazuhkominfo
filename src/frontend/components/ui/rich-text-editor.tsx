"use client";

import { useEditor, EditorContent, Editor, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import YoutubeExtension from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback, useRef, useEffect, useState } from "react";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { ImageToolbar } from "./image-toolbar";

// ===================== RESIZABLE IMAGE NODE VIEW =====================
function ResizableImageNodeView({ node, updateAttributes, selected, editor, getPos }: any) {
  const { src, alt, title, alignment, width } = node.attrs;
  const imageRef = useRef<HTMLImageElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Resizing state
  const [localWidth, setLocalWidth] = useState(width || 'auto');
  const localWidthRef = useRef(width || 'auto');

  // Sync `selected` from Tiptap — no manual focused state needed
  // ProseMirror plugin on CustomImage handles click → NodeSelection

  // Sync from Tiptap when attribute changes externally
  useEffect(() => {
    setLocalWidth(width || 'auto');
    localWidthRef.current = width || 'auto';
  }, [width]);

  const [showCropModal, setShowCropModal] = useState(false);
  
  // Crop states (percentages)
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);
  const [cropping, setCropping] = useState(false);

  // Native mouse drag event listener on the wrapper for handles resize
  // Bypasses ProseMirror synthetic event interception
  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dir = target.getAttribute('data-dir');
      if (!dir) return; // Only trigger for resize handles

      // Stop native propagation and default behavior to bypass editor input events
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = imageRef.current ? imageRef.current.clientWidth : 300;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        let newWidth = startWidth;

        if (dir === 'e' || dir === 'se' || dir === 'ne') {
          newWidth = startWidth + deltaX;
        } else {
          newWidth = startWidth - deltaX;
        }

        if (newWidth < 100) newWidth = 100;
        
        // Use the closest editor container class (.ProseMirror) for full width boundary check
        const editorEl = wrapperRef.current?.closest('.ProseMirror');
        const editorWidth = editorEl ? editorEl.clientWidth : 800;
        if (newWidth > editorWidth) newWidth = editorWidth;

        const newWidthStr = `${newWidth}px`;
        localWidthRef.current = newWidthStr;
        setLocalWidth(newWidthStr);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        // Persist to Tiptap schema on drag finish
        updateAttributes({ width: localWidthRef.current });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    wrapperEl.addEventListener('mousedown', handleMouseDown);
    return () => {
      wrapperEl.removeEventListener('mousedown', handleMouseDown);
    };
  }, [editor, getPos]);

  const startCropDrag = (event: React.MouseEvent, action: 'move' | 'tl' | 'tr' | 'bl' | 'br') => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    
    const startXPercent = cropX;
    const startYPercent = cropY;
    const startWPercent = cropW;
    const startHPercent = cropH;

    const imgWidth = previewImgRef.current?.clientWidth || 300;
    const imgHeight = previewImgRef.current?.clientHeight || 200;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const deltaXPercent = (deltaX / imgWidth) * 100;
      const deltaYPercent = (deltaY / imgHeight) * 100;

      if (action === 'move') {
        let newX = startXPercent + deltaXPercent;
        let newY = startYPercent + deltaYPercent;

        if (newX < 0) newX = 0;
        if (newX + startWPercent > 100) newX = 100 - startWPercent;
        if (newY < 0) newY = 0;
        if (newY + startHPercent > 100) newY = 100 - startHPercent;

        setCropX(newX);
        setCropY(newY);
      } else if (action === 'br') {
        let newW = startWPercent + deltaXPercent;
        let newH = startHPercent + deltaYPercent;

        if (newW < 10) newW = 10;
        if (startXPercent + newW > 100) newW = 100 - startXPercent;
        if (newH < 10) newH = 10;
        if (startYPercent + newH > 100) newH = 100 - startYPercent;

        setCropW(newW);
        setCropH(newH);
      } else if (action === 'tl') {
        let newX = startXPercent + deltaXPercent;
        let newY = startYPercent + deltaYPercent;

        if (newX < 0) newX = 0;
        if (newX > startXPercent + startWPercent - 10) newX = startXPercent + startWPercent - 10;
        
        if (newY < 0) newY = 0;
        if (newY > startYPercent + startHPercent - 10) newY = startYPercent + startHPercent - 10;

        const newW = startWPercent - (newX - startXPercent);
        const newH = startHPercent - (newY - startYPercent);

        setCropX(newX);
        setCropY(newY);
        setCropW(newW);
        setCropH(newH);
      } else if (action === 'tr') {
        let newY = startYPercent + deltaYPercent;
        let newW = startWPercent + deltaXPercent;

        if (newY < 0) newY = 0;
        if (newY > startYPercent + startHPercent - 10) newY = startYPercent + startHPercent - 10;

        if (newW < 10) newW = 10;
        if (startXPercent + newW > 100) newW = 100 - startXPercent;

        const newH = startHPercent - (newY - startYPercent);

        setCropY(newY);
        setCropW(newW);
        setCropH(newH);
      } else if (action === 'bl') {
        let newX = startXPercent + deltaXPercent;
        let newH = startHPercent + deltaYPercent;

        if (newX < 0) newX = 0;
        if (newX > startXPercent + startWPercent - 10) newX = startXPercent + startWPercent - 10;

        if (newH < 10) newH = 10;
        if (startYPercent + newH > 100) newH = 100 - startYPercent;

        const newW = startWPercent - (newX - startXPercent);

        setCropX(newX);
        setCropW(newW);
        setCropH(newH);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleCropSave = () => {
    setCropping(true);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCropping(false);
        return;
      }

      const xPx = (cropX / 100) * img.naturalWidth;
      const yPx = (cropY / 100) * img.naturalHeight;
      const wPx = (cropW / 100) * img.naturalWidth;
      const hPx = (cropH / 100) * img.naturalHeight;

      canvas.width = wPx;
      canvas.height = hPx;

      ctx.drawImage(
        img,
        xPx, yPx, wPx, hPx,
        0, 0, wPx, hPx
      );

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCropping(false);
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Gagal mengunggah');

          updateAttributes({ src: data.url });
          setShowCropModal(false);
          toast.success("Gambar berhasil dipotong!");
        } catch (err: any) {
          toast.error("Gagal menyimpan potongan: " + err.message);
        } finally {
          setCropping(false);
        }
      }, 'image/jpeg', 0.95);
    };
    img.onerror = () => {
      setCropping(false);
      toast.error("Gagal memuat gambar untuk proses pemotongan.");
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editor && typeof getPos === 'function') {
      const pos = getPos();
      const tr = editor.state.tr.setSelection(
        NodeSelection.create(editor.state.doc, pos)
      );
      editor.view.dispatch(tr);
    }
  };

  let wrapperClass = "relative inline-block group max-w-full";
  if (alignment === 'center') {
    wrapperClass = "relative block mx-auto group text-center max-w-full";
  } else if (alignment === 'left-block') {
    wrapperClass = "relative block mr-auto group text-left max-w-full";
  } else if (alignment === 'right-block') {
    wrapperClass = "relative block ml-auto group text-right max-w-full";
  } else if (alignment === 'left') {
    wrapperClass = "relative float-left mr-4 my-2 inline-block group max-w-full";
  } else if (alignment === 'right') {
    wrapperClass = "relative float-right ml-4 my-2 inline-block group max-w-full";
  } else if (alignment === 'inline') {
    wrapperClass = "relative inline-block mr-2 my-2 group max-w-full";
  }

  return (
    <NodeViewWrapper 
      as="div"
      className={wrapperClass} 
      contentEditable={false}
      draggable={true}
      onClick={handleClick}
      style={{ 
        display: alignment.includes('block') || alignment === 'center' ? 'block' : 'inline-block',
        float: alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'none',
        verticalAlign: 'middle',
        width: localWidth
      }}
    >
      <div 
        ref={wrapperRef}
        className="relative inline-block max-w-full w-full" 
        style={{ width: '100%' }}
        onClick={handleClick}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          title={title}
          draggable={false}
          onDoubleClick={() => {
            setCropX(15);
            setCropY(15);
            setCropW(70);
            setCropH(70);
            setShowCropModal(true);
          }}
          className={`rounded-lg max-w-full h-auto border border-gray-200/50 shadow-sm select-none cursor-pointer ${
            selected ? "ring-2 ring-[#2563eb] ring-offset-2" : ""
          }`}
          style={{ width: '100%', display: 'block' }}
        />
        
        {selected && (
          <>
            {/* Top-Left */}
            <div
              data-dir="nw"
              draggable={false}
              className="absolute top-0 left-0 w-3.5 h-3.5 bg-[#2563eb] border border-white rounded-full -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize hover:scale-125 transition-transform z-10 shadow"
            />
            {/* Top-Right */}
            <div
              data-dir="ne"
              draggable={false}
              className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#2563eb] border border-white rounded-full translate-x-1/2 -translate-y-1/2 cursor-nesw-resize hover:scale-125 transition-transform z-10 shadow"
            />
            {/* Bottom-Left */}
            <div
              data-dir="sw"
              draggable={false}
              className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-[#2563eb] border border-white rounded-full -translate-x-1/2 translate-y-1/2 cursor-nesw-resize hover:scale-125 transition-transform z-10 shadow"
            />
            {/* Bottom-Right */}
            <div
              data-dir="se"
              draggable={false}
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#2563eb] border border-white rounded-full translate-x-1/2 translate-y-1/2 cursor-nwse-resize hover:scale-125 transition-transform z-10 shadow animate-pulse"
            />
          </>
        )}
      </div>

      {showCropModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 flex flex-col select-none">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Potong Gambar (Crop)</h3>
              <button 
                onClick={() => setShowCropModal(false)}
                className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer text-xl p-1"
              >
                &times;
              </button>
            </div>

            <div className="text-sm text-gray-500 leading-relaxed">
              Seret kotak pembatas di bawah untuk menggeser area potong, atau tarik ujung lingkaran putih di pojok kotak untuk mengubah ukurannya.
            </div>

            <div className="relative max-h-[45vh] max-w-full overflow-hidden flex items-center justify-center bg-gray-950 rounded-xl p-4 shrink-0">
              <div className="relative inline-block max-w-full">
                <img 
                  ref={previewImgRef}
                  src={src} 
                  className="max-h-[38vh] w-auto block select-none pointer-events-none rounded" 
                  alt="Crop preview" 
                />
                
                {/* Visual crop masking overlays */}
                <div className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: `${cropY}%` }} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ top: `${cropY + cropH}%`, bottom: 0 }} />
                <div className="absolute left-0 bg-black/60" style={{ top: `${cropY}%`, bottom: `${100 - cropY - cropH}%`, width: `${cropX}%` }} />
                <div className="absolute right-0 bg-black/60" style={{ top: `${cropY}%`, bottom: `${100 - cropY - cropH}%`, left: `${cropX + cropW}%`, right: 0 }} />
                
                {/* Draggable/Resizable Crop Box */}
                <div 
                  className="absolute border-2 border-dashed border-[#2563eb] cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]"
                  style={{
                    top: `${cropY}%`,
                    left: `${cropX}%`,
                    width: `${cropW}%`,
                    height: `${cropH}%`,
                  }}
                  onMouseDown={(e) => startCropDrag(e, 'move')}
                >
                  {/* Corners handles */}
                  <div
                    onMouseDown={(e) => startCropDrag(e, 'tl')}
                    className="absolute top-0 left-0 w-3 h-3 bg-white border-2 border-[#2563eb] rounded-full -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => startCropDrag(e, 'tr')}
                    className="absolute top-0 right-0 w-3 h-3 bg-white border-2 border-[#2563eb] rounded-full translate-x-1/2 -translate-y-1/2 cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => startCropDrag(e, 'bl')}
                    className="absolute bottom-0 left-0 w-3 h-3 bg-white border-2 border-[#2563eb] rounded-full -translate-x-1/2 translate-y-1/2 cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => startCropDrag(e, 'br')}
                    className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 border-[#2563eb] rounded-full translate-x-1/2 translate-y-1/2 cursor-nwse-resize hover:scale-125 transition-transform"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-semibold text-gray-600 transition-colors cursor-pointer"
                disabled={cropping}
              >
                Batal
              </button>
              <button
                onClick={handleCropSave}
                className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow disabled:opacity-50"
                disabled={cropping}
              >
                {cropping ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Menyimpan...
                  </>
                ) : (
                  'Terapkan & Potong'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ===================== CUSTOM IMAGE EXTENSION =====================
const CustomImage = Image.extend({
  inline: true,
  group: 'inline',
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: 'center',
        renderHTML: attributes => {
          const alignment = attributes.alignment;
          let alignClass = 'mx-auto block mx-auto';
          if (alignment === 'left') alignClass = 'float-left mr-4 my-2 inline-block float-left';
          if (alignment === 'right') alignClass = 'float-right ml-4 my-2 inline-block float-right';
          if (alignment === 'left-block') alignClass = 'mr-auto block my-4 block-left';
          if (alignment === 'right-block') alignClass = 'ml-auto block my-4 block-right';
          if (alignment === 'inline') alignClass = 'my-2 inline-block mr-2 inline-block';
          
          return {
            class: `rounded-lg h-auto ${alignClass}`
          };
        },
        parseHTML: element => element.getAttribute('alignment') || getAlignmentFromClass(element.getAttribute('class') || ''),
      },
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width};`,
            width: attributes.width
          };
        },
        parseHTML: element => element.getAttribute('width') || element.style.width || null,
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) return {};
          return {
            style: `height: ${attributes.height};`,
            height: attributes.height
          };
        },
        parseHTML: element => element.getAttribute('height') || element.style.height || null,
      }
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('customImageClick'),
        props: {
          handleClickOn: (view, pos, node, nodePos, event, direct) => {
            if (node.type.name === 'image') {
              // Set NodeSelection on the clicked image node
              const tr = view.state.tr.setSelection(
                NodeSelection.create(view.state.doc, nodePos)
              );
              view.dispatch(tr);
              return true; // prevent ProseMirror default (text cursor)
            }
            return false;
          },
        },
      }),
    ];
  }
});

function getAlignmentFromClass(className: string): string {
  if (className.includes('block-left')) return 'left-block';
  if (className.includes('block-right')) return 'right-block';
  if (className.includes('float-left')) return 'left';
  if (className.includes('float-right')) return 'right';
  if (className.includes('inline-block')) return 'inline';
  return 'center';
}

// ===================== ICONS & IMPORTS =====================
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Upload,
  Minus,
  Loader2,
  Highlighter,
  Palette,
  Table2,
  Youtube as YoutubeIcon,
  Code,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Maximize2,
  Minimize2,
  Keyboard,
  TableProperties,
  Plus,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

// ===================== TYPES =====================
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

// ===================== CONSTANTS =====================
const TEXT_COLORS = [
  '#000000', '#374151', '#6b7280', '#9ca3af',
  '#dc2626', '#ea580c', '#d97706', '#ca8a04',
  '#16a34a', '#059669', '#0d9488', '#0891b2',
  '#2563eb', '#4f46e5', '#7c3aed', '#9333ea',
  '#c026d3', '#db2777', '#1E6F3D', '#2E8B57',
  '#be185d', '#b91c1c', '#92400e', '#065f46',
];

const SLASH_COMMANDS = [
  { label: 'Heading 2', desc: 'Judul besar', icon: 'H2', action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'Heading 3', desc: 'Sub-judul', icon: 'H3', action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: 'Heading 4', desc: 'Judul kecil', icon: 'H4', action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 4 }).run() },
  { label: 'Bullet List', desc: 'Daftar tidak berurut', icon: '•', action: (editor: Editor) => editor.chain().focus().toggleBulletList().run() },
  { label: 'Numbered List', desc: 'Daftar berurut', icon: '1.', action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run() },
  { label: 'Blockquote', desc: 'Kutipan blok', icon: '❝', action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run() },
  { label: 'Code Block', desc: 'Blok kode', icon: '<>', action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run() },
  { label: 'Horizontal Rule', desc: 'Garis pemisah', icon: '—', action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run() },
  { label: 'Gambar (URL)', desc: 'Sisipkan gambar dari URL', icon: '📷', action: (editor: Editor) => { const url = window.prompt('Masukkan URL gambar:'); if (url) editor.chain().focus().setImage({ src: url }).run(); } },
  { label: 'Tabel', desc: 'Sisipkan tabel 3×3', icon: '📊', action: (editor: Editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { label: 'YouTube', desc: 'Embed video YouTube', icon: '▶', action: (editor: Editor) => { const url = window.prompt('Masukkan URL YouTube:'); if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run(); } },
];

// ===================== MENU BUTTON =====================
function MenuButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
  className = '',
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive
          ? "bg-[#2563eb] text-white shadow-sm"
          : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

// ===================== COLOR PICKER COMPONENT =====================
function ColorPicker({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const currentColor = editor.getAttributes('textStyle').color;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="color-picker-popup" style={{ top: '100%', left: 0, marginTop: 4 }}>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Warna Teks</div>
      <div className="color-grid">
        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-swatch ${currentColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => {
              editor.chain().focus().setColor(color).run();
              onClose();
            }}
            title={color}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => { editor.chain().focus().unsetColor().run(); onClose(); }}
        className="mt-2 w-full text-[10px] text-gray-500 hover:text-gray-700 py-1 rounded hover:bg-gray-50 cursor-pointer font-semibold"
      >
        Hapus Warna
      </button>
    </div>
  );
}

// ===================== SLASH COMMAND COMPONENT =====================
function SlashCommandMenu({ editor, position, onClose }: { editor: Editor; position: { top: number; left: number }; onClose: () => void }) {
  const [filter, setFilter] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = SLASH_COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
    cmd.desc.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) {
          // Delete the slash character first
          editor.chain().focus().deleteRange({
            from: editor.state.selection.from - filter.length - 1,
            to: editor.state.selection.from,
          }).run();
          filtered[activeIndex].action(editor);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filtered, activeIndex, editor, filter, onClose]);

  // Close if clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="slash-command-menu"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        Blok Tersedia
      </div>
      {filtered.map((cmd, idx) => (
        <div
          key={cmd.label}
          className={`slash-command-item ${idx === activeIndex ? 'active' : ''}`}
          onClick={() => {
            editor.chain().focus().deleteRange({
              from: editor.state.selection.from - filter.length - 1,
              to: editor.state.selection.from,
            }).run();
            cmd.action(editor);
            onClose();
          }}
          onMouseEnter={() => setActiveIndex(idx)}
        >
          <div className="icon">{cmd.icon}</div>
          <div>
            <div className="label">{cmd.label}</div>
            <div className="desc">{cmd.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================== TABLE CONTROLS (shown when table is active) =====================
function TableControls({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-0.5 ml-1">
      <Divider />
      <span className="text-[10px] text-gray-400 font-bold uppercase px-1">Tabel:</span>
      <MenuButton
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        title="Tambah Kolom"
      >
        <div className="flex items-center gap-0.5">
          <Plus className="w-3 h-3" />
          <span className="text-[9px] font-bold">Kol</span>
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().addRowAfter().run()}
        title="Tambah Baris"
      >
        <div className="flex items-center gap-0.5">
          <Plus className="w-3 h-3" />
          <span className="text-[9px] font-bold">Brs</span>
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().deleteColumn().run()}
        title="Hapus Kolom"
      >
        <div className="flex items-center gap-0.5 text-red-500">
          <Trash2 className="w-3 h-3" />
          <span className="text-[9px] font-bold">Kol</span>
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().deleteRow().run()}
        title="Hapus Baris"
      >
        <div className="flex items-center gap-0.5 text-red-500">
          <Trash2 className="w-3 h-3" />
          <span className="text-[9px] font-bold">Brs</span>
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().deleteTable().run()}
        title="Hapus Tabel"
      >
        <div className="flex items-center gap-0.5 text-red-500">
          <X className="w-3 h-3" />
          <span className="text-[9px] font-bold">Tabel</span>
        </div>
      </MenuButton>
    </div>
  );
}

// ===================== KEYBOARD SHORTCUTS INFO =====================
function ShortcutsPanel({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    ['Ctrl + B', 'Bold / Tebal'],
    ['Ctrl + I', 'Italic / Miring'],
    ['Ctrl + U', 'Underline / Garis Bawah'],
    ['Ctrl + Shift + H', 'Highlight / Stabilo'],
    ['Ctrl + Shift + X', 'Strikethrough / Coret'],
    ['Ctrl + K', 'Insert Link'],
    ['Ctrl + Z', 'Undo'],
    ['Ctrl + Y', 'Redo'],
    ['/', 'Slash Commands'],
  ];

  return (
    <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-700">⌨️ Keyboard Shortcuts</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        {shortcuts.map(([key, desc]) => (
          <div key={key} className="flex justify-between items-center text-[11px]">
            <span className="text-gray-500">{desc}</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono font-bold text-gray-600">{key}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== EDITOR TOOLBAR =====================
function EditorToolbar({ editor, isFullscreen, onToggleFullscreen, selectionTime }: { editor: Editor; isFullscreen?: boolean; onToggleFullscreen?: () => void; selectionTime?: number }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [localImageWidth, setLocalImageWidth] = useState("");

  useEffect(() => {
    if (editor && editor.isActive("image")) {
      const attrs = editor.getAttributes("image");
      setLocalImageWidth(attrs.width || "");
    }
  }, [editor, selectionTime]);



  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL link:", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const addImageUrl = useCallback(() => {
    const url = window.prompt("Masukkan URL gambar:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYouTube = useCallback(() => {
    const url = window.prompt("Masukkan URL YouTube (cth: https://youtube.com/watch?v=...):");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Gagal mengunggah gambar");

        editor.chain().focus().setImage({ src: data.url }).run();
        toast.success("Gambar berhasil disisipkan!");
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [editor]
  );

  return (
    <div className="flex flex-col border-b border-gray-200 bg-gray-50/80">
      <div className="px-2 py-1.5 flex flex-wrap items-center gap-0.5 relative">
        {/* Text formatting */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        title="Highlight / Stabilo"
      >
        <Highlighter className="w-4 h-4" />
      </MenuButton>

      {/* Color */}
      <div className="relative">
        <MenuButton
          onClick={() => setShowColorPicker(!showColorPicker)}
          isActive={showColorPicker}
          title="Warna Teks"
        >
          <Palette className="w-4 h-4" />
        </MenuButton>
        {showColorPicker && <ColorPicker editor={editor} onClose={() => setShowColorPicker(false)} />}
      </div>

      <Divider />

      {/* Headings */}
      <MenuButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 4 }).run()
        }
        isActive={editor.isActive("heading", { level: 4 })}
        title="Heading 4"
      >
        <Heading4 className="w-4 h-4" />
      </MenuButton>

      <Divider />

      {/* Lists & Blocks */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className="w-4 h-4" />
      </MenuButton>

      <Divider />

      {/* Alignment */}
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() =>
          editor.chain().focus().setTextAlign("center").run()
        }
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </MenuButton>

      <Divider />

      {/* Superscript / Subscript */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive("superscript")}
        title="Superscript"
      >
        <SuperscriptIcon className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive("subscript")}
        title="Subscript"
      >
        <SubscriptIcon className="w-4 h-4" />
      </MenuButton>

      <Divider />

      {/* Link, Images, Table, YouTube */}
      <MenuButton
        onClick={addLink}
        isActive={editor.isActive("link")}
        title="Insert Link"
      >
        <LinkIcon className="w-4 h-4" />
      </MenuButton>

      <MenuButton onClick={addImageUrl} title="Insert Gambar (URL)">
        <ImageIcon className="w-4 h-4" />
      </MenuButton>

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          id="rte-image-upload"
        />
        <MenuButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload Gambar"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </MenuButton>
      </div>

      <MenuButton onClick={insertTable} title="Sisipkan Tabel 3×3">
        <Table2 className="w-4 h-4" />
      </MenuButton>

      <MenuButton onClick={addYouTube} title="Embed YouTube">
        <YoutubeIcon className="w-4 h-4" />
      </MenuButton>



      {/* Table controls when in table */}
      {editor.isActive("table") && <TableControls editor={editor} />}

      <Divider />

      {/* Undo/Redo */}
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </MenuButton>

      <Divider />

      {/* Shortcuts info */}
      <div className="relative">
        <MenuButton
          onClick={() => setShowShortcuts(!showShortcuts)}
          isActive={showShortcuts}
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </MenuButton>
        {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}
      </div>

      {/* Fullscreen toggle */}
      {onToggleFullscreen && (
        <MenuButton
          onClick={onToggleFullscreen}
          isActive={isFullscreen}
          title={isFullscreen ? "Keluar Fullscreen" : "Mode Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </MenuButton>
      )}
    </div>

    {/* Image controls secondary row when selected */}
    {editor.isActive("image") && (
      <div 
        className="w-full bg-slate-50/90 border-t border-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-150"
        onMouseDown={(e) => {
          // Prevent editor from losing focus unless clicking on an input element
          const target = e.target as HTMLElement;
          if (target.tagName !== "INPUT") {
            e.preventDefault();
          }
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Layout Section */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tata Letak:</span>
            <div className="flex items-center bg-slate-100 border border-slate-200/60 rounded-lg p-0.5 gap-0.5">
              {[
                { value: "left", label: "Float Kiri" },
                { value: "right", label: "Float Kanan" },
                { value: "center", label: "Tengah" },
                { value: "left-block", label: "Kiri" },
                { value: "right-block", label: "Kanan" },
                { value: "inline", label: "Berdampingan" },
              ].map((align) => {
                const attrs = editor.getAttributes("image");
                const currentAlign = attrs.alignment || "center";
                const isActive = currentAlign === align.value;
                return (
                  <button
                    key={align.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.commands.updateAttributes("image", { alignment: align.value });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer select-none ${
                      isActive
                        ? "bg-white text-[#1E6F3D] shadow-sm border border-slate-200/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    {align.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          {/* Width Section */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Ukuran Lebar:</span>
            <div className="flex items-center bg-slate-100 border border-slate-200/60 rounded-lg p-0.5 gap-0.5 select-none">
              {["25%", "50%", "75%", "100%"].map((w) => {
                const attrs = editor.getAttributes("image");
                const currentWidth = attrs.width || "100%";
                const isActive = currentWidth === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.commands.updateAttributes("image", { width: w });
                    }}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer select-none ${
                      isActive
                        ? "bg-white text-[#1E6F3D] shadow-sm border border-slate-200/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="flex items-center bg-slate-100 border border-slate-200/60 rounded-lg p-0.5 gap-1.5 ml-1">
              <input
                type="text"
                placeholder="Cth: 150px atau 30%"
                value={localImageWidth}
                onChange={(e) => setLocalImageWidth(e.target.value)}
                onBlur={() => {
                  if (editor && editor.isActive("image")) {
                    editor.commands.updateAttributes("image", { width: localImageWidth });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (editor && editor.isActive("image")) {
                      editor.commands.updateAttributes("image", { width: localImageWidth });
                      (e.target as HTMLInputElement).blur();
                    }
                  }
                }}
                className="w-36 px-2 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E6F3D]/50 focus:border-[#1E6F3D]"
              />
            </div>
          </div>
        </div>

        {/* Delete Option */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            editor.commands.deleteSelection();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 bg-white transition-all cursor-pointer text-[11px] font-bold shadow-sm select-none"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Gambar
        </button>
      </div>
    )}
  </div>
  );
}

// ===================== BUBBLE MENU COMPONENT =====================
function EditorBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      className="bubble-menu"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>
      <div className="divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'is-active' : ''}
        title="Highlight"
      >
        <Highlighter className="w-3.5 h-3.5" />
      </button>
      <div className="divider" />
      <button
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("Masukkan URL link:", previousUrl || "https://");
          if (url === null) return;
          if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        className={editor.isActive('link') ? 'is-active' : ''}
        title="Insert Link"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
    </BubbleMenu>
  );
}

const uploadFileAndInsert = async (file: File, view: any) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar");

    const { schema } = view.state;
    const node = schema.nodes.image.create({ src: data.url });
    const transaction = view.state.tr.replaceSelectionWith(node);
    view.dispatch(transaction);
    toast.success("Gambar berhasil disisipkan!");
  } catch (err: any) {
    toast.error(err.message);
  }
};

// ===================== MAIN EDITOR COMPONENT =====================
export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Tulis konten di sini...",
  isFullscreen = false,
  onToggleFullscreen,
}: RichTextEditorProps) {
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number } | null>(null);
  const [selectionTime, setSelectionTime] = useState(Date.now());
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Superscript,
      Subscript,
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'tableWrapper' },
      }),
      TableRow,
      TableHeader,
      TableCell,
      YoutubeExtension.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'youtube-embed',
        },
      }),
      CharacterCount,
      CustomImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#2563eb] underline hover:text-[#1d4ed8]",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Tulis judul...';
          }
          return placeholder;
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none text-gray-800 leading-relaxed",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        let hasImage = false;
        for (const item of items) {
          if (item.type.indexOf("image") === 0) {
            const file = item.getAsFile();
            if (file) {
              hasImage = true;
              uploadFileAndInsert(file, view);
            }
          }
        }
        return hasImage;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = event.dataTransfer.files;
          let hasImage = false;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.indexOf("image") === 0) {
              hasImage = true;
              uploadFileAndInsert(file, view);
            }
          }
          return hasImage;
        }
        return false;
      },
      handleKeyDown: (_view, event) => {
        // Slash command trigger
        if (event.key === '/') {
          // We need to wait for the character to be inserted
          setTimeout(() => {
            if (!editorContainerRef.current) return;
            const coords = _view.coordsAtPos(_view.state.selection.from);
            const containerRect = editorContainerRef.current.getBoundingClientRect();
            setSlashMenu({
              top: coords.bottom - containerRect.top + 4,
              left: coords.left - containerRect.left,
            });
          }, 10);
          return false;
        }
        
        // Close slash menu on escape or space
        if (slashMenu && (event.key === 'Escape' || event.key === ' ')) {
          setSlashMenu(null);
        }
        
        return false;
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
      
      // Check if slash menu should close
      const text = updatedEditor.state.doc.textBetween(
        Math.max(0, updatedEditor.state.selection.from - 20),
        updatedEditor.state.selection.from,
        ''
      );
      
      if (slashMenu && !text.includes('/')) {
        setSlashMenu(null);
      }
    },
    onSelectionUpdate: () => {
      setSelectionTime(Date.now());
    },
    onTransaction: () => {
      setSelectionTime(Date.now());
    },
  });

  // Sync external content changes (e.g. when loading existing article)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden min-h-[350px] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const characters = editor.storage.characterCount?.characters() ?? 0;
  const words = editor.storage.characterCount?.words() ?? 0;

  return (
    <div
      ref={editorContainerRef}
      className={`border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-[#2563eb]/50 focus-within:ring-1 focus-within:ring-[#2563eb]/20 transition-all relative ${isFullscreen ? 'editor-fullscreen' : ''}`}
    >
      <EditorToolbar editor={editor} isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} selectionTime={selectionTime} />
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto min-h-0" />
      
      {/* Slash Command Menu */}
      {slashMenu && (
        <SlashCommandMenu
          editor={editor}
          position={slashMenu}
          onClose={() => setSlashMenu(null)}
        />
      )}

      {/* Character/Word count bar */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-1.5 flex justify-between items-center text-[10px] text-gray-400">
        <span>
          Ketik <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">/</kbd> untuk menu insert cepat
        </span>
        <span>
          {words} kata · {characters} karakter
        </span>
      </div>
    </div>
  );
}
