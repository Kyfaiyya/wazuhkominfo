"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  isEditMode: false,
  setIsEditMode: () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditModeState] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    // Load edit mode preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diskominfo_edit_mode');
      if (saved === 'true') {
        setIsEditModeState(true);
      }
    }

    fetchSession().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const setIsEditMode = (val: boolean) => {
    setIsEditModeState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('diskominfo_edit_mode', String(val));
    }
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, isEditMode, setIsEditMode, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
