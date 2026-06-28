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

  const [method, setMethod] = useState('');
  const [placing, setPlacing] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    api.get('/payment-settings')
      .then(({ data }) => {
        if (data.success) {
          setSettings(data.settings);
          if (data.settings.enableUpiPayments) {
            setMethod('UPI_APP');
          } else if (data.settings.enableQrPayments) {
            setMethod('UPI_QR');
          }
        }
      })
      .catch(() => {
        toast.error('Failed to load payment configurations');
      })
      .finally(() => {
        setLoadingSettings(false);
      });
  }, []);

  const shipping = cart.summary.totalAmount >= 999 ? 0 : 99;
  const total = cart.summary.totalAmount + shipping;

  const placeOrderDirect = async () => {
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        addressId,
        paymentMethod: method,
      });
      if (data.success) {
        await fetchCart();
        router.push(`/checkout/pay/${data.order._id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!addressId) {
      toast.error('Please select an address first');
      return;
    }
    if (!method) {
      toast.error('Please select a payment method');
      return;
    }
    placeOrderDirect();
  };

  return (
    <>
      <div className="card p-4 mb-6 space-y-2 text-sm">
        <h2 className="text-cream font-medium mb-2">Order Summary</h2>
        <div className="flex justify-between text-cream/70"><span>Total MRP</span><span>₹{cart.summary.totalMRP.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/70"><span>Discount on MRP</span><span className="text-green-400">-₹{cart.summary.discountOnMRP.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/70"><span>Shipping Charges</span><span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
        <div className="border-t border-gold/20 pt-2 flex justify-between text-cream font-bold"><span>Total Amount</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </div>

      <h2 className="text-cream font-medium mb-3">Payment Methods</h2>
      <div className="space-y-3 mb-8">
        {loadingSettings ? (
          <div className="text-center py-6 text-cream/50">Loading payment methods...</div>
        ) : !settings || (!settings.enableUpiPayments && !settings.enableQrPayments) ? (
          <div className="text-center py-6 text-red-400/80 card p-4">
            No payment methods are currently available. Please contact support.
          </div>
        ) : (
          <>
            {settings.enableUpiPayments && (
              <button
                onClick={() => setMethod('UPI_APP')}
                className={`card w-full text-left p-4 flex items-center justify-between transition-all duration-300 hover:border-gold/50 ${
                  method === 'UPI_APP' ? 'border-gold bg-gold/5' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-cream font-medium">Pay with UPI Apps</p>
                    <span className="bg-gold/20 text-gold text-[10px] font-semibold px-2 py-0.5 rounded-full">Recommended</span>
                  </div>
                  <p className="text-cream/50 text-xs mt-1">Google Pay, PhonePe, Paytm, BHIM, Amazon Pay UPI</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'UPI_APP' ? 'border-gold' : 'border-cream/30'}`}>
                  {method === 'UPI_APP' && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                </div>
              </button>
            )}

            {settings.enableQrPayments && (
              <button
                onClick={() => setMethod('UPI_QR')}
                className={`card w-full text-left p-4 flex items-center justify-between transition-all duration-300 hover:border-gold/50 ${
                  method === 'UPI_QR' ? 'border-gold bg-gold/5' : ''
                }`}
              >
                <div>
                  <p className="text-cream font-medium">Scan & Pay QR Code</p>
                  <p className="text-cream/50 text-xs mt-1">Generate a dynamic QR code to scan and pay from any app</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'UPI_QR' ? 'border-gold' : 'border-cream/30'}`}>
                  {method === 'UPI_QR' && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                </div>
              </button>
            )}
          </>
        )}
      </div>

      <button onClick={handlePlaceOrder} disabled={placing || !method} className="btn-primary w-full">
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
