"use client";

import { Play, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface VideoItem {
  title: string;
  thumbnail: string;
  duration: string;
  date: string;
  href?: string;
}

const defaultVideos: VideoItem[] = [
  {
    title: 'Profil Diskominfo Kabupaten Penajam Paser Utara',
    thumbnail: '/uploads/banner-kominfo.jpg',
    duration: '5:30',
    date: '2026',
    href: 'https://www.youtube.com/channel/UCWlYHCuEAeWppVyvfUBj_AQ/videos',
  },
  {
    title: 'Sosialisasi Satu Data Indonesia di PPU',
    thumbnail: '/uploads/1782951465940-whatsapp-image-2026-06-08-at-21-58-192-534x462.jpeg',
    duration: '12:45',
    date: '2026',
    href: 'https://www.youtube.com/results?search_query=Sosialisasi+Satu+Data+Indonesia+di+PPU',
  },
  {
    title: 'Safari Jumat Bupati PPU 2026',
    thumbnail: '/uploads/1782951465613-whatsapp-image-2026-06-15-at-07-57-40-2-534x462.jpeg',
    duration: '8:20',
    date: '2026',
    href: 'https://www.youtube.com/results?search_query=Safari+Jumat+Bupati+PPU',
  },
  {
    title: 'Raker KIM se-Kalimantan Timur',
    thumbnail: '/uploads/1782951465441-whatsapp-image-2026-06-18-at-16-16-15-534x462.jpeg',
    duration: '15:10',
    date: '2026',
    href: 'https://www.youtube.com/results?search_query=Raker+KIM+se-Kaltim',
  },
];

const ITEMS_PER_PAGE = 8;

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

export function Videos() {
  const [videos, setVideos] = useState<VideoItem[]>(defaultVideos);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/pages?slug=videos')
      .then((res) => res.json())
      .then((data) => {
        if (data.fields && data.fields.videos_list) {
          try {
            const parsed = JSON.parse(data.fields.videos_list);
            if (Array.isArray(parsed)) {
              setVideos(parsed);
            }
          } catch (e) {
            console.error('Error parsing videos_list:', e);
          }
        }
      })
      .catch((err) => console.error('Error fetching videos:', err));
  }, []);

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const visibleVideos = videos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const section = document.getElementById('videos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="videos" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Galeri <span className="text-[#C62828]">Video</span>
            </h2>
            <p className="text-xl text-gray-600">
              Video kegiatan dan profil Diskominfo PPU
            </p>
          </div>
          <a href="https://www.youtube.com/channel/UCWlYHCuEAeWppVyvfUBj_AQ/videos" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="hidden sm:flex rounded-full border-2 hover:border-[#C62828] hover:bg-gray-50 group cursor-pointer"
            >
              YouTube Channel
              <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {visibleVideos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <a href={video.href || 'https://www.youtube.com/channel/UCWlYHCuEAeWppVyvfUBj_AQ/videos'} target="_blank" rel="noopener noreferrer" className="block h-full">
                  <Card className="group overflow-hidden rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white h-full">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 bg-[#C62828] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                          <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#C62828] transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2">{video.date}</p>
                    </div>
                  </Card>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-200/60 pt-8">
            <p className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, videos.length)}</span> dari <span className="font-bold text-gray-800">{videos.length}</span> video
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border-gray-200 hover:border-[#C62828] hover:bg-[#C62828]/5 hover:text-[#C62828] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200 cursor-pointer text-xs"
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
                          ? 'bg-[#C62828] hover:bg-[#C62828]/90 text-white border-[#C62828]' 
                          : 'border-gray-200 hover:border-[#C62828] hover:text-[#C62828] hover:bg-[#C62828]/5'
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
                className="rounded-xl border-gray-200 hover:border-[#C62828] hover:bg-[#C62828]/5 hover:text-[#C62828] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200 cursor-pointer text-xs"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
