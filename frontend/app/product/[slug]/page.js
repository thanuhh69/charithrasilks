'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiStar, FiHeart } from 'react-icons/fi';
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
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.product);
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gold">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cream/60">Product not found</p>
      </div>
    );
  }

  const variant = product.variants[selectedVariant];

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
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
      router.push('/login?redirect=/checkout');
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size');
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
    <div className="min-h-screen pb-24 md:pb-0">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-maroon mb-3">
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
          <div className="flex gap-2">
            {variant?.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 ${
                  i === activeImage ? 'border-gold' : 'border-transparent'
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="font-serif text-2xl text-cream font-semibold">{product.title}</h1>
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
                    setSelectedSize(null);
                  }}
                  className={`w-9 h-9 rounded-lg border-2 ${
                    i === selectedVariant ? 'border-gold scale-110' : 'border-cream/20'
                  }`}
                  style={{ backgroundColor: v.colorHex }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-cream/80 text-sm">Size: {selectedSize || 'Select Size'}</p>
            </div>
            <div className="flex gap-2">
              {variant?.sizes.map((s) => (
                <button
                  key={s.size}
                  disabled={s.stock === 0}
                  onClick={() => setSelectedSize(s.size)}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    selectedSize === s.size
                      ? 'border-gold bg-gold/20 text-gold'
                      : s.stock === 0
                      ? 'border-cream/10 text-cream/30 cursor-not-allowed'
                      : 'border-gold/30 text-cream'
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={handleAddToCart} className="btn-secondary flex-1">Add to Cart</button>
            <button onClick={handleBuyNow} className="btn-primary flex-1">Buy Now</button>
          </div>

          {product.description && (
            <div className="mt-8">
              <h3 className="text-cream font-medium mb-2">Description</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.careInstructions && (
            <div className="mt-4">
              <h3 className="text-cream font-medium mb-2">Care Instructions</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{product.careInstructions}</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
