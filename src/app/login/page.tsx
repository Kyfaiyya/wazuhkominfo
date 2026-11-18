"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { useAuth } from '@/frontend/components/shared/auth-context';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If user is already authenticated, redirect to admin dashboard
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Username atau password salah');
      }

      await refreshUser();
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#1E6F3D]/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#3CB371]/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Floating Back Buttons */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#1E6F3D] bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Home className="w-3.5 h-3.5" /> Beranda
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden p-8 sm:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#1E6F3D] to-[#3CB371] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#1E6F3D]/20 mb-4 text-white">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Portal Administrator</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Dinas Komunikasi dan Informatika Kab. PPU</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Nama Pengguna (Username)</label>
            <Input
              required
              type="text"
              placeholder="Masukkan nama pengguna"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-gray-200 py-6"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider pl-1">Kata Sandi (Password)</label>
            <div className="relative">
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-gray-200 py-6 pr-10"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1E6F3D] hover:bg-[#2E8B57] text-white rounded-xl py-6 font-bold cursor-pointer transition-all flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4.5 h-4.5" /> Masuk ke Dashboard
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
