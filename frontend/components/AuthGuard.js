'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [loading, isLoggedIn, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gold">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return children;
}
