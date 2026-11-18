"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../shared/auth-context';

interface UseInlineEditOptions {
  slug: string;
  defaultFields: Record<string, string>;
}

export function useInlineEdit({ slug, defaultFields }: UseInlineEditOptions) {
  const { isAdmin } = useAuth();
  const [fields, setFields] = useState<Record<string, string>>(defaultFields);
  const [originalFields, setOriginalFields] = useState<Record<string, string>>(defaultFields);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Fetch page content from API
  useEffect(() => {
    // Check if we are in preview mode
    if (typeof window !== 'undefined' && window.location.search.includes('preview=true')) {
      const saved = localStorage.getItem('page_preview_data');
      if (saved) {
        try {
          const pageData = JSON.parse(saved);
          
          // Match if it's the exact slug OR if it matches after removing category prefix
          const stripPrefix = (s: string) => s.replace(/^(profil|ppid|informasi|layanan|download|gallery)-/, '');
          const matchExact = slug === pageData.slug;
          const matchCategory = stripPrefix(slug) === stripPrefix(pageData.slug);
          
          if (matchExact || matchCategory) {
            const merged = { ...defaultFields, ...pageData.fields };
            setFields(merged);
            setOriginalFields(merged);
            setLoaded(true);
            return;
          }
        } catch (e) {
          console.error("Gagal parse localStorage di useInlineEdit", e);
        }
      }
    }

    fetch(`/api/pages?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.fields) {
          const merged = { ...defaultFields, ...data.fields };
          setFields(merged);
          setOriginalFields(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const updateField = useCallback((key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  }, []);

  const hasChanges = JSON.stringify(fields) !== JSON.stringify(originalFields);

  const save = useCallback(async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      
      setOriginalFields({ ...fields });
      toast.success('Perubahan berhasil disimpan!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  }, [slug, fields, hasChanges]);

  const reset = useCallback(() => {
    setFields({ ...originalFields });
  }, [originalFields]);

  const addField = useCallback((key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  }, []);

  const removeField = useCallback((key: string) => {
    setFields(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return {
    fields,
    updateField,
    addField,
    removeField,
    save,
    reset,
    hasChanges,
    saving,
    loaded,
    isAdmin,
  };
}
