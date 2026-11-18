"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { 
  KeyRound, 
  Check, 
  X, 
  Trash2, 
  Copy, 
  CheckCheck,
  Search,
  Building2,
  Mail,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/frontend/components/shared/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminApiRequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null); // To track which button is currently working

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/api-requests');
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Anda tidak memiliki akses ke halaman ini');
        }
        throw new Error('Gagal mengambil daftar permintaan');
      }
      const data = await res.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActionId(id);
    try {
      const res = await fetch('/api/api-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memperbarui status');
      }

      // Update local state
      setRequests(prev => prev.map(req => {
        if (req.id === id) {
          const updated = { ...req, status };
          if (status === 'approved' && !updated.apiKey) {
            // Fetch updated request details from server to get generated key
            fetchRequests();
          }
          return updated;
        }
        return req;
      }));

      // In case we approved, fetch requests again to load the generated API key
      if (status === 'approved') {
        await fetchRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan permintaan ini?')) return;
    
    setActionId(id);
    try {
      const res = await fetch(`/api/api-requests?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus permintaan');
      }

      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    } finally {
      setActionId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Search Logic
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = filterStatus === 'all' ? true : req.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1E6F3D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kredensial API</h1>
        <p className="text-xs text-gray-500 mt-1">Setujui, tolak, atau buat token API key untuk aplikasi pihak ketiga</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-gray-200/50 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari permohonan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E6F3D] focus:ring-1 focus:ring-[#1E6F3D]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                filterStatus === tab
                  ? 'bg-white text-[#1E6F3D] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? 'Semua' : tab}
            </button>
          ))}
        </div>

      </div>

      {/* Request Cards/Table Grid */}
      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 border border-gray-200/50 rounded-2xl bg-white">
          <KeyRound className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-sm">Tidak ada permintaan kredensial ditemukan</p>
          <p className="text-xs mt-1 text-gray-400">Silakan sesuaikan filter pencarian atau tunggu pengajuan masuk.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((req) => (
            <Card 
              key={req.id} 
              className={`p-6 border rounded-2xl bg-white shadow-sm transition hover:shadow-md ${
                req.status === 'approved' 
                  ? 'border-green-200' 
                  : req.status === 'rejected'
                  ? 'border-red-200'
                  : 'border-gray-200/60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Request Content */}
                <div className="space-y-4 flex-1">
                  
                  {/* Title Bar */}
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="font-bold text-gray-900">{req.name}</h3>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      req.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : req.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Client Details Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{req.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{req.organization}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{req.date}</span>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tujuan Integrasi</h4>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{req.purpose}</p>
                  </div>

                  {/* Generated API Key (only if approved) */}
                  {req.status === 'approved' && req.apiKey && (
                    <div className="bg-green-50/50 p-4 border border-green-100 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <h4 className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> Token Kredensial API Key
                        </h4>
                        <code className="text-xs font-mono font-bold text-gray-800 break-all">{req.apiKey}</code>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-lg h-9 w-9 shrink-0 hover:bg-white cursor-pointer"
                        onClick={() => handleCopy(req.id, req.apiKey)}
                      >
                        {copiedId === req.id ? (
                          <CheckCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  )}

                </div>

                {/* Actions Panel */}
                <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                  {req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        disabled={actionId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 h-9 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg px-4 h-9 cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Tolak
                      </Button>
                    </>
                  )}

                  {req.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'pending')}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-3 h-9 cursor-pointer flex items-center gap-1"
                    >
                      Buka Kembali
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionId === req.id}
                    onClick={() => handleDelete(req.id)}
                    className="border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg h-9 w-9 p-0 cursor-pointer flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
