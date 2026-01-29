'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Role = 'ADMIN' | 'TENANT';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (next: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh auth state', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      setUser,
      logout,
    }),
    [user, loading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
