'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push('/login?redirect=/wishlist');
      return;
    }
    try {
      const { data } = await api.post(`/wishlist/${product._id}`);
      setWishlisted(data.added);
      toast.success(data.message);
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  const image = product.thumbnail || product.variants?.[0]?.images?.[0]?.url || '/images/placeholder.png';

  return (
    <Link href={`/product/${product.slug}`} className="card group block">
      <div className="relative aspect-[3/4] bg-maroon overflow-hidden">
        {image && (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 bg-maroon-dark/70 backdrop-blur rounded-full p-2 text-gold hover:scale-110 transition"
        >
          <FiHeart className={wishlisted ? 'fill-gold' : ''} />
        </button>
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-gold text-maroon-dark text-xs font-bold px-2 py-1 rounded">
            {product.discountPercent}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-cream font-medium text-sm line-clamp-2 min-h-[40px]">{product.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gold font-bold">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.mrp > product.price && (
            <span className="text-cream/40 text-xs line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.ratingCount > 0 && (
          <div className="flex items-center gap-1 mt-1 text-xs text-cream/70">
            <FiStar className="text-gold fill-gold" />
            {product.ratingAverage?.toFixed(1)} ({product.ratingCount})
          </div>
        )}
      </div>
    </Link>
  );
}
