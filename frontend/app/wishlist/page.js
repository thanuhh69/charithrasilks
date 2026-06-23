'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import AuthGuard from '../../components/AuthGuard';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';

function WishlistContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(({ data }) => {
      if (data.success) setItems(data.wishlist);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-cream/50">Loading...</p>;
  if (items.length === 0) return <p className="text-cream/50 text-center py-10">Your wishlist is empty</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-24 md:pb-10">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold">My Wishlist</h1>
          </div>
          <WishlistContent />
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
