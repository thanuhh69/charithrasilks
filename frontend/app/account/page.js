'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPackage, FiMapPin, FiHeart, FiStar, FiSettings, FiLogOut, FiX, FiLock } from 'react-icons/fi';
import AuthGuard from '../../components/AuthGuard';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';

function AccountContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const menu = [
    { icon: FiPackage, label: 'My Orders', href: '/orders' },
    { icon: FiMapPin, label: 'My Addresses', href: '/account/addresses' },
    { icon: FiHeart, label: 'Wishlist', href: '/wishlist' },
    { icon: FiStar, label: 'My Reviews', href: '/account/reviews' },
    { icon: FiSettings, label: 'Account Settings', href: '/account/settings' },
    { icon: FiLock, label: 'Change Password', href: '/account/change-password' },
  ];

  return (
    <>
      <div className="flex items-center gap-4 card p-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xl font-bold">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-cream font-medium">{user?.name || 'Customer'}</p>
          <p className="text-cream/50 text-sm">{user?.mobile || user?.email}</p>
        </div>
      </div>

      <div className="card divide-y divide-gold/10">
        {menu.map((m) => (
          <Link key={m.href} href={m.href} className="flex items-center gap-3 p-4 hover:bg-gold/5 transition">
            <m.icon className="text-gold text-lg" />
            <span className="text-cream flex-1">{m.label}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-3 p-4 w-full text-left hover:bg-red-500/5 transition">
          <FiLogOut className="text-red-400 text-lg" />
          <span className="text-red-400 flex-1">Logout</span>
        </button>
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen pb-24 md:pb-10">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-6">
          <AccountContent />
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
