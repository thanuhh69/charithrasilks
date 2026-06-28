'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

function OrderSuccessContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      if (data.success) setOrder(data.order);
    });
  }, [id]);

  if (!order) {
    return <div className="text-center py-20 text-cream/60">Loading order...</div>;
  }

  const deliveryDate = order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : null;

  const isAwaitingVerification = order.orderStatus === 'Awaiting Payment Verification';

  return (
    <div className="card p-8 text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-6">
        <FiCheck className="text-gold text-3xl" />
      </div>

      {isAwaitingVerification ? (
        <>
          <h1 className="font-serif text-2xl text-gold font-bold mb-2">Payment Submitted Successfully!</h1>
          <p className="text-cream/80 text-sm mb-6">Our team will verify it shortly.</p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-2xl text-gold font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-cream/50 text-sm mb-1">We have sent the order details to your</p>
          <p className="text-cream mb-6">{user?.mobile || user?.email}</p>
        </>
      )}

      <p className="text-cream/70 mb-1">Order ID: #{order.orderNumber}</p>

      <p className="text-cream/50 text-sm mt-4">Delivery Expected</p>
      <p className="text-gold font-semibold mb-8">
        {deliveryDate ? `${deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : '2 - 4 Days'}
      </p>

      <div className="space-y-3">
        <Link href={`/orders/${order._id}`} className="btn-primary block">View Order</Link>
        <Link href="/" className="btn-secondary block">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Header />
        <main className="px-4 py-10">
          <OrderSuccessContent />
        </main>
      </div>
    </AuthGuard>
  );
}
