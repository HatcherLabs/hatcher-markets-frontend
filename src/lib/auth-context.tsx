'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { login as apiLogin, register as apiRegister, getProfile, setToken, clearToken } from './api';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  walletAddress?: string | null;
  isAdmin?: boolean;
  emailVerified?: boolean;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check for existing token and load profile
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hatcher_markets_token') : null;
    if (token) {
      getProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          clearToken();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { token, user: u } = await apiLogin(email, password);
      setToken(token);
      setUser(u);
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { token, user: u } = await apiRegister(email, username, password);
      setToken(token);
      setUser(u);
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
  }, []);

  const clearErrorFn = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError: clearErrorFn,
    }),
    [user, isLoading, error, login, register, logout, clearErrorFn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
