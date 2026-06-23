'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminGuard({ children }) {
  const { isLoggedIn, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/admin/login');
    }
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0508]">
        <p className="text-gold">Loading admin panel...</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return children;
}
