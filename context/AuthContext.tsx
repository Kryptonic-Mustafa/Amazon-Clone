"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role_ids?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUser = async () => {
    try {
      const is_admin_route = window.location.pathname.startsWith('/admin');
      const endpoint = is_admin_route ? '/api/admin/auth/me' : '/api/shop/auth/me';
      
      const res = await fetch(endpoint);
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const logout = async () => {
    const is_admin_route = window.location.pathname.startsWith('/admin');
    const endpoint = is_admin_route ? '/api/admin/logout' : '/api/shop/auth/logout';
    
    await fetch(endpoint, { method: 'POST' });
    setUser(null);
    router.push(is_admin_route ? '/admin/login' : '/login');
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};