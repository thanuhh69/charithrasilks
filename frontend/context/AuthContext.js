'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Cookies from 'js-cookie';
import { auth, signOutFirebase } from '../lib/firebase';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncWithBackend = useCallback(async (firebaseUser, extraName) => {
    if (!firebaseUser) {
      setUser(null);
      Cookies.remove('idToken');
      return;
    }
    try {
      const idToken = await firebaseUser.getIdToken();
      Cookies.set('idToken', idToken, { expires: 1, sameSite: 'lax' });

      const { data } = await api.post('/auth/verify', {
        idToken,
        name: extraName || firebaseUser.displayName || '',
      });

      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Backend sync failed:', err?.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await syncWithBackend(firebaseUser);
      } else {
        setUser(null);
        Cookies.remove('idToken');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [syncWithBackend]);

  const logout = async () => {
    await signOutFirebase();
    setUser(null);
    Cookies.remove('idToken');
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) setUser(data.user);
    } catch (err) {
      /* noop */
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isLoggedIn: !!user, logout, refreshUser, syncWithBackend }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
