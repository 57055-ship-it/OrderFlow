import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('orderflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('orderflow_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('orderflow_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('[Auth Check Error]', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('orderflow_token', res.data.token);
      localStorage.setItem('orderflow_user', JSON.stringify(res.data));
      setUser(res.data);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('orderflow_token');
    localStorage.removeItem('orderflow_user');
    setUser(null);
  };

  const hasRole = (roles = []) => {
    if (!user) return false;
    if (roles.length === 0) return true;
    return roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER',
    isEmployee: user?.role === 'EMPLOYEE',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
