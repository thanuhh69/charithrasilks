'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#130305] border-t border-gold/15 py-12 px-6 mt-16 text-cream/70 text-sm hidden md:block">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="Charithra Silks Logo"
              className="w-10 h-10 rounded-full border border-gold/45 object-cover"
            />
            <div>
              <span className="font-serif text-gold text-lg font-bold tracking-wide block leading-none">
                CHARITHRA
              </span>
              <span className="text-cream/50 text-[10px] tracking-widest block mt-0.5">SILKS</span>
            </div>
          </div>
          <p className="text-xs text-cream/50">
            Timeless Weaves, Eternal Elegance. Handcrafted sarees sourced directly from authentic artisans.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-gold font-medium text-base mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-gold transition text-xs">Home</Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-gold transition text-xs">Shop by Category</Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-gold transition text-xs">My Wishlist</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-gold font-medium text-base mb-4">Customer Support</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/help" className="hover:text-gold transition text-xs">Help Center / FAQ</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold transition text-xs">Contact Us</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-gold font-medium text-base mb-4">Policies & Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/legal" className="hover:text-gold transition text-xs">Legal Policy</Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-gold transition text-xs">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gold transition text-xs">Terms & Conditions</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gold/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-cream/40">
        <p>&copy; {new Date().getFullYear()} Charithra Silks. All Rights Reserved.</p>
        <p className="mt-2 md:mt-0 font-serif italic text-gold/60">Designed with Love and Elegance</p>
      </div>
    </footer>
  );
}
