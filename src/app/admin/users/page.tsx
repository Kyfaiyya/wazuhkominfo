"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Badge } from '@/frontend/components/ui/badge';
import { Plus, Trash, Pencil, X, Save, AlertCircle, ShieldAlert, Users, Search, Loader2, User as UserIcon, Shield, ShieldCheck, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
}

// Generate a consistent color from name string
function getAvatarColor(name: string): string {
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-cyan-500 to-sky-600',
    'from-fuchsia-500 to-pink-600',
    'from-lime-500 to-green-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'superadmin' | 'admin' | 'user'>('admin');
  const [password, setPassword] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Hanya Superadmin yang memiliki akses ke halaman ini');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setRole('admin');
    setPassword('');
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (usr: User) => {
    setEditingUser(usr);
    setUsername(usr.username);
    setName(usr.name);
    setRole(usr.role);
    setPassword('');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload: any = {
      username: username.trim(),
      name: name.trim(),
      role,
    };

    if (editingUser) {
      payload.id = editingUser.id;
      if (password.trim() !== '') {
        payload.password = password;
      }
    } else {
      payload.password = password;
    }

    try {
      const method = editingUser ? 'PUT' : 'POST';
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan user');
      }

      setModalOpen(false);
      fetchUsers();
      toast.success(editingUser ? 'User berhasil diperbarui!' : 'User baru berhasil ditambahkan!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus user');
      }

      fetchUsers();
      toast.success('User berhasil dihapus');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (error && error.includes('Hanya Superadmin')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Akses Ditolak</h3>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">Maaf, halaman pengelolaan pengguna hanya dapat diakses oleh akun tingkat <strong>Superadmin</strong>.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return Crown;
      case 'admin':
        return ShieldCheck;
      default:
        return UserIcon;
    }
  };

  // Count users by role
  const superadminCount = users.filter(u => u.role === 'superadmin').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const roleStats = [
    { label: 'Superadmin', count: superadminCount, icon: Crown, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700' },
    { label: 'Admin', count: adminCount, icon: ShieldCheck, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
    { label: 'User Biasa', count: userCount, icon: UserIcon, gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-600' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="space-y-5"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Pengguna</h2>
          <p className="text-xs text-gray-500 mt-0.5">Buat, monitoring, dan hapus akun Admin atau Superadmin</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] hover:shadow-lg hover:shadow-[#1E6F3D]/20 text-white rounded-xl cursor-pointer flex items-center gap-1.5 px-5 transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Tambah User
        </Button>
      </div>

      {/* Role Stats Cards */}
      {!loading && (
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {roleStats.map((stat, idx) => (
            <Card key={idx} className={`p-4 rounded-2xl border ${stat.border} ${stat.bg} shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-gray-900 tabular-nums">{stat.count}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${stat.text}`}>{stat.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Search Bar */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari user berdasarkan nama, username, atau role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl bg-white border-gray-200 h-10 text-sm"
        />
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-[#1E6F3D]/20 rounded-full" />
            <div className="absolute inset-0 w-10 h-10 border-4 border-[#1E6F3D] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      ) : (
        <motion.div variants={item}>
          <Card className="border border-gray-200/60 shadow-sm bg-white overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5 pl-5">Pengguna</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Level Akses</th>
                    <th className="p-3.5 pr-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Tidak ada user ditemukan</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {searchQuery ? 'Coba kata kunci lain' : 'Silakan tambahkan user baru'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => {
                      const RoleIcon = getRoleIcon(item.role);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(item.name)} flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm`}>
                                {getInitials(item.name)}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-[13px]">{item.name}</span>
                                <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                  <RoleIcon className="w-3 h-3" />
                                  <span className="capitalize">{item.role}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-xs font-semibold text-gray-500 font-mono">{item.username}</td>
                          <td className="p-3.5">
                            <Badge className={`text-[10px] uppercase font-bold border ${getRoleBadge(item.role)}`}>
                              {item.role}
                            </Badge>
                          </td>
                          <td className="p-3.5 pr-5 text-right shrink-0">
                            <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(item)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Table footer with count */}
            {filteredUsers.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
                Menampilkan {filteredUsers.length} dari {users.length} pengguna
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Add User Modal */}
      <AnimatePresence mode="wait">
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !saving && setModalOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border shadow-2xl w-full max-w-md sm:max-h-[90vh] max-h-[95vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingUser ? 'Edit User' : 'Tambah User Baru'}
                </h3>
                <button
                  onClick={() => !saving && setModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {error && !error.includes('Hanya Superadmin') && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                {/* Preview avatar */}
                <div className="flex justify-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(name || 'A')} flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all duration-300`}>
                    {name.trim() ? getInitials(name) : '?'}
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Nama Lengkap</label>
                    <Input
                      required
                      placeholder="Contoh: Admin IKP PPU"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Nama Pengguna (Username)</label>
                    <Input
                      required
                      placeholder="Contoh: admin_baru"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Level Akses (Role)</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-200 p-2.5 h-10 text-sm outline-none focus:border-[#1E6F3D] focus:ring-1 focus:ring-[#1E6F3D] bg-white text-gray-700 font-medium transition-colors cursor-pointer"
                    >
                      <option value="admin">Admin (Kelola Berita &amp; Pengumuman)</option>
                      <option value="superadmin">Superadmin (Akses Penuh + Kelola User)</option>
                      <option value="user">User Biasa (Hanya Membaca)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Kata Sandi (Password)</label>
                    <Input
                      required={!editingUser}
                      type="password"
                      placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan kata sandi awal'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => !saving && setModalOpen(false)}
                      disabled={saving}
                      className="rounded-xl cursor-pointer h-10"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] hover:shadow-lg text-white rounded-xl cursor-pointer flex items-center gap-1.5 h-10 min-w-[140px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Simpan User
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
