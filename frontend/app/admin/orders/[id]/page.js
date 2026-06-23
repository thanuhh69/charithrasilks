'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../../components/admin/AdminGuard';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import adminApi from '../../../../lib/adminApi';

const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

function OrderDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await adminApi.get(`/admin/orders/${id}`);
    if (data.success) {
      setOrder(data.order);
      setTrackingId(data.order.trackingId || '');
      setCourierPartner(data.order.courierPartner || '');
      setAdminNotes(data.order.adminNotes || '');
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      const { data } = await adminApi.put(`/admin/orders/${id}/confirm`);
      if (data.success) {
        toast.success('Order confirmed');
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not confirm order');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (status) => {
    setBusy(true);
    try {
      const { data } = await adminApi.put(`/admin/orders/${id}/status`, { status, trackingId, courierPartner });
      if (data.success) {
        toast.success(`Order marked as ${status}`);
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update status');
    } finally {
      setBusy(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus) => {
    setBusy(true);
    try {
      const { data } = await adminApi.put(`/admin/orders/${id}/payment-status`, { paymentStatus });
      if (data.success) {
        toast.success(`Payment marked as ${paymentStatus}`);
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update payment status');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await adminApi.put(`/admin/orders/${id}/notes`, { adminNotes });
      toast.success('Notes saved');
    } catch (err) {
      toast.error('Could not save notes');
    }
  };

  if (!order) return <p className="text-cream/50 p-8">Loading...</p>;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
        <h1 className="font-serif text-2xl text-cream font-semibold">Order #{order.orderNumber}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-cream font-medium mb-3">Customer</h2>
          <p className="text-cream/80 text-sm">{order.user?.name || '—'}</p>
          <p className="text-cream/60 text-sm">{order.user?.email || '—'}</p>
          <p className="text-cream/60 text-sm">{order.user?.mobile || '—'}</p>
        </div>
        <div className="card p-5">
          <h2 className="text-cream font-medium mb-3">Shipping Address</h2>
          <p className="text-cream/80 text-sm">{order.shippingAddress.fullName}</p>
          <p className="text-cream/60 text-sm">{order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          <p className="text-cream/60 text-sm">{order.shippingAddress.mobile}</p>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <h2 className="text-cream font-medium mb-3">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
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
        <div className="border-t border-gold/20 mt-4 pt-3 flex justify-between text-cream font-bold">
          <span>Total Amount</span>
          <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Confirmation */}
      {order.orderStatus === 'Placed' && (
        <div className="card p-5 mb-6 border-gold">
          <h2 className="text-cream font-medium mb-3">Order Confirmation</h2>
          <p className="text-cream/60 text-sm mb-3">This order is newly placed and awaiting confirmation.</p>
          <button onClick={handleConfirm} disabled={busy} className="btn-primary flex items-center gap-2">
            <FiCheckCircle /> Confirm Order
          </button>
        </div>
      )}

      {/* Status management */}
      <div className="card p-5 mb-6">
        <h2 className="text-cream font-medium mb-3">Order Status: <span className="text-gold">{order.orderStatus}</span></h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <input placeholder="Tracking ID" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="input-field" />
          <input placeholder="Courier Partner" value={courierPartner} onChange={(e) => setCourierPartner(e.target.value)} className="input-field" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              disabled={busy || order.orderStatus === s}
              onClick={() => handleStatusChange(s)}
              className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
            >
              Mark as {s}
            </button>
          ))}
        </div>
      </div>

      {/* Payment management */}
      <div className="card p-5 mb-6">
        <h2 className="text-cream font-medium mb-3">Payment Status: <span className="text-gold">{order.paymentStatus}</span></h2>
        <p className="text-cream/60 text-sm mb-3">Payment Method: {order.paymentMethod}</p>
        <div className="flex gap-2 flex-wrap">
          {PAYMENT_STATUSES.map((s) => (
            <button
              key={s}
              disabled={busy || order.paymentStatus === s}
              onClick={() => handlePaymentStatusChange(s)}
              className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
            >
              Mark as {s}
            </button>
          ))}
        </div>
      </div>

      {/* Status history */}
      <div className="card p-5 mb-6">
        <h2 className="text-cream font-medium mb-3">Status History</h2>
        <div className="space-y-2">
          {order.statusHistory.map((h, i) => (
            <div key={i} className="flex justify-between text-sm border-b border-gold/10 pb-2">
              <span className="text-cream/80">{h.status} — <span className="text-cream/50">{h.note}</span></span>
              <span className="text-cream/40 text-xs">{new Date(h.changedAt).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin notes */}
      <div className="card p-5">
        <h2 className="text-cream font-medium mb-3">Admin Notes</h2>
        <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="input-field mb-3" rows={3} placeholder="Internal notes about this order..." />
        <button onClick={handleSaveNotes} className="btn-secondary">Save Notes</button>
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1"><OrderDetailContent /></main>
      </div>
    </AdminGuard>
  );
}
