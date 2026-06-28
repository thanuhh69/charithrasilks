'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'popular', label: 'Best Selling' },
];

export default function SareesStorefrontPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    // Load Saree categories dynamically
    api.get('/categories', { params: { type: 'Saree' } })
      .then(({ data }) => {
        if (data.success) {
          setCategories(data.categories || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          type: 'Saree',
          sort,
          search: search.trim() || undefined,
          category: selectedCategory || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          limit: 30,
        };

        const { data } = await api.get('/products', { params });
        if (data.success) {
          let items = data.products || [];
          if (availability === 'instock') {
            items = items.filter((p) => p.totalStock > 0);
          }
          setProducts(items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, search, sort, minPrice, maxPrice, availability]);

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-gradient-to-b from-[#3B0614] via-[#1A0307] to-[#130305] text-cream">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gold text-2xl hover:scale-105 transition"><FiArrowLeft /></button>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-gold font-normal tracking-wide">Saree Collection</h1>
              <p className="text-cream/50 text-xs mt-1">Explore our range of premium sarees</p>
            </div>
          </div>

          {/* Search bar inside section */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search sarees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full text-sm py-2"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
          </div>
        </div>

        {/* Filter controls panel */}
        <div className="card p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3 items-end text-xs">
          <div>
            <label className="text-cream/60 block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field py-1.5 w-full text-xs"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-cream/60 block mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field py-1.5 w-full text-xs"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-cream/60 block mb-1">Price Range</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-field py-1.5 w-full text-center text-xs"
              />
              <span className="text-cream/40">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-field py-1.5 w-full text-center text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-cream/60 block mb-1">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="input-field py-1.5 w-full text-xs"
            >
              <option value="">All Products</option>
              <option value="instock">In Stock Only</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearch('');
                setSort('');
                setMinPrice('');
                setMaxPrice('');
                setAvailability('');
              }}
              className="btn-secondary w-full py-2 flex items-center justify-center gap-1.5"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card aspect-[3/4] animate-pulse bg-maroon/40" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-[#290d11]/10 rounded-2xl border border-gold/15">
            <p className="text-cream/50 text-sm">No sarees found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
