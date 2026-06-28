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
    }, 4000); // Auto Slide every 4 seconds
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
      <div className="h-[300px] sm:h-[360px] md:h-[450px] w-full bg-maroon/20 rounded-2xl animate-pulse flex items-center justify-center border border-gold/15 mb-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-maroon-dark to-maroon h-[300px] sm:h-[360px] md:h-[450px] flex items-center px-6 md:px-16 border border-gold/15 shadow-2xl">
        <div className="relative z-10 max-w-md space-y-4">
          <span className="bg-gold text-maroon-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">WELCOME</span>
          <h1 className="font-serif text-3xl md:text-5xl text-cream font-bold leading-tight">
            Charithra Silks
          </h1>
          <p className="text-gold text-base md:text-xl font-medium tracking-wide">Timeless Weaves, Eternal Elegance</p>
          <Link href="/categories" className="btn-primary inline-flex mt-2">
            Explore Collection <FiChevronRight className="text-base" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative rounded-2xl overflow-hidden mb-8 h-[300px] sm:h-[360px] md:h-[450px] group border border-gold/20 shadow-2xl bg-[#1c0408]">
      {/* Slides */}
      <div className="relative w-full h-full">
        {banners.map((b, i) => (
          <div
            key={b._id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-600 ease-in-out flex flex-col md:flex-row ${
              i === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Left Side: Text Details (45% on desktop, full overlay on mobile) */}
            <div className="w-full md:w-[45%] h-full flex flex-col justify-center px-6 sm:px-10 md:px-12 py-6 bg-gradient-to-r from-[#2B0008] via-[#1c0408] to-[#1c0408] md:to-transparent z-20 text-left relative">
              {/* Subtle dark gradient mask for text contrast */}
              <div className="absolute inset-0 bg-black/35 md:bg-transparent pointer-events-none z-0"></div>
              
              <div className="relative z-10 space-y-3 max-w-sm md:max-w-md">
                <span className="inline-block bg-gold/15 text-gold text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-gold/30 tracking-wider uppercase">
                  {b.subtitle || 'NEW COLLECTION'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cream font-extrabold leading-tight">
                  {b.title || 'Timeless Weaves, Eternal Elegance'}
                </h2>
                <p className="text-cream/80 text-xs md:text-sm font-sans line-clamp-2 leading-relaxed">
                  Discover the finest handcrafted sarees crafted for every special moment.
                </p>
                <div className="pt-2">
                  <Link href={b.link || '/categories'} className="btn-primary inline-flex text-xs md:text-sm">
                    Explore Collection <FiChevronRight className="text-base group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side: Image Saree Model (55% on desktop, full background on mobile) */}
            <div className="absolute md:relative md:w-[55%] inset-0 md:inset-auto h-full w-full z-10 overflow-hidden">
              {b.image && (
                <img 
                  src={b.image} 
                  alt={b.title} 
                  className="w-full h-full object-cover object-center md:object-right-top" 
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-maroon-dark/70 hover:bg-gold hover:text-maroon-dark text-gold p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg border border-gold/10"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-maroon-dark/70 hover:bg-gold hover:text-maroon-dark text-gold p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg border border-gold/10"
          >
            <FiChevronRight className="text-lg" />
          </button>

          {/* Pill Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIdx ? 'bg-gold w-6 shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-gold/40 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const categoryFallbackImages = {
  'banaras': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  'celebrity-collection': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
  'chiffon': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
  'dola': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80',
  'mysore-crepe': 'https://images.unsplash.com/photo-1610030470224-1a3b50c05dd7?w=600&auto=format&fit=crop&q=80',
  'fancy': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
  'georgette': 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&auto=format&fit=crop&q=80',
  'handloom-cotton': 'https://images.unsplash.com/photo-1583391265517-35bbdad01209?w=600&auto=format&fit=crop&q=80',
  'linen': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
  'pattu': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  'tussar-silk': 'https://images.unsplash.com/photo-1610030470224-1a3b50c05dd7?w=600&auto=format&fit=crop&q=80',
  'new-arrivals': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80'
};

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sparkles, setSparkles] = useState([]);

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

    // Generate random layout coordinates for golden sparkles
    const newSparkles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 95}%`,
      size: `${Math.random() * 3 + 1.5}px`,
      delay: `${Math.random() * 6}s`,
      duration: `${Math.random() * 8 + 6}s`,
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col justify-between bg-gradient-to-b from-[#2B0008] via-[#1A0307] to-[#130305] relative overflow-hidden text-cream">
      {/* Sparkles Background layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="absolute bg-gold rounded-full animate-float-sparkle opacity-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      {/* Clip path definition for arch shape */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="arch-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.046 Q 0.65 0.03, 0.73 0.107 Q 0.84 0.153, 0.9 0.269 Q 0.96 0.369, 0.96 0.5 Q 0.96 0.63, 0.9 0.73 Q 0.84 0.846, 0.73 0.892 Q 0.62 0.953, 0.5 0.953 Q 0.38 0.953, 0.27 0.892 Q 0.16 0.846, 0.1 0.73 Q 0.04 0.63, 0.04 0.5 Q 0.04 0.369, 0.1 0.269 Q 0.16 0.153, 0.27 0.107 Q 0.35 0.03, 0.5 0.046 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Splash Startup Animation */}
      <SplashScreen />

      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Dynamic Hero Banner Carousel */}
          <BannerCarousel />

          {/* ================= 3. COMPLETE CATEGORY SECTION REDESIGN ================= */}
          <section className="mb-14 relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-gold font-normal tracking-wide">
                  The House Edit
                </h2>
                <div className="w-24 h-[1.5px] bg-gold/50 mt-1.5"></div>
              </div>
              <Link href="/categories" className="text-gold text-sm hover:underline font-medium">View All</Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {(categories.length ? categories : Array.from({ length: 6 })).map((cat, i) => {
                const imageUrl = cat?.image || categoryFallbackImages[cat?.slug] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';
                return (
                  <Link
                    key={cat?._id || i}
                    href={cat ? `/category/${cat.slug}` : '#'}
                    className="flex flex-col items-center group active:scale-95 transition-transform duration-200"
                  >
                    <div className="relative aspect-[3/4] w-full hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all duration-300 rounded-lg shadow-lg overflow-hidden">
                      {/* Clipped image container */}
                      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'url(#arch-clip)' }}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={cat?.name || ''} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 bg-maroon/20 animate-pulse" />
                        )}
                        {/* Saree name overlayed inside the arch at the bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#2B0008] via-[#2B0008]/65 to-transparent z-10"></div>
                      </div>

                      {/* Gold border path overlay */}
                      <svg viewBox="0 0 100 130" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20">
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

                      {/* Category Name & leaf flourish */}
                      <div className="absolute inset-x-0 bottom-2.5 z-30 flex flex-col items-center justify-end px-1.5 text-center pointer-events-none">
                        <span className="font-serif text-cream text-[9px] sm:text-xs font-bold uppercase tracking-widest leading-none drop-shadow-md">
                          {cat?.name ? cat.name.split(' ')[0] : '...'}
                        </span>
                        {cat?.name && cat.name.split(' ')[1] && (
                          <span className="font-serif text-cream text-[7px] sm:text-[9px] uppercase tracking-wider leading-none mt-1 opacity-90 drop-shadow-md">
                            {cat.name.split(' ').slice(1).join(' ')}
                          </span>
                        )}
                        <span className="text-[5px] sm:text-[7px] text-gold/80 tracking-widest mt-1.5 opacity-80 font-sans">COLLECTIONS</span>
                        
                        {/* Leaf flourish ornament */}
                        <div className="flex items-center justify-center gap-1.5 mt-1.5 opacity-85">
                          <svg className="w-12 h-3 fill-none stroke-gold" viewBox="0 0 60 15" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M30 10 C25 8, 18 8, 10 12 C16 9, 22 9, 26 10" />
                            <path d="M22 9 C18 6, 12 7, 8 10 C13 8, 18 8, 20 9" />
                            <path d="M30 10 C35 8, 42 8, 50 12 C44 9, 38 9, 34 10" />
                            <path d="M38 9 C42 6, 48 7, 52 10 C47 8, 42 8, 40 9" />
                            <circle cx="30" cy="10" r="1" className="fill-gold" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* New Arrivals */}
          <section className="mb-14 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl md:text-2xl text-cream font-semibold">New Arrivals</h2>
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
          <section className="mb-14 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl md:text-2xl text-cream font-semibold">Best Deals</h2>
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

          {/* ================= 5. OUR STORY SECTION ================= */}
          <section className="mb-14 relative overflow-hidden rounded-2xl border border-gold/20 bg-[#290d11]/45 p-6 md:p-10 shadow-2xl z-10 max-w-4xl mx-auto mt-16">
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-gold/40"></div>
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r border-gold/40"></div>
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l border-gold/40"></div>
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-gold/40"></div>

            <div className="max-w-3xl mx-auto text-center space-y-5">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-[1px] bg-gold/50"></div>
                <span className="text-[10px] text-gold tracking-[0.3em] font-serif uppercase">Heritage & Craft</span>
                <div className="w-8 h-[1px] bg-gold/50"></div>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-gold font-bold tracking-wide">
                Our Story
              </h2>
              <div className="text-cream/80 text-xs md:text-sm leading-relaxed font-serif tracking-wide text-justify md:text-center max-w-2xl mx-auto space-y-4">
                <p>
                  Charithra Silks was founded with a simple vision—to bring timeless Indian elegance closer to every woman. 
                  What began as a passion for beautiful sarees has grown into a carefully curated collection of authentic weaves, premium fabrics, and graceful designs.
                </p>
                <p>
                  Every saree at Charithra Silks is personally selected with care, focusing on quality, craftsmanship, and elegance. 
                  From traditional Banarasi silks to contemporary drapes, our collections are chosen to celebrate every occasion with style and confidence.
                </p>
                <p>
                  We believe a saree is more than just clothing—it's a symbol of tradition, culture, and cherished memories. 
                  Through Charithra Silks, our goal is to make premium sarees accessible while honoring the rich heritage of Indian craftsmanship.
                </p>
                <p className="text-gold font-medium italic pt-2">
                  Thank you for being a part of our journey as we continue to weave elegance into every celebration.
                </p>
              </div>
            </div>
          </section>

          {/* ================= 6. WHY CHOOSE CHARITHRA SILKS ================= */}
          <section className="mb-10 z-10 relative max-w-5xl mx-auto">
            <div className="text-center mb-8 space-y-2">
              <span className="text-[10px] text-gold tracking-[0.3em] font-serif uppercase">The Boutique Promise</span>
              <h2 className="font-serif text-xl md:text-3xl text-cream font-semibold">Why Choose Charithra Silks</h2>
              <div className="w-16 h-[1.5px] bg-gold/45 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'Carefully Curated Collections', desc: 'Every saree is thoughtfully handpicked to ensure exceptional quality, timeless elegance, and authentic craftsmanship.' },
                { title: 'Authentic Indian Weaves', desc: 'Explore Banarasi, Pattu, Chiffon, Georgette, Linen, Mysore Crepe, Dola, Tussar Silk and more.' },
                { title: 'Premium Quality', desc: 'Carefully selected high-quality fabrics with elegant designs and fine detailing.' },
                { title: 'Perfect for Every Occasion', desc: 'Wedding, Festival, Party, Office or Everyday elegance.' },
                { title: 'Shipping Across India', desc: 'Safe, secure and reliable delivery across India.' },
                { title: 'Customer-First Experience', desc: 'Dedicated customer support and seamless shopping experience.' },
              ].map((f, i) => (
                <div key={i} className="card p-5 border border-gold/15 bg-[#290d11]/15 hover:border-gold/45 hover:-translate-y-1 transition-all duration-300 text-center space-y-2.5 flex flex-col items-center">
                  <span className="text-2xl text-gold">✨</span>
                  <h3 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">{f.title}</h3>
                  <p className="text-cream/70 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 px-4 max-w-xl mx-auto">
              <p className="text-cream/50 text-xs italic font-serif">
                "At Charithra Silks, every saree is selected with care to celebrate the beauty of tradition, craftsmanship, and timeless elegance."
              </p>
            </div>
          </section>
        </main>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
