"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Send, LogOut, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  newsId: string;
  userEmail: string;
  userName: string;
  content: string;
  date: string;
}

interface CurrentUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

// Generate deterministic gradient based on username for avatar
function getAvatarGradient(name: string) {
  const gradients = [
    'from-emerald-400 to-teal-600',
    'from-blue-400 to-indigo-600',
    'from-amber-400 to-orange-600',
    'from-rose-400 to-red-600',
    'from-violet-400 to-purple-600',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}

export function CommentsSection({ newsId }: { newsId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  
  // Comment input state
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [pathname, setPathname] = useState('');

  // Fetch comments
  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?newsId=${newsId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Gagal mengambil komentar:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Check current session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchComments();
    checkSession();
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, [newsId]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Gagal keluar:', err);
    }
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !currentUser) return;

    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId, content: commentContent }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan komentar');
      }

      setCommentContent('');
      fetchComments(); // Refresh comments list
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-gray-100">
      
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#1E6F3D]/10 flex items-center justify-center text-[#1E6F3D]">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          Komentar Pembaca <span className="text-gray-400 font-medium">({comments.length})</span>
        </h3>
      </div>

      {/* Comments List */}
      {commentsLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-2 border-[#1E6F3D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center space-y-3">
          <MessageSquare className="w-12 h-12 text-gray-300 stroke-[1.5]" />
          <p className="text-sm font-semibold text-gray-700">Belum Ada Komentar</p>
          <p className="text-xs text-gray-400 max-w-[280px]">Jadilah yang pertama untuk meninggalkan komentar pada berita ini!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={comment.id}
              className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarGradient(comment.userName)} flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0 select-none`}>
                {comment.userName.substring(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-900">{comment.userName}</span>
                    {/* Admin/Staff tag based on role or email domain */}
                    {(comment.userEmail.includes('kominfo') || comment.userEmail === 'superadmin' || comment.userEmail === 'admin') && (
                      <span className="text-[9px] font-bold bg-[#C62828] text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Staff
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {comment.date}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{comment.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Comment Card */}
      <Card className="p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentUser ? (
            
            /* Logged In: Comment Input Form */
            <motion.form
              key="comment-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmitComment}
              className="space-y-4"
            >
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getAvatarGradient(currentUser.name)} flex items-center justify-center text-white font-extrabold text-[9px]`}>
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span>Tulis komentar sebagai <span className="font-bold text-gray-800">{currentUser.name}</span> <span className="text-gray-400">({currentUser.username})</span></span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-bold text-xs text-[#C62828] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" /> Keluar
                </button>
              </div>

              <Textarea
                placeholder="Bagikan opini atau tanggapan Anda di sini secara santun..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                maxLength={500}
                required
                className="min-h-[100px] rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-[#1E6F3D] focus:ring-[#1E6F3D] focus:ring-2 resize-none text-sm p-4"
              />

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-semibold">
                  Maksimum 500 karakter
                </span>
                <Button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="bg-[#1E6F3D] hover:bg-[#1E6F3D]/90 text-white rounded-xl text-xs font-bold px-5 py-2.5 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#1E6F3D]/10 hover:shadow-lg transition-all"
                >
                  {submittingComment ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Kirim Komentar
                </Button>
              </div>
            </motion.form>
          ) : (
            
            /* Logged Out State: Just Google Sign-in */
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-center sm:text-left py-2"
            >
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-gray-900">Gabung Diskusi</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Silakan masuk menggunakan akun Google Anda terlebih dahulu untuk meninggalkan komentar pada berita ini.
                </p>
              </div>

              <div className="pt-2 flex justify-center sm:justify-start">
                <a
                  href={`/api/auth/google?redirect=${encodeURIComponent(pathname || '/')}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50/50 hover:text-red-600 transition-all font-bold text-xs bg-white shadow-xs cursor-pointer h-12"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Masuk dengan Google
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
    </div>
  );
}
