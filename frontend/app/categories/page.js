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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-3 gap-y-5 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center group"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden hover:scale-[1.03] hover:shadow-gold/5 transition-all duration-500 rounded-lg shadow-lg">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-maroon/20 animate-pulse" />
                )}
                
                {/* The dark gradient at the bottom for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#130305]/95 via-[#130305]/40 to-transparent z-10"></div>

                {/* SVG Scalloped Arch Mask and Gold Border */}
                <svg viewBox="0 0 100 130" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  <path 
                    fill="#1a0508" 
                    fillRule="evenodd" 
                    d="M 0 0 L 100 0 L 100 130 L 0 130 Z 
                       M 50 6
                       Q 65 4, 73 14
                       Q 84 20, 90 35
                       Q 96 48, 96 65
                       Q 96 82, 90 95
                       Q 84 110, 73 116
                       Q 62 124, 50 124
                       Q 38 124, 27 116
                       Q 16 110, 10 95
                       Q 4 82, 4 65
                       Q 4 48, 10 35
                       Q 16 20, 27 14
                       Q 35 4, 50 6 Z" 
                  />
                  <path 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeWidth="1.2" 
                    d="M 50 6
                       Q 65 4, 73 14
                       Q 84 20, 90 35
                       Q 96 48, 96 65
                       Q 96 82, 90 95
                       Q 84 110, 73 116
                       Q 62 124, 50 124
                       Q 38 124, 27 116
                       Q 16 110, 10 95
                       Q 4 82, 4 65
                       Q 4 48, 10 35
                       Q 16 20, 27 14
                       Q 35 4, 50 6 Z" 
                  />
                </svg>

                {/* Category Name overlayed inside the arch at the bottom */}
                <div className="absolute inset-x-0 bottom-3.5 z-30 flex flex-col items-center justify-end px-2 text-center">
                  <span className="font-serif text-cream text-[9px] sm:text-xs font-bold uppercase tracking-widest leading-none drop-shadow-md">
                    {cat.name ? cat.name.split(' ')[0] : '...'}
                  </span>
                  {cat.name && cat.name.split(' ')[1] && (
                    <span className="font-serif text-cream text-[7px] sm:text-[9px] uppercase tracking-wider leading-none mt-1 opacity-95 drop-shadow-md">
                      {cat.name.split(' ').slice(1).join(' ')}
                    </span>
                  )}
                  <span className="text-[5px] sm:text-[7px] text-gold/80 tracking-widest mt-1.5 opacity-80">COLLECTIONS</span>
                  
                  {/* Tiny traditional ornament flourish under the text */}
                  <div className="flex items-center gap-1 mt-1 opacity-60">
                    <div className="w-1.5 h-[1px] bg-gold"></div>
                    <div className="w-0.5 h-0.5 rounded-full bg-gold"></div>
                    <div className="w-1.5 h-[1px] bg-gold"></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
