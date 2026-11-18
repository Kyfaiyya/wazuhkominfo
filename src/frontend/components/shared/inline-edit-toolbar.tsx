"use client";

import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../shared/auth-context';

interface InlineEditToolbarProps {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  changeCount?: number;
  className?: string;
}

export function InlineEditToolbar({
  hasChanges,
  saving,
  onSave,
  onReset,
  changeCount,
  className = '',
}: InlineEditToolbarProps) {
  const { isAdmin, isEditMode } = useAuth();

  if (!isAdmin || !isEditMode) return null;

  return (
    <AnimatePresence>
      {hasChanges && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed bottom-24 right-6 z-[60] flex items-center gap-3 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl px-5 py-3 ${className}`}
        >
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-gray-600">
              {changeCount ? `${changeCount} perubahan` : 'Ada perubahan'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 rounded-xl h-9 px-3 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Batal
          </Button>

          <Button
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#1E6F3D] to-[#2E8B57] text-white rounded-xl h-9 px-4 hover:shadow-lg transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Simpan
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
