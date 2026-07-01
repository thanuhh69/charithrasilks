'use client';

import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent pinch-to-zoom on multi-touch
    const preventPinchZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent Safari gesture zoom
    const preventGesture = (e) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventPinchZoom, { passive: false });
    document.addEventListener('gesturestart', preventGesture, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventPinchZoom);
      document.removeEventListener('gesturestart', preventGesture);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#3d0c14',
              color: '#fdf8f0',
              border: '1px solid #d4af37',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
