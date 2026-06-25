'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import SplashScreen from '../components/SplashScreen';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';

function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/banners')
      .then(({ data }) => {
        if (data.success) {
          setBanners(data.banners || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="h-48 md:h-80 w-full bg-maroon/20 rounded-2xl animate-pulse flex items-center justify-center border border-gold/15 mb-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-maroon-dark to-maroon h-48 md:h-80 flex items-center px-6 md:px-12 border border-gold/15">
        <div className="relative z-10 max-w-md">
          <span className="bg-gold text-maroon-dark text-xs font-bold px-3 py-1 rounded">WELCOME</span>
          <h1 className="font-serif text-2xl md:text-4xl text-cream font-bold mt-3">
            Charithra Silks
          </h1>
          <p className="text-gold text-lg md:text-xl font-semibold mt-1">Timeless Weaves, Eternal Elegance</p>
          <Link href="/categories" className="btn-primary inline-block mt-4 text-sm">
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-80 group border border-gold/15 shadow-xl">
      {/* Slides */}
      <div className="relative w-full h-full bg-[#130305]">
        {banners.map((b, i) => (
          <div
            key={b._id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              i === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {b.image && (
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark/80 via-maroon-dark/30 to-transparent"></div>
            <div className="absolute inset-0 flex items-center px-6 md:px-12 z-20">
              <div className="max-w-md space-y-2 md:space-y-3">
                {b.subtitle && (
                  <span className="inline-block bg-gold text-maroon-dark text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded tracking-wide uppercase">
                    {b.subtitle}
                  </span>
                )}
                <h2 className="font-serif text-xl md:text-4xl text-cream font-bold leading-tight">
                  {b.title}
                </h2>
                {b.link && (
                  <Link href={b.link} className="btn-primary inline-block text-xs md:text-sm mt-1">
                    Shop Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-maroon-dark/60 hover:bg-gold hover:text-maroon-dark text-gold p-1.5 md:p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg"
          >
            <FiChevronLeft className="text-base md:text-lg" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-maroon-dark/60 hover:bg-gold hover:text-maroon-dark text-gold p-1.5 md:p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg"
          >
            <FiChevronRight className="text-base md:text-lg" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIdx ? 'bg-gold w-4' : 'bg-cream/45 w-1.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, newRes, dealRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products', { params: { isNewArrival: true, limit: 8 } }),
          api.get('/products', { params: { isBestDeal: true, limit: 8 } }),
        ]);
        setCategories(catRes.data.categories || []);
        setNewArrivals(newRes.data.products || []);
        setBestDeals(dealRes.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col justify-between">
      {/* Splash Startup Animation */}
      <SplashScreen />

      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Dynamic Hero Banner Carousel */}
          <BannerCarousel />

          {/* Shop by Category */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl text-cream font-semibold">Shop by Category</h2>
              <Link href="/categories" className="text-gold text-sm hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-x-4 gap-y-6 md:gap-4">
              {(categories.length ? categories : Array.from({ length: 8 })).map((cat, i) => (
                <Link
                  key={cat?._id || i}
                  href={cat ? `/category/${cat.slug}` : '#'}
                  className="flex flex-col items-center gap-2 group p-1.5"
                >
                  <div className="w-[88px] h-[88px] md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gold/30 to-maroon overflow-hidden border-2 border-gold/30 group-hover:border-gold transition relative shadow-lg">
                    {cat?.image && <Image src={cat.image} alt={cat.name} fill className="object-cover" unoptimized />}
                  </div>
                  <span className="text-cream/80 text-[11px] md:text-xs text-center leading-tight group-hover:text-gold transition max-w-[95px] break-words">
                    {cat?.name || '...'}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* New Arrivals */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl text-cream font-semibold">New Arrivals</h2>
              <Link href="/category/new-arrivals" className="text-gold text-sm hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card aspect-[3/4] animate-pulse bg-maroon/40" />
                  ))
                : newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>

          {/* Best Deals */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl text-cream font-semibold">Best Deals</h2>
              <Link href="/category/best-deals" className="text-gold text-sm hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card aspect-[3/4] animate-pulse bg-maroon/40" />
                  ))
                : bestDeals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        </main>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
