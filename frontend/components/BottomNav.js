'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiGrid, FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { cart, goToCart } = useCart();

  const items = [
    { href: '/', icon: FiHome, label: 'Home' },
    { href: '/categories', icon: FiGrid, label: 'Sarees' },
    { href: '/account', icon: FiUser, label: 'Account' },
    { href: '/wishlist', icon: FiHeart, label: 'Wishlist' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-maroon-dark border-t border-gold/20 flex justify-between px-2 py-2 z-40">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center flex-1 text-xs gap-1 ${active ? 'text-gold' : 'text-cream/60'}`}
          >
            <Icon className="text-lg" />
            {label}
          </Link>
        );
      })}
      <button onClick={goToCart} className="flex flex-col items-center flex-1 text-xs gap-1 text-cream/60 relative">
        <FiShoppingCart className="text-lg" />
        Cart
        {cart.summary.itemCount > 0 && (
          <span className="absolute top-0 right-4 bg-gold text-maroon-dark text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {cart.summary.itemCount}
          </span>
        )}
      </button>
    </nav>
  );
}
