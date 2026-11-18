"use client";

import { Wifi, Radio, Globe, Cpu, Signal, Server, TrendingUp, MapPin } from 'lucide-react';
import { Card } from '../ui/card';
import { motion } from 'framer-motion';


const dashboardStats = [
  { icon: Wifi, label: 'Titik Internet Desa', value: '120', unit: 'titik', trend: '+15', color: 'from-blue-500 to-cyan-500' },
  { icon: Radio, label: 'Menara BTS', value: '85', unit: 'menara', trend: '+8', color: 'from-green-500 to-emerald-500' },
  { icon: Globe, label: 'Jaringan Fiber Optik', value: '450', unit: 'km', trend: '+50', color: 'from-purple-500 to-violet-500' },
  { icon: Cpu, label: 'Desa Digital', value: '54', unit: 'desa', trend: '+12', color: 'from-orange-500 to-amber-500' },
];

const infrastructureItems = [
  { icon: Signal, label: 'Bandwidth Total', value: '10 Gbps', status: 'Aktif' },
  { icon: Server, label: 'Server Aktif', value: '24 Unit', status: 'Aktif' },
  { icon: MapPin, label: 'Hotspot Publik', value: '35 Lokasi', status: 'Aktif' },
  { icon: TrendingUp, label: 'Uptime Jaringan', value: '99.2%', status: 'Baik' },
];

export function SmartCityDashboard() {
  return (
    <section id="smart-city" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-[#0a2e1a] to-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Dashboard <span className="bg-gradient-to-r from-[#3CB371] to-[#FFD700] bg-clip-text text-transparent">Infrastruktur TIK</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Pantau infrastruktur teknologi informasi dan komunikasi Kabupaten Penajam Paser Utara secara real-time
          </p>
        </motion.div>

        {/* Main Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {stat.trend}
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value} <span className="text-lg text-gray-400 font-normal">{stat.unit}</span>
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Infrastructure Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Status Infrastruktur — Live
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {infrastructureItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{item.label}</div>
                    <div className="font-bold text-white">{item.value}</div>
                    <span className="text-xs text-green-400">● {item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
