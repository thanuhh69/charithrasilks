'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiX, FiLoader, FiEye, FiAlertCircle, FiClipboard, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function VerificationContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      // Fetch orders awaiting payment verification
      const { data } = await adminApi.get('/admin/orders', {
        params: { status: 'Awaiting Payment Verification', limit: 100 }
      });
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (id) => {
    if (!confirm('Verify payment and CONFIRM this order?')) return;
    setBusyId(id);
    try {
      const { data } = await adminApi.put(`/admin/orders/${id}/verify-payment`);
      if (data.success) {
        toast.success('Payment verified! Order confirmed.');
        load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not verify payment');
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    const id = rejectId;
    setRejectId(null);
    setBusyId(id);
    try {
      const { data } = await adminApi.put(`/admin/orders/${id}/reject-payment`, {
        reason: rejectReason.trim()
      });
      if (data.success) {
        toast.success('Payment rejected. Order failed.');
        setRejectReason('');
        load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not reject payment');
    } finally {
      setBusyId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied UTR to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <FiLoader className="animate-spin text-gold text-4xl mb-4" />
        <p className="text-cream/60">Loading verification queue...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-2xl text-cream font-semibold">Payment Verification</h1>
          <p className="text-cream/50 text-xs mt-1">Verify manual customer UPI transfers using UTR and screenshots</p>
        </div>
        <span className="bg-gold/20 text-gold text-xs font-semibold px-3 py-1.5 rounded-full border border-gold/25">
          {orders.length} Pending Approval
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto my-10">
          <FiCheck className="text-green-400 text-5xl mx-auto mb-4" />
          <h2 className="text-cream font-medium text-lg mb-2">Queue is Clear!</h2>
          <p className="text-cream/50 text-sm">There are no orders awaiting payment verification right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((o) => (
            <div key={o._id} className="card p-5 border border-gold/15 flex flex-col md:flex-row gap-5 justify-between">
              {/* Order Info & Customer Details */}
              <div className="space-y-3.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-gold font-bold font-serif text-base">#{o.orderNumber}</span>
                  <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-yellow-500/20">
                    Awaiting Verification
                  </span>
                  <span className="text-cream/40 text-xs">
                    Placed: {new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-cream/50 uppercase tracking-wider text-[10px]">Customer Profile</p>
                    <p className="text-cream font-medium">{o.user?.name || '—'}</p>
                    <p className="text-cream/70">{o.user?.mobile || o.user?.email || '—'}</p>
                    <p className="text-cream/50">Address: {o.shippingAddress?.fullName}, Pin: {o.shippingAddress?.pincode}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-cream/50 uppercase tracking-wider text-[10px]">Payment Details</p>
                    <p className="text-gold font-bold text-sm">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-cream/70">Method: {o.paymentMethod === 'UPI_APP' ? 'UPI App Link' : 'Scan QR Code'}</p>
                    {o.paymentSubmissionTime && (
                      <p className="text-cream/40">Submitted: {new Date(o.paymentSubmissionTime).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                </div>

                {/* UTR Number */}
                <div className="bg-maroon-dark/40 border border-gold/10 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cream/40 block">SUBMITTED UTR / TRANSACTION ID</span>
                    <span className="font-mono text-sm text-gold font-semibold tracking-wider">
                      {o.utrNumber || 'Not Submitted Yet'}
                    </span>
                  </div>
                  {o.utrNumber && (
                    <button 
                      onClick={() => copyToClipboard(o.utrNumber)}
                      className="text-cream/50 hover:text-gold transition p-1.5 rounded hover:bg-gold/10"
                      title="Copy UTR ID"
                    >
                      <FiClipboard size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Receipt Image Screenshot */}
              <div className="w-full md:w-36 flex flex-col items-center justify-center gap-2 flex-shrink-0">
                {o.paymentScreenshot ? (
                  <div 
                    onClick={() => setLightboxUrl(o.paymentScreenshot)}
                    className="group relative w-32 h-36 rounded-lg overflow-hidden bg-maroon border border-gold/15 cursor-pointer shadow-md"
                  >
                    <img src={o.paymentScreenshot} alt="Payment Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiEye className="text-white text-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-36 rounded-lg bg-maroon-dark/20 border border-dashed border-gold/10 flex flex-col items-center justify-center text-center p-3">
                    <FiImage className="text-cream/20 text-3xl mb-1" />
                    <span className="text-[10px] text-cream/40">No receipt image uploaded</span>
                  </div>
                )}
                {o.paymentScreenshot && (
                  <button 
                    onClick={() => setLightboxUrl(o.paymentScreenshot)}
                    className="text-gold text-[10px] font-medium hover:underline flex items-center gap-1"
                  >
                    <FiEye size={10} /> View Screenshot
                  </button>
                )}
              </div>

              {/* Verification Controls */}
              <div className="w-full md:w-44 flex flex-col justify-center gap-2.5 flex-shrink-0 border-t md:border-t-0 md:border-l border-gold/10 pt-4 md:pt-0 md:pl-5">
                <button
                  disabled={busyId === o._id}
                  onClick={() => handleVerify(o._id)}
                  className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  {busyId === o._id ? (
                    <FiLoader className="animate-spin text-maroon-dark" />
                  ) : (
                    <>
                      <FiCheck size={14} />
                      <span>Verify Payment</span>
                    </>
                  )}
                </button>

                <button
                  disabled={busyId === o._id}
                  onClick={() => setRejectId(o._id)}
                  className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <FiX size={14} />
                  <span>Reject Payment</span>
                </button>

                <Link href={`/admin/orders/${o._id}`} className="text-center text-cream/40 hover:text-cream text-[10px] hover:underline mt-1 block">
                  View Full Order Info
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img src={lightboxUrl} alt="Zoomed Receipt" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg border border-gold/25" />
            <button 
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gold text-sm font-semibold flex items-center gap-1"
            >
              <FiX /> Close
            </button>
          </div>
        </div>
      )}

      {/* Rejection Details Form Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm border border-red-500/20">
            <h3 className="font-serif text-lg text-cream font-semibold mb-2 flex items-center gap-2">
              <FiAlertCircle className="text-red-400" /> Reject Payment Proof
            </h3>
            <p className="text-cream/50 text-xs mb-4">Please specify a reason. The customer will see this note in their status history.</p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="e.g. UTR matches an older transaction / screenshot is unreadable / amount received is incorrect"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field py-2 text-sm"
              />

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setRejectId(null); setRejectReason(''); }}
                  className="btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full flex-1 py-2 text-xs transition"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentVerificationPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1">
          <VerificationContent />
        </main>
      </div>
    </AdminGuard>
  );
}
