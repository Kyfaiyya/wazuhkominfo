"use client";

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import { useAuth } from '../shared/auth-context';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'li';
  multiline?: boolean;
  className?: string;
  editClassName?: string;
  children?: React.ReactNode;
}

export function EditableText({
  value,
  onChange,
  as: Tag = 'p',
  multiline = false,
  className = '',
  editClassName = '',
  children,
}: EditableTextProps) {
  const { isAdmin, isEditMode } = useAuth();
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync local value when external value changes
  useEffect(() => {
    if (!editing) {
      setLocalValue(value);
    }
  }, [value, editing]);

  // Focus input on edit start
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const handleFinish = () => {
    setEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalValue(value);
      setEditing(false);
    }
    if (!multiline && e.key === 'Enter') {
      handleFinish();
    }
  };

  // Non-admin or Edit Mode disabled: render normally
  if (!isAdmin || !isEditMode) {
    return <Tag className={className}>{children || value}</Tag>;
  }

  // Admin editing mode
  if (editing) {
    const sharedInputStyles = `w-full bg-white/90 backdrop-blur-sm border-2 border-[#1E6F3D] rounded-lg px-3 py-1.5 outline-none shadow-lg shadow-[#1E6F3D]/10 transition-all ${editClassName || className}`;

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleFinish}
          onKeyDown={handleKeyDown}
          rows={Math.max(2, localValue.split('\n').length)}
          className={`${sharedInputStyles} resize-y min-h-[60px]`}
          style={{ font: 'inherit', letterSpacing: 'inherit' }}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleFinish}
        onKeyDown={handleKeyDown}
        className={sharedInputStyles}
        style={{ font: 'inherit', letterSpacing: 'inherit' }}
      />
    );
  }

  // Admin hover/click mode
  return (
    <Tag
      className={`${className} group/edit relative cursor-pointer transition-all duration-200 hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#1E6F3D]/40 hover:outline-offset-4 rounded-sm`}
      onClick={() => setEditing(true)}
      title="Klik untuk edit"
    >
      {children || value}
      <span className="absolute -top-2 -right-2 opacity-0 group-hover/edit:opacity-100 transition-opacity duration-200 bg-[#1E6F3D] text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-10">
        <Pencil className="w-2.5 h-2.5" />
      </span>
    </Tag>
  );
}
