"use client";

import { motion } from 'framer-motion';
import { EditableText } from '../shared/editable-text';
import { useAuth } from '../shared/auth-context';

interface PageHeaderProps {
  title: string;
  description?: string;
  category?: string;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
}

export function PageHeader({ title, description, category, onTitleChange, onDescriptionChange, onCategoryChange }: PageHeaderProps) {
  const { isAdmin, isEditMode } = useAuth();

  return (
    <div className="relative bg-gradient-to-r from-[#0a3d1f] via-[#1E6F3D] to-[#2E8B57] text-white py-16 sm:py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-gradient-to-br from-[#3CB371]/20 to-[#2E8B57]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {category && (
            isAdmin && isEditMode && onCategoryChange ? (
              <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-yellow-300 uppercase">
                <EditableText
                  value={category}
                  onChange={onCategoryChange}
                  as="span"
                  className="text-yellow-300 inline-flex items-center"
                  editClassName="text-gray-900 bg-white/90 px-2 py-0.5 rounded text-xs w-28 text-center"
                />
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-yellow-300 uppercase">
                {category}
              </span>
            )
          )}
          {isAdmin && onTitleChange ? (
            <EditableText
              value={title}
              onChange={onTitleChange}
              as="h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
              editClassName="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
            />
          ) : (
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            isAdmin && onDescriptionChange ? (
              <EditableText
                value={description}
                onChange={onDescriptionChange}
                as="p"
                multiline
                className="text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed"
                editClassName="text-base sm:text-lg max-w-2xl leading-relaxed text-gray-900"
              />
            ) : (
              <p className="text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed">
                {description}
              </p>
            )
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="shrink-0"
        >
          <img
            src="/logo.png"
            alt="Logo Kab. PPU"
            className="w-20 h-24 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
          />
        </motion.div>
      </div>
    </div>
  );
}
