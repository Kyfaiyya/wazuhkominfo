"use client";

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';

const defaultStats = [
  { icon: 'Building2', value: 42, suffix: '+', label: 'OPD Terhubung', color: 'from-[#1E6F3D] to-[#3CB371]' },
  { icon: 'Wifi', value: 120, suffix: '+', label: 'Titik Internet Desa', color: 'from-blue-500 to-blue-600' },
  { icon: 'Newspaper', value: 390, suffix: '+', label: 'Artikel Berita', color: 'from-orange-500 to-orange-600' },
  { icon: 'MonitorSmartphone', value: 50, suffix: '+', label: 'Layanan Online', color: 'from-purple-500 to-purple-600' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Reset animation trigger if value updates dynamically
    hasAnimated.current = false;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const motionVal = useMotionValue(0);
          const rounded = useTransform(motionVal, (v) => Math.round(v));
          rounded.on('change', (v) => setDisplayValue(v));
          animate(motionVal, value, { duration: 2, ease: 'easeOut' });
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-5xl sm:text-6xl font-bold text-white">
      {displayValue}{suffix}
    </div>
  );
}

export function Statistics() {
  const [stats, setStats] = useState<any[]>(defaultStats);

  useEffect(() => {
    fetch('/api/pages?slug=statistics')
      .then((res) => res.json())
      .then((data) => {
        if (data.fields && data.fields.stats_list) {
          try {
            const parsed = JSON.parse(data.fields.stats_list);
            if (Array.isArray(parsed)) {
              setStats(parsed);
            }
          } catch (e) {
            console.error('Error parsing stats_list:', e);
          }
        }
      })
      .catch((err) => console.error('Error fetching statistics:', err));
  }, []);

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.HelpCircle;
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#1E6F3D] via-[#2E8B57] to-[#3CB371] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Diskominfo PPU dalam <span className="text-[#FFD700]">Angka</span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Pencapaian dan kontribusi kami dalam transformasi digital kabupaten
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = getIconComponent(stat.icon);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <AnimatedCounter value={Number(stat.value)} suffix={stat.suffix} />
                  <div className="text-white/80 font-medium mt-2">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
