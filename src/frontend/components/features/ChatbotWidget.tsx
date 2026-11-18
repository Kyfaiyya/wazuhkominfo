"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; href: string }[];
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'model',
  text: 'Halo! 👋 Saya asisten virtual Diskominfo PPU. Silakan tanyakan seputar berita, layanan, profil, atau informasi lainnya yang tersedia di website ini.',
};

function parseMessageText(text: string, onLinkClick?: () => void) {
  if (!text) return '';
  
  // Match markdown links: [text](url)
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    // Add text before the match
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    
    const linkText = match[1];
    const linkUrl = match[2];
    const isExternal = linkUrl.startsWith('http') || linkUrl.startsWith('https');
    
    if (isExternal) {
      parts.push(
        <a
          key={matchIndex}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 hover:text-emerald-800 underline font-bold inline-flex items-center gap-0.5"
        >
          {linkText}
        </a>
      );
    } else {
      parts.push(
        <Link
          key={matchIndex}
          href={linkUrl}
          onClick={onLinkClick}
          className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer hover:underline decoration-emerald-700/30 transition-all"
        >
          {linkText}
        </Link>
      );
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no links were found, render with line breaks
  if (parts.length === 0) {
    return text.split('\n').map((line, li) => (
      <span key={li}>
        {line}
        {li < text.split('\n').length - 1 && <br />}
      </span>
    ));
  }
  
  // Render components with line breaks mapped for each text part
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return part.split('\n').map((line, li) => (
        <span key={`${index}-${li}`}>
          {line}
          {li < part.split('\n').length - 1 && <br />}
        </span>
      ));
    }
    return part;
  });
}

export function ChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-close chatbot on navigation/pathname change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Hook order must be preserved, early return will be placed before rendering markup

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setHasInteracted(true);
    const userMessage: ChatMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build history from previous messages (skip welcome)
      const history = messages
        .filter((_, i) => i > 0) // skip welcome
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      const botMessage: ChatMessage = {
        role: 'model',
        text: data.reply || 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Maaf, terjadi kesalahan jaringan. Pastikan koneksi internet Anda stabil dan coba lagi.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] text-white shadow-xl shadow-green-900/25 flex items-center justify-center cursor-pointer group"
            aria-label="Buka Chatbot"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            {!hasInteracted && (
              <span className="absolute inset-0 rounded-full bg-[#3CB371]/40 animate-ping pointer-events-none" />
            )}
            {/* Label badge */}
            {!hasInteracted && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-16 whitespace-nowrap bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 pointer-events-none"
              >
                <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
                Tanya AI
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200/60 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E6F3D] to-[#2d8a4e] px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Asisten Diskominfo PPU</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[10px] text-white/70 font-medium">Online · AI-Powered</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50/80 to-white"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-1.5`}>
                    <div
                      className={`px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#1E6F3D] to-[#2d8a4e] text-white rounded-br-md shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {/* Render text with dynamic markdown links and line breaks */}
                      {parseMessageText(msg.text, () => setIsOpen(false))}
                    </div>
                    {/* Source chips */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-1">
                        {msg.sources.map((src, si) => (
                          <Link
                            key={si}
                            href={src.href}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-100 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[140px]">{src.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 justify-start"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pertanyaan Anda..."
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E6F3D]/50 focus:ring-1 focus:ring-[#1E6F3D]/20 transition-all placeholder:text-gray-400 disabled:opacity-60"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E6F3D] to-[#3CB371] text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md active:scale-95 transition-all"
                  aria-label="Kirim pesan"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-center text-[9px] text-gray-300 mt-2 select-none">
                Ditenagai oleh Google Gemini AI · Jawaban berdasarkan data website
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
