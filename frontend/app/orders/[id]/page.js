'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import api from '../../../lib/api';

function OrderDetailContent() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/orders/${id}`);
    if (data.success) setOrder(data.order);
  };

  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      if (data.success) {
        toast.success('Order cancelled');
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!order) return <p className="text-cream/50">Loading...</p>;

  const canCancel = ['Placed', 'Confirmed', 'Processing'].includes(order.orderStatus);

  return (
    <>
      <div className="card p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-cream font-medium">Order ID: #{order.orderNumber}</h2>
            <p className="text-cream/50 text-xs">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <span className="bg-gold/20 text-gold text-xs font-semibold px-2 py-1 rounded">{order.orderStatus}</span>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="text-cream font-medium mb-2">Delivery Address</h3>
        <p className="text-cream text-sm">{order.shippingAddress.fullName}</p>
        <p className="text-cream/60 text-sm">{order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
        <p className="text-cream/60 text-sm">{order.shippingAddress.mobile}</p>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="text-cream font-medium mb-3">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-12 h-14 rounded bg-maroon overflow-hidden flex-shrink-0">
                {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-cream text-sm">{item.title}</p>
                <p className="text-cream/50 text-xs">{item.color}, {item.size} • Qty: {item.quantity}</p>
              </div>
              <span className="text-gold text-sm font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 mb-6 space-y-2 text-sm">
        <h3 className="text-cream font-medium mb-2">Price Details</h3>
        <div className="flex justify-between text-cream/70"><span>Total MRP</span><span>₹{order.totalMRP.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/70"><span>Discount</span><span className="text-green-400">-₹{order.discountOnMRP.toLocaleString('en-IN')}</span></div>
        {order.couponDiscount > 0 && <div className="flex justify-between text-cream/70"><span>Coupon ({order.couponCode})</span><span className="text-green-400">-₹{order.couponDiscount.toLocaleString('en-IN')}</span></div>}
        <div className="flex justify-between text-cream/70"><span>Shipping Charges</span><span>₹{order.shippingCharges}</span></div>
        <div className="border-t border-gold/20 pt-2 flex justify-between text-cream font-bold"><span>Total Amount</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-cream/50 text-xs pt-2"><span>Payment Method</span><span>{order.paymentMethod}</span></div>
        <div className="flex justify-between text-cream/50 text-xs"><span>Payment Status</span><span>{order.paymentStatus}</span></div>
      </div>

      {order.trackingId && (
        <div className="card p-4 mb-6">
          <h3 className="text-cream font-medium mb-1">Tracking Info</h3>
          <p className="text-cream/70 text-sm">Courier: {order.courierPartner}</p>
          <p className="text-cream/70 text-sm">Tracking ID: {order.trackingId}</p>
        </div>
      )}

      {order.orderStatus === 'Awaiting Payment Verification' && !order.utrNumber && (
        <Link 
          href={`/checkout/pay/${order._id}`} 
          className="btn-primary w-full text-center block mb-3 text-sm py-3"
        >
          Complete Payment / Submit Proof
        </Link>
      )}

      {canCancel && (
        <button onClick={handleCancel} disabled={cancelling} className="btn-secondary w-full text-red-400 border-red-400/50">
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-10">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold">Order Details</h1>
          </div>
          <OrderDetailContent />
        </main>
      </div>
    </AuthGuard>
  );
}
