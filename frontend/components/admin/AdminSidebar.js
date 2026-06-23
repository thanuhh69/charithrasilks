'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiTag, FiList, FiLogOut, FiMenu, FiX, FiImage,
} from 'react-icons/fi';
import { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/products', label: 'Products', icon: FiBox },
  { href: '/admin/categories', label: 'Categories', icon: FiList },
  { href: '/admin/banners', label: 'Banners', icon: FiImage },
  { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: FiUsers },
  { href: '/admin/coupons', label: 'Coupons', icon: FiTag },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <>
      <button className="md:hidden fixed top-4 left-4 z-50 text-gold text-2xl" onClick={() => setOpen(!open)}>
        {open ? <FiX /> : <FiMenu />}
      </button>

      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-maroon-dark border-r border-gold/20 flex flex-col z-40 transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gold/20">
          <h1 className="font-serif text-gold text-xl font-bold">CHARITHRA</h1>
          <p className="text-cream/50 text-xs">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                  active ? 'bg-gold/20 text-gold' : 'text-cream/70 hover:bg-gold/10'
                }`}
              >
                <item.icon className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gold/20">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-xs">
              <p className="text-cream">{admin?.name}</p>
              <p className="text-cream/40">{admin?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm px-2 py-2 hover:bg-red-500/10 rounded-lg w-full">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
