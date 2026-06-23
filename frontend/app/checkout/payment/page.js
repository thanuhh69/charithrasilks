'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import { useCart } from '../../../context/CartContext';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get('addressId');
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();

  const [method, setMethod] = useState('UPI');
  const [placing, setPlacing] = useState(false);

  const shipping = cart.summary.totalAmount >= 999 ? 0 : 99;
  const total = cart.summary.totalAmount + shipping;

  const placeOrderDirect = async (extra = {}) => {
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        addressId,
        paymentMethod: method,
        ...extra,
      });
      if (data.success) {
        await fetchCart();
        router.push(`/order-success/${data.order._id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setPlacing(true);
    try {
      const { data } = await api.post('/orders/razorpay/create');
      if (!data.success) throw new Error(data.message);

      const { razorpayOrder, keyId } = data;

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Charithra Silks',
        description: 'Saree Purchase',
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || '',
        },
        theme: { color: '#d4af37' },
        handler: async function (response) {
          await placeOrderDirect({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment gateway not configured yet');
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!addressId) {
      toast.error('Please select an address first');
      return;
    }
    if (method === 'Razorpay') {
      handleRazorpayPayment();
    } else {
      placeOrderDirect();
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="card p-4 mb-6 space-y-2 text-sm">
        <h2 className="text-cream font-medium mb-2">Order Summary</h2>
        <div className="flex justify-between text-cream/70"><span>Total MRP</span><span>₹{cart.summary.totalMRP.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/70"><span>Discount on MRP</span><span className="text-green-400">-₹{cart.summary.discountOnMRP.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/70"><span>Shipping Charges</span><span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
        <div className="border-t border-gold/20 pt-2 flex justify-between text-cream font-bold"><span>Total Amount</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </div>

      <h2 className="text-cream font-medium mb-3">Payment Methods</h2>
      <div className="space-y-3 mb-8">
        {[
          { id: 'UPI', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
          { id: 'Razorpay', label: 'Razorpay (Cards, NetBanking, Wallets)', desc: '' },
          { id: 'COD', label: 'Cash on Delivery', desc: '' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`card w-full text-left p-4 flex items-center justify-between ${method === m.id ? 'border-gold' : ''}`}
          >
            <div>
              <p className="text-cream font-medium">{m.label}</p>
              {m.desc && <p className="text-cream/50 text-xs">{m.desc}</p>}
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-gold' : 'border-cream/30'}`}>
              {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
            </div>
          </button>
        ))}
      </div>

      <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full">
        {placing ? 'Processing...' : 'Place Order'}
      </button>
      <p className="text-center text-cream/40 text-xs mt-3">🔒 100% Secure Payments</p>
    </>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-10">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold">Payment</h1>
          </div>
          <PaymentContent />
        </main>
      </div>
    </AuthGuard>
  );
}
