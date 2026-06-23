'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiSearch, FiHeart, FiFilter } from 'react-icons/fi';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import ProductCard from '../../../components/ProductCard';
import api from '../../../lib/api';

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'popular', label: 'Popularity' },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const specialMap = { 'new-arrivals': 'isNewArrival', 'best-deals': 'isBestDeal' };
    const params = { limit: 24, sort };

    if (specialMap[slug]) {
      params[specialMap[slug]] = true;
      setCategoryName(slug === 'new-arrivals' ? 'New Arrivals' : 'Best Deals');
    } else {
      params.category = slug;
    }

    setLoading(true);
    api.get('/products', { params }).then(({ data }) => {
      if (data.success) {
        setProducts(data.products);
        if (data.products[0]?.category?.name && !specialMap[slug]) {
          setCategoryName(data.products[0].category.name);
        }
      }
      setLoading(false);
    });
  }, [slug, sort]);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold capitalize">{categoryName || slug.replace(/-/g, ' ')}</h1>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-3">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field flex-1 text-sm py-2">
            {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
          </select>
          <button className="flex items-center gap-1 text-cream/70 text-sm border border-gold/30 rounded-lg px-3 py-2">
            <FiFilter /> Filter
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card aspect-[3/4] animate-pulse bg-maroon/40" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-cream/50 text-center py-20">No products found in this category</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
