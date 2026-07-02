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
import InstagramSection from '../components/InstagramSection';
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
      <div className="-mx-4 w-[calc(100%+32px)] md:w-full md:mx-0 h-[200px] sm:h-[260px] md:h-[400px] lg:h-[450px] bg-maroon/20 rounded-none md:rounded-2xl animate-pulse flex items-center justify-center border border-gold/15 mb-8">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative -mx-4 w-[calc(100%+32px)] md:w-full md:mx-0 rounded-none md:rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-maroon-dark to-maroon h-[200px] sm:h-[260px] md:h-[400px] lg:h-[450px] border-x-0 md:border border-gold/15 shadow-2xl">
        <div className="absolute bottom-[25px] left-[20px] sm:bottom-[35px] sm:left-[30px] z-20">
          <Link 
            href="/categories" 
            className="bg-[#E8C24A] text-black font-semibold py-1.5 px-3 sm:py-2.5 sm:px-5 rounded-full text-[9px] sm:text-xs flex items-center justify-center gap-1 transition-all duration-300 hover:bg-[#f3d266] hover:shadow-[0_0_15px_rgba(232,194,74,0.4)] active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.35)] w-max"
          >
            Explore Collection <FiChevronRight className="text-xs sm:text-base" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative -mx-4 w-[calc(100%+32px)] md:w-full md:mx-0 rounded-none md:rounded-2xl overflow-hidden mb-8 h-[200px] sm:h-[260px] md:h-[400px] lg:h-[450px] group border-x-0 md:border border-gold/20 shadow-2xl bg-[#1c0408]">
      {/* Slides */}
      <div className="relative w-full h-full">
        {banners.map((b, i) => (
          <div
            key={b._id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-600 ease-in-out ${
              i === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Full Width Image */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {b.image && (
                <img 
                  src={b.image} 
                  alt={b.title} 
                  className="w-full h-full object-cover object-right md:object-right-top" 
                />
              )}
            </div>

            {/* Text details container (layered on top) */}
            <div className="absolute bottom-[25px] left-[20px] sm:bottom-[35px] sm:left-[30px] z-20">
              <Link 
                href={b.link || '/categories'} 
                className="bg-[#E8C24A] text-black font-semibold py-1.5 px-3 sm:py-2.5 sm:px-5 rounded-full text-[9px] sm:text-xs flex items-center justify-center gap-1 transition-all duration-300 hover:bg-[#f3d266] hover:shadow-[0_0_15px_rgba(232,194,74,0.4)] active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.35)] w-max"
              >
                Explore Collection <FiChevronRight className="text-xs sm:text-sm group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-maroon-dark/70 hover:bg-gold hover:text-maroon-dark text-gold p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg border border-gold/10 hidden sm:block"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-maroon-dark/70 hover:bg-gold hover:text-maroon-dark text-gold p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg border border-gold/10 hidden sm:block"
          >
            <FiChevronRight className="text-lg" />
          </button>

          {/* Pill Indicators - Left Aligned to match screenshot */}
          <div className="absolute bottom-2.5 left-4 sm:bottom-6 sm:left-12 md:left-20 flex justify-start gap-1 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIdx ? 'bg-gold w-5 shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-gold/30 w-1.5'
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

    // Generate random layout coordinates for golden sparkles (increased density for a richer feel)
    const newSparkles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 98}%`,
      size: `${Math.random() * 2.5 + 1.2}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 9 + 5}s`,
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col justify-between bg-gradient-to-b from-[#2B0008] via-[#1A0307] to-[#130305] relative overflow-hidden text-cream">
      {/* Sparkles Foreground Overlay (increased z-index to z-20 to float in front of hero banner, category arches, and other body content) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
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
            <path d="M 0.5 0.03 Q 0.75 0.03, 0.96 0.26 L 0.96 0.85 Q 0.96 0.93, 0.80 0.93 L 0.65 0.93 Q 0.58 0.93, 0.50 0.97 Q 0.42 0.93, 0.35 0.93 L 0.20 0.93 Q 0.04 0.93, 0.04 0.85 L 0.04 0.26 Q 0.25 0.03, 0.5 0.03 Z" />
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
                  Shop by Category
                </h2>
                <div className="w-28 h-[1.5px] bg-gold/50 mt-1.5"></div>
              </div>
              <Link href="/categories" className="text-gold text-sm hover:underline font-medium">View All</Link>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
              {(categories.length ? categories : Array.from({ length: 8 })).map((cat, i) => {
                const imageUrl = cat?.image || categoryFallbackImages[cat?.slug] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';
                return (
                  <Link
                    key={cat?._id || i}
                    href={cat ? `/category/${cat.slug}` : '#'}
                    className="flex flex-col items-center group active:scale-95 transition-transform duration-200"
                  >
                    <div className="relative aspect-[3/4.2] w-full hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all duration-300 rounded-lg shadow-lg overflow-hidden bg-[#2B0008]">
                      {/* Clipped image and text container */}
                      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'url(#arch-clip)' }}>
                        {/* Image wrapper (top 72%) */}
                        <div className="absolute inset-x-0 top-0 h-[72%] overflow-hidden">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={cat?.name || ''} 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="absolute inset-0 bg-maroon/20 animate-pulse" />
                          )}
                        </div>

                        {/* Text block (bottom 28%) */}
                        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[#2B0008] flex flex-col items-center justify-center px-1 text-center border-t border-gold/15">
                          <span className="font-serif text-cream text-[8px] sm:text-xs font-semibold leading-tight tracking-wide break-words max-w-full">
                            {cat?.name || '...'}
                          </span>
                          
                          {/* Leaf flourish ornament */}
                          <div className="flex items-center justify-center mt-0.5 scale-[0.55] sm:scale-[0.65] origin-center opacity-85">
                            <svg className="w-16 h-3 fill-none stroke-gold" viewBox="0 0 60 15" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M30 10 C25 8, 18 8, 10 12 C16 9, 22 9, 26 10" />
                              <path d="M22 9 C18 6, 12 7, 8 10 C13 8, 18 8, 20 9" />
                              <path d="M30 10 C35 8, 42 8, 50 12 C44 9, 38 9, 34 10" />
                              <path d="M38 9 C42 6, 48 7, 52 10 C47 8, 42 8, 40 9" />
                              <circle cx="30" cy="10" r="1.2" className="fill-gold" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Gold border path overlay */}
                      <svg viewBox="0 0 100 135" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20">
                        <path 
                          fill="none" 
                          stroke="#D4AF37" 
                          strokeWidth="1.5" 
                          d="M 50 4
                             Q 75 4, 96 35
                             L 96 115
                             Q 96 125, 80 125
                             L 65 125
                             Q 58 125, 50 131
                             Q 42 125, 35 125
                             L 20 125
                             Q 4 125, 4 115
                             L 4 35
                             Q 25 4, 50 4
                             Z" 
                        />
                      </svg>
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
              <Link href="/category/new-arrivals" className="text-gold text-sm hover:underline flex items-center gap-1">View All &rarr;</Link>
            </div>
            <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card aspect-[3/4] w-[42vw] sm:w-[28vw] md:w-[240px] flex-shrink-0 animate-pulse bg-maroon/40" />
                  ))
                : newArrivals.map((p) => (
                    <div key={p._id} className="w-[42vw] sm:w-[28vw] md:w-[240px] flex-shrink-0 snap-start">
                      <ProductCard product={p} />
                    </div>
                  ))}
            </div>
          </section>

          {/* Best Deals */}
          <section className="mb-14 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl md:text-2xl text-cream font-semibold">Best Deals</h2>
              <Link href="/category/best-deals" className="text-gold text-sm hover:underline flex items-center gap-1">View All &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card aspect-[3/4] w-full animate-pulse bg-maroon/40" />
                  ))
                : bestDeals.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
            </div>
          </section>

          {/* ================= PREMIUM "OUR STORY" SECTION ================= */}
          <section className="mb-16 relative overflow-hidden bg-[#3B0614] text-cream z-10 max-w-5xl mx-auto py-12 px-6 md:px-10 border border-gold/15 rounded-2xl shadow-2xl">
            {/* Subtle background glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              {/* Left Side: Portrait Image & Quote */}
              <div className="md:col-span-5 flex flex-col items-center text-center space-y-4">
                <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-[20px] overflow-hidden border border-[#D4AF37] shadow-xl">
                  <img
                    src="https://res.cloudinary.com/dvhbkghjx/image/upload/f_auto,q_auto/1000232932_hglucj"
                    alt="Founder & Curator"
                    className="w-full h-full object-cover founder-image select-none pointer-events-none"
                    draggable="false"
                    loading="lazy"
                  />
                </div>
                <p className="text-[#D4AF37] italic font-serif text-sm max-w-[260px] leading-relaxed">
                  "Every saree is chosen with love, because every woman deserves the best."
                </p>
              </div>

              {/* Right Side: Narrative Text */}
              <div className="md:col-span-7 space-y-5 text-center md:text-left">
                <div className="space-y-1">
                  <span className="text-[11px] tracking-[0.25em] text-[#D4AF37] font-semibold uppercase block">
                    OUR STORY
                  </span>
                  <span className="text-xs text-[#F5E6C8] font-serif block italic">
                    Tradition • Trust • Elegance
                  </span>
                </div>
                
                <h2 className="font-serif text-2xl md:text-3xl text-cream font-bold tracking-wide leading-tight">
                  The Heart Behind Our Brand
                </h2>

                <div className="space-y-4 text-cream/90 text-sm md:text-base leading-relaxed font-serif text-justify md:text-left">
                  <p>
                    Our journey began with a simple vision—to bring timeless Indian elegance closer to every woman.
                  </p>
                  <p>
                    Every saree in our collection is carefully selected with love, focusing on authenticity, craftsmanship, premium quality, and graceful designs.
                  </p>
                  <p>
                    From traditional Banarasi silks to modern festive collections, every product reflects heritage while embracing contemporary elegance.
                  </p>
                  <p>
                    We believe a saree is more than clothing—it's a symbol of tradition, confidence, celebration, and cherished memories.
                  </p>
                  <p>
                    Our mission is to make premium sarees accessible while preserving the rich legacy of Indian craftsmanship.
                  </p>
                </div>

                {/* Signature Area */}
                <div className="pt-2">
                  <p className="text-sm text-cream/70">❤️ With Love,</p>
                  <p className="font-serif text-lg text-[#D4AF37] italic mt-1 font-bold">
                    Geetha Reddy
                  </p>
                  <p className="text-xs text-[#F5E6C8]">Founder & Curator</p>
                </div>
              </div>
            </div>

            {/* Premium feature divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-10" />

            {/* Bottom Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="card p-5 border border-gold/15 bg-[#290d11]/20 hover:border-gold/45 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-center space-y-2 flex flex-col items-center rounded-xl">
                <span className="text-xl text-[#D4AF37]">❤️</span>
                <h3 className="font-serif text-[#D4AF37] text-sm font-semibold uppercase tracking-wider">
                  Personally Handpicked
                </h3>
                <p className="text-cream/80 text-xs leading-relaxed">
                  Each saree is carefully selected with love to ensure uniqueness and exceptional quality.
                </p>
              </div>

              {/* Card 2 */}
              <div className="card p-5 border border-gold/15 bg-[#290d11]/20 hover:border-gold/45 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-center space-y-2 flex flex-col items-center rounded-xl">
                <span className="text-xl text-[#D4AF37]">🏅</span>
                <h3 className="font-serif text-[#D4AF37] text-sm font-semibold uppercase tracking-wider">
                  Premium Quality
                </h3>
                <p className="text-cream/80 text-xs leading-relaxed">
                  Authentic fabrics, premium weaving, excellent craftsmanship, and lasting elegance.
                </p>
              </div>

              {/* Card 3 */}
              <div className="card p-5 border border-gold/15 bg-[#290d11]/20 hover:border-gold/45 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-center space-y-2 flex flex-col items-center rounded-xl">
                <span className="text-xl text-[#D4AF37]">🚚</span>
                <h3 className="font-serif text-[#D4AF37] text-sm font-semibold uppercase tracking-wider">
                  Delivered Across India
                </h3>
                <p className="text-cream/80 text-xs leading-relaxed">
                  Secure packaging and reliable delivery to bring elegance directly to your doorstep.
                </p>
              </div>
            </div>

            {/* Bottom Quote with divider */}
            <div className="mt-10 pt-6 border-t border-[rgba(212,175,55,0.15)] text-center max-w-xl mx-auto space-y-2">
              <p className="text-cream/80 text-xs md:text-sm italic font-serif leading-relaxed">
                "A saree is not just what you wear, it's how you carry tradition, beauty and confidence."
              </p>
              <div className="w-12 h-[1px] bg-[#D4AF37]/50 mx-auto mt-2" />
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

      <InstagramSection />
      <Footer />
      <BottomNav />
    </div>
  );
}
