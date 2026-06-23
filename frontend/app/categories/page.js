'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import api from '../../lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setCategories(data.categories);
    });
  }, []);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl text-cream font-semibold mb-6">All Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/category/${cat.slug}`} className="card overflow-hidden group">
              <div className="relative aspect-square bg-maroon">
                {cat.image && <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition" unoptimized />}
              </div>
              <p className="text-cream text-center py-3 font-medium">{cat.name}</p>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
