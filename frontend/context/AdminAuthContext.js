'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import adminApi from '../lib/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .get('/admin/auth/me')
      .then(({ data }) => {
        if (data.success) setAdmin(data.admin);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await adminApi.post('/admin/auth/login', { email, password });
    if (data.success) {
      Cookies.set('adminToken', data.token, { expires: 7, sameSite: 'lax' });
      setAdmin(data.admin);
    }
    return data;
  };

  const logout = () => {
    Cookies.remove('adminToken');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isLoggedIn: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
