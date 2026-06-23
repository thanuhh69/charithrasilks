'use client';

import { AdminAuthProvider } from '../../context/AdminAuthContext';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{ style: { background: '#3d0c14', color: '#fdf8f0', border: '1px solid #d4af37' } }}
      />
    </AdminAuthProvider>
  );
}
