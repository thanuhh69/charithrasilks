'use client';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
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
