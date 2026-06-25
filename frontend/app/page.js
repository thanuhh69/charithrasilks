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

          {/* ================= 1. OUR STORY SECTION ================= */}
          <section className="mb-12 relative overflow-hidden rounded-2xl border border-gold/20 bg-[#290d11]/30 p-6 md:p-10 shadow-2xl">
            {/* Traditional corners */}
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-gold/40"></div>
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r border-gold/40"></div>
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l border-gold/40"></div>
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-gold/40"></div>

            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-[1px] bg-gold/50"></div>
                <span className="text-[10px] text-gold tracking-[0.3em] font-serif uppercase">Heritage & Craft</span>
                <div className="w-8 h-[1px] bg-gold/50"></div>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-gold font-bold tracking-wide leading-tight">
                The Story of Charithra Silks
              </h2>
              <p className="text-cream/80 text-xs md:text-sm leading-relaxed font-serif tracking-wide text-justify md:text-center max-w-2xl mx-auto">
                Charithra Silks was founded with a vision to bring timeless elegance, tradition, and premium craftsmanship to every woman. 
                We carefully curate exquisite saree collections that celebrate India's rich weaving heritage while embracing modern fashion trends. 
                Our mission is to deliver authentic quality, exceptional designs, and a seamless shopping experience to customers across India.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                <div className="w-10 h-[1px] bg-gold/30"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
              </div>
            </div>
          </section>

          {/* ================= 2. WHY CHOOSE CHARITHRA SILKS ================= */}
          <section className="mb-12">
            <div className="text-center mb-8 space-y-2">
              <span className="text-[10px] text-gold tracking-[0.3em] font-serif uppercase">Why Shop With Us</span>
              <h2 className="font-serif text-xl md:text-2xl text-cream font-semibold">Why Choose Charithra Silks?</h2>
              <div className="w-12 h-[1px] bg-gold/30 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: '🌟', title: 'Premium Quality Fabrics', desc: 'Crafted from the finest raw silk, cotton, and linen threads.' },
                { icon: '🧵', title: 'Authentic Traditional Weaves', desc: 'Sourced directly from generational weavers in weaving hubs.' },
                { icon: '🚚', title: 'Safe Delivery Across India', desc: 'Securely packaged and tracked deliveries right to your doorstep.' },
                { icon: '💎', title: 'Handpicked Exclusive Collections', desc: 'Unique colors and patterns curated for weddings & festivals.' },
                { icon: '❤️', title: 'Trusted Customer Experience', desc: 'Dedicated boutique-level personal service and care.' },
                { icon: '🔒', title: 'Secure UPI Payments', desc: 'Fast, secure, and hassle-free instant UPI checkout options.' },
              ].map((f, i) => (
                <div key={i} className="card p-5 border border-gold/15 bg-[#290d11]/10 flex flex-col items-center text-center space-y-2.5 hover:border-gold/45 transition duration-300">
                  <span className="text-2xl text-gold drop-shadow-md">{f.icon}</span>
                  <h3 className="font-serif text-gold text-xs font-semibold uppercase tracking-wider">{f.title}</h3>
                  <p className="text-cream/50 text-[10px] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= 3. COMPLETE CATEGORY SECTION REDESIGN ================= */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <span className="text-[9px] text-gold tracking-[0.3em] font-serif uppercase block">Editorial Picks</span>
                <h2 className="font-serif text-xl md:text-2xl text-cream font-semibold">Shop by Category</h2>
              </div>
              <Link href="/categories" className="text-gold text-sm hover:underline">View All</Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-5 md:gap-6">
              {(categories.length ? categories : Array.from({ length: 6 })).map((cat, i) => (
                <Link
                  key={cat?._id || i}
                  href={cat ? `/category/${cat.slug}` : '#'}
                  className="flex flex-col items-center group"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden hover:scale-[1.03] hover:shadow-gold/5 transition-all duration-500 rounded-lg shadow-lg">
                    {cat?.image ? (
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
                        {cat?.name ? cat.name.split(' ')[0] : '...'}
                      </span>
                      {cat?.name && cat.name.split(' ')[1] && (
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
          </section>

          {/* New Arrivals */}
          <section className="mb-12">
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
          <section className="mb-12">
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

          {/* ================= 4. INSTAGRAM SHOWCASE ================= */}
          <section className="mb-12 border-t border-gold/10 pt-10">
            <div className="flex flex-col items-center text-center mb-6 space-y-2">
              <span className="text-[10px] text-gold tracking-[0.3em] font-serif uppercase">Social Gallery</span>
              <h2 className="font-serif text-xl md:text-2xl text-cream font-semibold">Follow Us On Instagram</h2>
              <div className="w-12 h-[1px] bg-gold/30 mx-auto"></div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mb-6">
              {[
                { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400', tag: '@charithra' },
                { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400', tag: '@charithra' },
                { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400', tag: '@charithra' },
                { url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=400', tag: '@charithra' },
                { url: 'https://images.unsplash.com/photo-1610030470224-1a3b50c05dd7?auto=format&fit=crop&q=80&w=400', tag: '@charithra' },
                { url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=400', tag: '@charithra' },
              ].map((img, i) => (
                <a 
                  key={i} 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="relative aspect-square rounded-lg overflow-hidden group border border-gold/15 shadow-md block"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-[#290d11]/70 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <span className="text-[10px] text-gold font-serif tracking-widest">{img.tag}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-lg"
              >
                Follow @charithrasilks
              </a>
            </div>
          </section>
        </main>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
