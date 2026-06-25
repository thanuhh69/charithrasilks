'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

const STATUS_TABS = ['All', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

const statusColor = {
  Placed: 'bg-yellow-500/20 text-yellow-400',
  Confirmed: 'bg-blue-500/20 text-blue-400',
  Processing: 'bg-blue-500/20 text-blue-400',
  Shipped: 'bg-purple-500/20 text-purple-400',
  Delivered: 'bg-green-500/20 text-green-400',
  Cancelled: 'bg-red-500/20 text-red-400',
  Returned: 'bg-red-500/20 text-red-400',
};

const paymentColor = {
  Pending: 'bg-yellow-500/20 text-yellow-400',
  Paid: 'bg-green-500/20 text-green-400',
  Failed: 'bg-red-500/20 text-red-400',
  Refunded: 'bg-gray-500/20 text-gray-400',
};

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await adminApi.get('/admin/orders', { params: { status: tab, search } });
    if (data.success) setOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [tab, search]);

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-serif text-2xl text-cream font-semibold mb-6">Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto scrollbar-none pb-2 scroll-smooth">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-10 px-5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center text-center ${
              tab === t 
                ? 'bg-gold text-maroon-dark font-semibold shadow-lg' 
                : 'bg-maroon-dark/60 text-cream/60 hover:bg-maroon-dark hover:text-cream'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID..."
          className="input-field-icon w-full"
        />
        <FiSearch className="input-icon" />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 text-cream/60 text-left">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-cream/50">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-cream/50">No orders found</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="border-b border-gold/10">
                  <td className="p-4 text-cream font-medium">#{o.orderNumber}</td>
                  <td className="p-4 text-cream/70">{o.user?.name || o.user?.mobile || o.user?.email || '—'}</td>
                  <td className="p-4 text-cream/60">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td className="p-4 text-gold font-medium">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-4"><span className={`text-xs font-semibold px-2 py-1 rounded ${paymentColor[o.paymentStatus]}`}>{o.paymentStatus}</span></td>
                  <td className="p-4"><span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor[o.orderStatus]}`}>{o.orderStatus}</span></td>
                  <td className="p-4">
                    <Link href={`/admin/orders/${o._id}`} className="text-gold hover:text-gold-light text-sm">View →</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <p className="text-center text-cream/50 py-6">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-cream/50 py-6">No orders found</p>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="card p-4 space-y-3.5 border border-gold/15">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-gold font-mono tracking-wider block">ORDER NUMBER</span>
                  <span className="text-base font-bold text-cream">#{o.orderNumber}</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[o.orderStatus]}`}>
                  {o.orderStatus}
                </span>
              </div>
              
              <div className="border-t border-gold/10 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-cream/50">Customer</span>
                  <span className="text-cream/90 font-medium truncate max-w-[180px]">
                    {o.user?.name || o.user?.mobile || o.user?.email || '—'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cream/50">Date</span>
                  <span className="text-cream/80">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cream/50">Payment Status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${paymentColor[o.paymentStatus]}`}>
                    {o.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-1.5 border-t border-gold/5 items-center">
                  <span className="text-gold font-medium">Total Amount</span>
                  <span className="text-gold font-bold text-base">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link 
                  href={`/admin/orders/${o._id}`} 
                  className="btn-primary py-2 px-5 text-xs font-semibold rounded-lg shadow-md hover:bg-gold-light transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1"><OrdersContent /></main>
      </div>
    </AdminGuard>
  );
}
