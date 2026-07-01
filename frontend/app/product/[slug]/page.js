'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiStar, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import api from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const selectedSize = 'Free Size';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.product);
          
          // Fetch related products from the same category
          if (data.product.category?.slug) {
            setLoadingRelated(true);
            try {
              const res = await api.get(`/products`, {
                params: {
                  category: data.product.category.slug,
                  limit: 20,
                }
              });
              if (res.data?.success) {
                // Filter out current product to avoid showing it in the related section
                const filtered = (res.data.products || []).filter(
                  (p) => p._id !== data.product._id
                );
                setRelatedProducts(filtered);
              }
            } catch (err) {
              console.error('Error fetching related products:', err);
            } finally {
              setLoadingRelated(false);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0508]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0508]">
        <p className="text-cream/60">Product not found</p>
      </div>
    );
  }

  const variant = product.variants[selectedVariant];

  const handleAddToCart = async () => {
    await addToCart({
      productId: product._id,
      variantId: variant._id,
      color: variant.color,
      size: selectedSize,
      quantity: 1,
    });
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/product/${slug}`);
      return;
    }
    const ok = await addToCart({
      productId: product._id,
      variantId: variant._id,
      color: variant.color,
      size: selectedSize,
      quantity: 1,
    });
    if (ok) router.push('/checkout');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-[#1c0408]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-maroon mb-3 border border-gold/15">
            {variant?.images?.[activeImage]?.url && (
              <Image
                src={variant.images[activeImage].url}
                alt={product.title}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {variant?.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                  i === activeImage ? 'border-gold' : 'border-transparent'
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-start">
          <h1 className="font-serif text-2xl text-cream font-semibold">{product.title}</h1>
          {product.productCode && (
            <p className="text-xs text-gold/60 mt-1 font-mono">SKU: {product.productCode}</p>
          )}
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-cream/70">
              <FiStar className="text-gold fill-gold" />
              {product.ratingAverage.toFixed(1)} ({product.ratingCount} Reviews)
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <span className="text-gold text-2xl font-bold">₹{product.price.toLocaleString('en-IN')}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-cream/40 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                <span className="bg-gold/20 text-gold text-sm font-semibold px-2 py-0.5 rounded">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <p className="text-cream/50 text-xs mt-1">Inclusive of all taxes</p>

          {/* Color */}
          <div className="mt-6">
            <p className="text-cream/80 text-sm mb-2">Color: <span className="text-gold">{variant?.color}</span></p>
            <div className="flex gap-2">
              {product.variants.map((v, i) => (
                <button
                  key={v._id}
                  onClick={() => {
                    setSelectedVariant(i);
                    setActiveImage(0);
                  }}
                  className={`w-9 h-9 rounded-lg border-2 ${
                    i === selectedVariant ? 'border-gold scale-110 shadow-lg' : 'border-cream/20'
                  }`}
                  style={{ backgroundColor: v.colorHex }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button onClick={handleAddToCart} className="btn-secondary flex-1">Add to Cart</button>
            <button onClick={handleBuyNow} className="btn-primary flex-1">Buy Now</button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h3 className="text-cream font-medium mb-2 border-b border-gold/10 pb-1 font-serif text-gold">Description</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Care Instructions */}
          {product.careInstructions && (
            <div className="mt-6">
              <h3 className="text-cream font-medium mb-2 border-b border-gold/10 pb-1 font-serif text-gold">Care Instructions</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{product.careInstructions}</p>
            </div>
          )}
        </div>
      </main>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="bg-[#3B0614] border-t border-gold/15 py-12 px-4 mt-16 w-full">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl text-gold font-bold tracking-wide inline-block relative pb-2">
                Related Products
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[1.5px] bg-gold/60" />
              </h2>
            </div>

            {/* Slider container */}
            <div className="relative group px-0 md:px-10">
              {/* Navigation Arrows for Desktop */}
              <button
                onClick={() => {
                  const slider = document.getElementById('related-slider');
                  if (slider) slider.scrollLeft -= 300;
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-maroon-dark/80 border border-gold/20 hover:bg-gold hover:text-maroon-dark text-gold p-2.5 rounded-full hidden md:block transition-all shadow-lg active:scale-95"
              >
                <FiChevronLeft className="text-xl" />
              </button>
              <button
                onClick={() => {
                  const slider = document.getElementById('related-slider');
                  if (slider) slider.scrollLeft += 300;
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-maroon-dark/80 border border-gold/20 hover:bg-gold hover:text-maroon-dark text-gold p-2.5 rounded-full hidden md:block transition-all shadow-lg active:scale-95"
              >
                <FiChevronRight className="text-xl" />
              </button>

              {/* Slider list */}
              <div
                id="related-slider"
                className="flex overflow-x-auto gap-4 pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x"
              >
                {relatedProducts.map((p) => {
                  const image = p.thumbnail || p.variants?.[0]?.images?.[0]?.url || '/images/placeholder.png';
                  return (
                    <Link
                      key={p._id}
                      href={`/product/${p.slug}`}
                      className="w-[50vw] sm:w-[30vw] md:w-[220px] flex-shrink-0 snap-start bg-maroon-dark/30 border border-gold/10 rounded-2xl overflow-hidden group/card hover:border-gold/30 transition-all duration-300 flex flex-col justify-between shadow-md"
                    >
                      <div className="relative aspect-[3/4] bg-maroon overflow-hidden">
                        {image && (
                          <Image
                            src={image}
                            alt={p.title}
                            fill
                            className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        )}
                        {p.discountPercent > 0 && (
                          <span className="absolute top-2 left-2 bg-gold text-maroon-dark text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            {p.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                      <div className="p-3 bg-[#3B0614] flex-1 flex flex-col justify-between">
                        <h3 className="text-cream font-medium text-xs md:text-sm line-clamp-2 min-h-[40px] group-hover/card:text-gold transition-colors duration-300">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gold font-bold text-sm md:text-base">₹{p.price?.toLocaleString('en-IN')}</span>
                          {p.mrp > p.price && (
                            <span className="text-cream/40 text-[10px] md:text-xs line-through">₹{p.mrp?.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
}
