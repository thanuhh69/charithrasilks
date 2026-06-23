'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, fetchCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const router = useRouter();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const { data } = await api.post('/cart/apply-coupon', { code: couponCode.trim() });
      if (data.success) {
        setCouponDiscount(data.couponDiscount);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplying(false);
    }
  };

  const shipping = cart.summary.totalAmount >= 999 ? 0 : 99;
  const finalTotal = cart.summary.totalAmount - couponDiscount + shipping;

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gold text-xl">
            <FiArrowLeft />
          </button>
          <h1 className="font-serif text-2xl text-cream font-semibold">My Cart ({cart.summary.itemCount})</h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-cream/60 mb-4">Your cart is empty</p>
            <Link href="/" className="btn-primary inline-block">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item._id} className="card p-4 flex gap-4">
                  <div className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-maroon">
                    {item.image && <Image src={item.image} alt={item.product.title} fill className="object-cover" unoptimized />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <Link href={`/product/${item.product.slug}`} className="text-cream font-medium text-sm hover:text-gold">
                        {item.product.title}
                      </Link>
                      <button onClick={() => removeItem(item._id)} className="text-cream/50 hover:text-red-400">
                        <FiTrash2 />
                      </button>
                    </div>
                    <p className="text-cream/50 text-xs mt-1">{item.color}, {item.size}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-gold/30 rounded-lg px-2 py-1">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="text-gold">
                          <FiMinus size={14} />
                        </button>
                        <span className="text-cream text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="text-gold">
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <span className="text-gold font-bold">₹{(item.currentPrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-4 mb-6">
              <h3 className="text-cream font-medium mb-3">Apply Coupon</h3>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="input-field flex-1"
                />
                <button onClick={handleApplyCoupon} disabled={applying} className="btn-secondary">
                  {applying ? '...' : 'Apply'}
                </button>
              </div>
            </div>

            <div className="card p-4 mb-6">
              <h3 className="text-cream font-medium mb-3">Price Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-cream/70">
                  <span>Total MRP</span>
                  <span>₹{cart.summary.totalMRP.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span>Discount on MRP</span>
                  <span className="text-green-400">-₹{cart.summary.discountOnMRP.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-cream/70">
                    <span>Coupon Discount</span>
                    <span className="text-green-400">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-cream/70">
                  <span>Shipping Charges</span>
                  <span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="border-t border-gold/20 pt-2 flex justify-between text-cream font-bold text-base">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </main>
    </div>
  );
}
