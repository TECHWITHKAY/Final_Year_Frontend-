import React, { createContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '@/api/auth';

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
  isGuest: boolean;
  isAdmin: boolean;
  isFieldAgent: boolean;
  isAnalyst: boolean;
  canExport: boolean;
  canSubmit: boolean;
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
  isGuest: true,
  isAdmin: false,
  isFieldAgent: false,
  isAnalyst: false,
  canExport: false,
  canSubmit: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      (window as any).__authToken = token;
    }
  }, [token]);

  const setAuthData = useCallback((t: string | null, u: User | null) => {
    setToken(t);
    setUser(u);
    if (t) {
      localStorage.setItem('token', t);
      (window as any).__authToken = t;
    } else {
      localStorage.removeItem('token');
      (window as any).__authToken = null;
    }
    
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(credentials);
      // The prompt says: store response.data.data.token, role, username. 
      // But looking at previous code it expected { token, user }. Let's handle both.
      const payload = res.data.data || res.data;
      const jwt = payload.token;
      // We reconstruct the user object assuming payload might have role/username directly or inside a user object
      const userData = payload.user || {
        id: payload.id || '0',
        username: payload.username || credentials.username,
        email: payload.email || '',
        fullName: payload.fullName || payload.username || credentials.username,
        role: payload.role || 'GUEST'
      };
      setAuthData(jwt, userData);
    } finally {
      setIsLoading(false);
    }
  }, [setAuthData]);

  const register = useCallback(async (data: { fullName: string; username: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(data);
      const payload = res.data.data || res.data;
      const jwt = payload.token;
      
      const userData = payload.user || {
        id: payload.id || '0',
        username: payload.username || data.username,
        email: payload.email || data.email,
        fullName: payload.fullName || data.fullName,
        role: payload.role || 'USER'
      };
      // After successful registration, auto-login using the same credentials (implied by just setting state)
      // Or we can literally call login if token isn't returned, but usually it is. Let's set state if token exists.
      if (jwt) {
        setAuthData(jwt, userData);
      } else {
        await login({ username: data.username, password: data.password });
      }
    } finally {
      setIsLoading(false);
    }
  }, [login, setAuthData]);

  const logout = useCallback(() => {
    setAuthData(null, null);
    window.location.href = '/';
  }, [setAuthData]);

  const hasRole = useCallback((role: string) => user?.role === role, [user]);

  const role = user?.role;
  const isGuest = !token;
  const isAdmin = role === 'ADMIN';
  const isFieldAgent = role === 'FIELD_AGENT';
  const isAnalyst = role === 'ANALYST' || role === 'ADMIN';
  const canExport = ['ANALYST', 'FIELD_AGENT', 'ADMIN'].includes(role || '');
  const canSubmit = ['FIELD_AGENT', 'ADMIN'].includes(role || '');

  return (
    <AuthContext.Provider value={{ 
      user, token, isAuthenticated: !!user && !!token, isLoading, 
      login, register, logout, hasRole,
      isGuest, isAdmin, isFieldAgent, isAnalyst, canExport, canSubmit
    }}>
      {children}
    </AuthContext.Provider>
  );
};
