"use client";

import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const defaultGalleryImages = [
  {
    src: '/uploads/1782951465293-whatsapp-image-2026-06-24-at-20-29-37-534x462.jpeg',
    title: 'Penanaman Kelapa Genjah di Nenang',
    category: 'Kegiatan',
  },
  {
    src: '/uploads/1782951465441-whatsapp-image-2026-06-18-at-16-16-15-534x462.jpeg',
    title: 'Raker KIM se-Kaltim',
    category: 'Rapat',
  },
  {
    src: '/uploads/1782951465613-whatsapp-image-2026-06-15-at-07-57-40-2-534x462.jpeg',
    title: 'Safari Jumat Bupati PPU',
    category: 'Kegiatan',
  },
  {
    src: '/uploads/1782951465797-desain-tanpa-judul-46-534x462.jpg',
    title: 'Safari Jumat di Maridan',
    category: 'Kegiatan',
  },
  {
    src: '/uploads/1782951465940-whatsapp-image-2026-06-08-at-21-58-192-534x462.jpeg',
    title: 'Sosialisasi Satu Data Indonesia',
    category: 'Sosialisasi',
  },
  {
    src: '/uploads/banner-kominfo.jpg',
    title: 'Kantor Diskominfo PPU',
    category: 'Kantor',
  },
];

interface GalleryItem {
  src: string;
  title: string;
  category: string;
}

const ITEMS_PER_PAGE = 6;

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    pages.push(totalPages);
  }
  
  return pages;
}

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(defaultGalleryImages);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/pages?slug=gallery&t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.fields && data.fields.gallery_list) {
          try {
            const parsed = JSON.parse(data.fields.gallery_list);
            if (Array.isArray(parsed)) {
              setGalleryImages(parsed);
            }
          } catch (e) {
            console.error('Error parsing gallery_list:', e);
          }
        }
      })
      .catch((err) => console.error('Error fetching gallery:', err));
  }, []);

  const totalPages = Math.ceil(galleryImages.length / ITEMS_PER_PAGE);
  const visibleImages = galleryImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const section = document.getElementById('gallery');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev === null ? null : (prev + 1) % visibleImages.length));
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev === null ? null : (prev - 1 + visibleImages.length) % visibleImages.length));
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, visibleImages.length]);

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Galeri <span className="text-[#1E6F3D]">Foto</span>
            </h2>
            <p className="text-xl text-gray-600">
              Dokumentasi kegiatan Diskominfo Kabupaten Penajam Paser Utara
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {visibleImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                    index === 0 ? 'h-64 md:h-full' : 'h-48 md:h-56'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-xs text-[#3CB371] font-semibold uppercase tracking-wider">{image.category}</span>
                  <h3 className="text-white font-bold text-sm mt-1">{image.title}</h3>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-200/60 pt-8">
            <p className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, galleryImages.length)}</span> dari <span className="font-bold text-gray-800">{galleryImages.length}</span> foto
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border-gray-200 hover:border-[#1E6F3D] hover:bg-[#1E6F3D]/5 hover:text-[#1E6F3D] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200 cursor-pointer text-xs animate-none"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>
              
              <div className="hidden sm:flex items-center gap-1.5">
                {getPageNumbers(currentPage, totalPages).map((pageNum, idx) => (
                  typeof pageNum === 'number' ? (
                    <Button
                      key={idx}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl font-bold transition-all duration-300 cursor-pointer text-xs ${
                        currentPage === pageNum 
                          ? 'bg-[#1E6F3D] hover:bg-[#1E6F3D]/90 text-white border-[#1E6F3D]' 
                          : 'border-gray-200 hover:border-[#1E6F3D] hover:text-[#1E6F3D] hover:bg-[#1E6F3D]/5'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  ) : (
                    <span key={idx} className="px-2 text-gray-400 font-bold select-none text-xs">
                      {pageNum}
                    </span>
                  )
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl border-gray-200 hover:border-[#1E6F3D] hover:bg-[#1E6F3D]/5 hover:text-[#1E6F3D] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200 cursor-pointer text-xs animate-none"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Top Bar / Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 text-white">
              <span className="text-sm font-medium tracking-wide bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm select-none">
                {selectedImageIndex + 1} / {visibleImages.length}
              </span>
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-white border border-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="relative max-w-5xl max-h-[80vh] w-full px-12 flex items-center justify-center select-none" onClick={(e) => e.stopPropagation()}>
              
              {/* Prev Button */}
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev === null ? null : (prev - 1 + visibleImages.length) % visibleImages.length))}
                className="absolute left-4 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Image Frame */}
              <motion.div
                key={selectedImageIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative flex flex-col items-center max-w-full"
              >
                <img
                  src={visibleImages[selectedImageIndex].src}
                  alt={visibleImages[selectedImageIndex].title}
                  className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl border border-white/10"
                />
                
                {/* Title & Caption */}
                <div className="w-full text-center mt-6 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5 max-w-2xl">
                  <span className="text-xs text-[#3CB371] font-semibold uppercase tracking-wider block mb-1">
                    {visibleImages[selectedImageIndex].category}
                  </span>
                  <h3 className="text-white font-bold text-lg leading-snug">
                    {visibleImages[selectedImageIndex].title}
                  </h3>
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev === null ? null : (prev + 1) % visibleImages.length))}
                className="absolute right-4 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
