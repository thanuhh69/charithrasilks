'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import AuthGuard from '../../components/AuthGuard';
import Header from '../../components/Header';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';

function CheckoutSteps({ current }) {
  const steps = ['Cart', 'Address', 'Payment'];
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i < current ? 'bg-green-600 text-white' : i === current ? 'bg-gold text-maroon-dark' : 'bg-cream/10 text-cream/40'
            }`}
          >
            {i < current ? <FiCheckCircle /> : i + 1}
          </div>
          <span className={`text-sm ${i === current ? 'text-cream' : 'text-cream/40'}`}>{s}</span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-cream/20" />}
        </div>
      ))}
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { cart } = useCart();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    api.get('/addresses').then(({ data }) => {
      if (data.success) setAddresses(data.addresses);
    });
  }, []);

  const shipping = cart.summary.totalAmount >= 999 ? 0 : 99;
  const total = cart.summary.totalAmount + shipping;

  const handleContinue = () => {
    router.push('/checkout/address');
  };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-cream/60">Your cart is empty</p>
      </div>
    );
  }

  return (
    <>
      <CheckoutSteps current={0} />
      <h2 className="text-cream font-medium mb-4">Product Details</h2>
      <div className="space-y-3 mb-6">
        {cart.items.map((item) => (
          <div key={item._id} className="card p-3 flex gap-3">
            <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-maroon flex-shrink-0">
              {item.image && <Image src={item.image} alt="" fill className="object-cover" unoptimized />}
            </div>
            <div className="flex-1">
              <p className="text-cream text-sm font-medium">{item.product.title}</p>
              <p className="text-cream/50 text-xs">{item.color}, {item.size}</p>
              <p className="text-cream/50 text-xs">Qty: {item.quantity}</p>
            </div>
            <span className="text-gold font-semibold">₹{(item.currentPrice * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-6 space-y-2 text-sm">
        <div className="flex justify-between text-cream/70"><span>Total MRP</span><span>₹{cart.summary.totalMRP.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/70"><span>Discount on MRP</span><span className="text-green-400">-₹{cart.summary.discountOnMRP.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/70"><span>Shipping Charges</span><span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
        <div className="border-t border-gold/20 pt-2 flex justify-between text-cream font-bold"><span>Total Amount</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </div>

      <button onClick={handleContinue} className="btn-primary w-full">Continue</button>
    </>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-10">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold">Checkout</h1>
          </div>
          <CheckoutContent />
        </main>
      </div>
    </AuthGuard>
  );
}
