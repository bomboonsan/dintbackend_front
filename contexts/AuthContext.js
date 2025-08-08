'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('auth-token');
    if (token) {
      setUser({ username: '@dmin' }); // Mock user data
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const result = await auth.login(username, password);
      setUser(result.user);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error('Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
