'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import AuthGuard from '../../components/AuthGuard';
import Header from '../../components/Header';
import api from '../../lib/api';

const TABS = ['All', 'Placed', 'Processing', 'Shipped', 'Delivered'];

const statusColor = {
  Placed: 'text-yellow-400',
  Confirmed: 'text-blue-400',
  Processing: 'text-blue-400',
  Shipped: 'text-purple-400',
  Delivered: 'text-green-400',
  Cancelled: 'text-red-400',
  Returned: 'text-red-400',
};

function MyOrdersContent() {
  const [tab, setTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/orders', { params: { status: tab } }).then(({ data }) => {
      if (data.success) setOrders(data.orders);
      setLoading(false);
    });
  }, [tab]);

  return (
    <>
      <div className="flex gap-2.5 mb-6 overflow-x-auto scrollbar-none pb-2 scroll-smooth">
        {TABS.map((t) => (
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

      {loading ? (
        <p className="text-cream/50">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-cream/50 text-center py-10">No orders found</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o._id} href={`/orders/${o._id}`} className="card p-4 block">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-cream font-medium">Order ID: #{o.orderNumber}</p>
                  <p className="text-cream/50 text-xs">
                    Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-sm font-medium ${statusColor[o.orderStatus]}`}>{o.orderStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {o.items.slice(0, 2).map((item, i) => (
                    <div key={i} className="w-10 h-12 rounded bg-maroon overflow-hidden relative">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                  ))}
                  <span className="text-cream/50 text-xs self-center">{o.items.length} item{o.items.length > 1 ? 's' : ''}</span>
                </div>
                <span className="text-gold font-semibold">₹{o.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-10">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold">My Orders</h1>
          </div>
          <MyOrdersContent />
        </main>
      </div>
    </AuthGuard>
  );
}
