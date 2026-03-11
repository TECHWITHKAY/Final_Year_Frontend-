import React, { createContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '@/api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (data: { fullName: string; username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  hasRole: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setAuthToken = useCallback((t: string | null) => {
    setToken(t);
    (window as any).__authToken = t;
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const res = await apiLogin(credentials);
    const { token: jwt, user: userData } = res.data.data || res.data;
    setAuthToken(jwt);
    setUser(userData);
  }, [setAuthToken]);

  const register = useCallback(async (data: { fullName: string; username: string; email: string; password: string }) => {
    const res = await apiRegister(data);
    const { token: jwt, user: userData } = res.data.data || res.data;
    setAuthToken(jwt);
    setUser(userData);
  }, [setAuthToken]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, [setAuthToken]);

  const hasRole = useCallback((role: string) => user?.role === role, [user]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
