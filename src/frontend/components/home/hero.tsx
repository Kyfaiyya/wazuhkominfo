"use client";

import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useInlineEdit } from '../shared/use-inline-edit';
import { EditableText } from '../shared/editable-text';
import { InlineEditToolbar } from '../shared/inline-edit-toolbar';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

import { useAuth } from '../shared/auth-context';

// Default values (used while API data loads)
const DEFAULTS = {
  badge: 'Selamat Datang di Website Resmi',
  heading: 'Dinas Komunikasi dan Informatika',
  subheading: 'Kabupaten Penajam Paser Utara',
  tagline: 'MAJU,MODERN,RELIGIUS',
  description: 'Melayani masyarakat Penajam Paser Utara dalam bidang komunikasi, informatika, statistik, dan persandian menuju tata kelola pemerintahan berbasis digital.',
  stat1_value: '50+',
  stat1_label: 'Layanan Digital',
  stat2_value: '40+',
  stat2_label: 'OPD Terhubung',
  stat3_value: '100+',
  stat3_label: 'Titik Internet Desa',
  bg_image_1: '/hero-bg.png',
  bg_image_2: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
  bg_image_3: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80',
};

export function Hero() {
  const { isEditMode } = useAuth();
  const { fields, updateField, save, reset, hasChanges, saving, isAdmin } = useInlineEdit({
    slug: 'hero',
    defaultFields: DEFAULTS,
  });

  const taglineWords = fields.tagline.split(',').map(w => w.trim()).filter(Boolean);

  // Split heading to highlight last word with gold gradient
  const headingParts = fields.heading.split(' ');
  const lastWord = headingParts.pop() || '';
  const headingMain = headingParts.join(' ');

  const stats = [
    { value: fields.stat1_value, label: fields.stat1_label },
    { value: fields.stat2_value, label: fields.stat2_label },
    { value: fields.stat3_value, label: fields.stat3_label },
  ];

  const slideImages = [
    fields.bg_image_1 || DEFAULTS.bg_image_1,
    fields.bg_image_2 || DEFAULTS.bg_image_2,
    fields.bg_image_3 || DEFAULTS.bg_image_3,
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play backgrounds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideImages.length]);

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={slideImages[currentSlide]}
                alt={`Banner Diskominfo PPU Slide ${currentSlide + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2e1a]/85 via-[#0a2e1a]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10" />
        </div>

        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-[#3CB371]/15 to-[#2E8B57]/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">
            {/* Content with staggered animations */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Welcome Badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full border border-white/20"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full animate-pulse" />
                <EditableText
                  value={fields.badge}
                  onChange={(v) => updateField('badge', v)}
                  as="span"
                  className="text-sm font-medium text-white/90"
                  editClassName="text-sm font-medium text-gray-900"
                />
              </motion.div>

              <div className="space-y-6">
                {/* Main Title — slide from left with blur */}
                <motion.h1
                  variants={fadeLeft}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
                >
                  <EditableText
                    value={fields.heading}
                    onChange={(v) => updateField('heading', v)}
                    as="span"
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
                    editClassName="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                  >
                    {headingMain}{' '}
                    <span className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-clip-text text-transparent">
                      {lastWord}
                    </span>
                  </EditableText>
                </motion.h1>

                {/* Subtitle */}
                <motion.h2
                  variants={fadeLeft}
                  className="text-2xl sm:text-3xl font-semibold text-white/90"
                >
                  <EditableText
                    value={fields.subheading}
                    onChange={(v) => updateField('subheading', v)}
                    as="span"
                    className="text-2xl sm:text-3xl font-semibold text-white/90"
                    editClassName="text-2xl sm:text-3xl font-semibold text-gray-900"
                  />
                </motion.h2>

                {/* Tagline Badges — scale in one-by-one */}
                <motion.div
                  variants={fadeUp}
                  className="flex items-center gap-3 pt-2"
                >
                  <EditableText
                    value={fields.tagline}
                    onChange={(v) => updateField('tagline', v)}
                    as="div"
                    className="flex items-center gap-3 pt-2"
                    editClassName="text-gray-900"
                  >
                    {taglineWords.map((word, i) => (
                      <motion.span
                        key={word}
                        variants={scaleIn}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wider ${
                          i === 0
                            ? 'bg-red-500/70 text-white'
                            : i === 1
                            ? 'bg-green-500/70 text-white'
                            : 'bg-yellow-500/70 text-white'
                        }`}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </EditableText>
                </motion.div>

                {/* Description — fade up */}
                <motion.p
                  variants={fadeUp}
                  className="text-lg text-white/80 leading-relaxed max-w-2xl"
                >
                  <EditableText
                    value={fields.description}
                    onChange={(v) => updateField('description', v)}
                    as="span"
                    multiline
                    className="text-lg text-white/80 leading-relaxed max-w-2xl"
                    editClassName="text-lg text-gray-900 leading-relaxed max-w-2xl"
                  />
                </motion.p>
              </div>

              {/* CTA Buttons — slide from right */}
              <motion.div
                variants={slideInRight}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 rounded-full px-8 text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                  asChild
                >
                  <a href="#services">
                    Layanan Kami
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent rounded-full px-8 text-lg border-2 border-white/40 text-white hover:bg-white/20 hover:border-white hover:text-white transition-all duration-300 group"
                  asChild
                >
                  <a href="/profil/diskominfo-sandi">
                    <ExternalLink className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    Profil Diskominfo
                  </a>
                </Button>
              </motion.div>

              {/* Stats — fade up last */}
              <motion.div
                variants={fadeUp}
                className="grid grid-cols-3 gap-8 pt-8"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className="space-y-1"
                  >
                    <div className="text-3xl font-bold text-[#FFD700]">
                      <EditableText
                        value={stat.value}
                        onChange={(v) => updateField(`stat${index + 1}_value`, v)}
                        as="span"
                        className="text-3xl font-bold text-[#FFD700]"
                        editClassName="text-3xl font-bold text-gray-900"
                      />
                    </div>
                    <div className="text-sm text-white/70">
                      <EditableText
                        value={stat.label}
                        onChange={(v) => updateField(`stat${index + 1}_label`, v)}
                        as="span"
                        className="text-sm text-white/70"
                        editClassName="text-sm text-gray-900"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Background Slide Indicators */}
        <div className="absolute bottom-16 right-8 z-30 flex items-center gap-2">
          {slideImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === index
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] w-6'
                  : 'bg-white/40 hover:bg-white/80'
              }`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Admin Background Uploader Widget */}
        {isAdmin && isEditMode && (
          <div className="absolute top-24 right-8 z-30 bg-black/70 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white max-w-xs space-y-3 shadow-2xl">
            <p className="text-xs font-bold text-[#FFD700] tracking-wide uppercase">⚙️ Pengaturan Background</p>
            <div className="flex gap-2">
              {slideImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    currentSlide === index
                      ? 'bg-[#1E6F3D] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Slide {index + 1}
                </button>
              ))}
            </div>
            
            <label className="block w-full text-center py-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg text-xs font-bold cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      updateField(`bg_image_${currentSlide + 1}`, data.url);
                    } else {
                      alert('Gagal mengunggah gambar');
                    }
                  } catch {
                    alert('Terjadi kesalahan saat mengunggah');
                  }
                }}
              />
              Ganti Gambar Slide {currentSlide + 1}
            </label>
          </div>
        )}

        {/* Breaking News Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#0a2715]/95 via-[#1E6F3D]/95 to-[#0a2715]/95 backdrop-blur-md border-t border-white/10 py-3.5 z-30"
        >
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
            <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-950 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider shrink-0 shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              BREAKING NEWS
            </span>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <motion.p
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="text-white/90 text-sm font-medium inline-block"
              >
                Diversifikasi Ekonomi, Gubernur Kaltim dan Bupati PPU Tanam Perdana Kelapa Genjah di Nenang &nbsp;&nbsp;<span className="text-[#FFD700] font-bold">•</span>&nbsp;&nbsp;
                Diskominfo PPU Hadiri Raker KIM se-Kaltim, Dorong Transformasi Kreatif dan Mandiri di Era Digital &nbsp;&nbsp;<span className="text-[#FFD700] font-bold">•</span>&nbsp;&nbsp;
                Safari Jumat, Mudyat Serahkan 21 Unit Bantuan Relokasi Rumah &nbsp;&nbsp;<span className="text-[#FFD700] font-bold">•</span>&nbsp;&nbsp;
                Diskominfo PPU Perkuat Pemahaman Satu Data Indonesia dan Transformasi Pemerintahan Digital
              </motion.p>
            </div>
          </div>
        </motion.div>
      </section>
      {isAdmin && (
        <InlineEditToolbar hasChanges={hasChanges} saving={saving} onSave={save} onReset={reset} />
      )}
    </>
  );
}
