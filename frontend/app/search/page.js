'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get('/products', { params: { search: query } })
      .then(({ data }) => {
        if (data.success) {
          if (data.exactMatchProductSlug) {
            router.replace(`/product/${data.exactMatchProductSlug}`);
            return;
          }
          setProducts(data.products || []);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl text-cream font-semibold">
          Search Results
        </h1>
        <p className="text-cream/60 text-sm mt-1">
          {query ? `Showing results for "${query}"` : 'Enter a search term in the search bar above'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gold/20 rounded-2xl bg-maroon-dark/20">
          <p className="text-cream/50 text-base">No products match your search query.</p>
          <p className="text-gold text-xs mt-1">Try checking your spelling or using different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col justify-between">
      <div>
        <Header />
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
