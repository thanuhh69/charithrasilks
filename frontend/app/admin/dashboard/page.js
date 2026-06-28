'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiClock, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 border border-gold/15">
      <div className="flex items-center justify-between mb-3">
        <span className="text-cream/60 text-sm">{label}</span>
        <Icon className={`text-xl ${color}`} />
      </div>
      <p className="text-2xl font-bold text-cream">{value}</p>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [productStats, setProductStats] = useState(null);

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/orders/stats'),
      adminApi.get('/admin/products/stats'),
    ]).then(([orderRes, productRes]) => {
      if (orderRes.data.success) setStats(orderRes.data.stats);
      if (productRes.data.success) setProductStats(productRes.data.stats);
    }).catch(err => console.error('Failed to load dashboard statistics', err));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 text-cream">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-gold font-normal tracking-wide">Dashboard</h1>
        <p className="text-cream/50 text-xs mt-1">Overview of orders, revenue, and product inventory statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiShoppingBag} label="Total Orders" value={stats?.totalOrders ?? '—'} color="text-gold" />
        <StatCard icon={FiClock} label="Pending Confirmation" value={stats?.pendingConfirmation ?? '—'} color="text-yellow-400" />
        <StatCard icon={FiDollarSign} label="Total Revenue (Paid)" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} color="text-green-400" />
        <StatCard icon={FiAlertCircle} label="Pending Payments" value={stats?.pendingPayments ?? '—'} color="text-red-400" />
      </div>

      {stats?.statusBreakdown && (
        <div className="card p-5 border border-gold/15">
          <h2 className="text-gold font-serif text-base font-semibold mb-4 border-b border-gold/10 pb-1.5">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center p-2.5 bg-maroon-dark/10 rounded-lg border border-gold/5">
                <p className="text-gold text-xl font-bold">{count}</p>
                <p className="text-cream/60 text-xs mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Statistics */}
      {productStats && (
        <div className="space-y-4">
          <h2 className="text-gold font-serif text-base font-semibold border-b border-gold/15 pb-1.5">Product Inventory Statistics</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sarees stats */}
            <div className="card p-5 border border-gold/15 bg-[#2B0008]/20 flex flex-col justify-between">
              <h3 className="text-gold font-serif text-sm font-semibold border-b border-gold/10 pb-1.5 mb-4 uppercase tracking-wider">Sarees</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-cream font-bold text-lg">{productStats.Saree?.total ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Total</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-green-400 font-bold text-lg">{productStats.Saree?.active ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Active</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-red-400 font-bold text-lg">{productStats.Saree?.outOfStock ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Out of stock</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-gold font-bold text-lg">{productStats.Saree?.featured ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Featured</p>
                </div>
              </div>
              <Link href="/admin/products" className="text-gold text-xs font-semibold hover:underline block text-center mt-5">Manage Sarees &rarr;</Link>
            </div>

            {/* Accessories stats */}
            <div className="card p-5 border border-gold/15 bg-[#2B0008]/20 flex flex-col justify-between">
              <h3 className="text-gold font-serif text-sm font-semibold border-b border-gold/10 pb-1.5 mb-4 uppercase tracking-wider">Accessories</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-cream font-bold text-lg">{productStats.Accessory?.total ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Total</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-green-400 font-bold text-lg">{productStats.Accessory?.active ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Active</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-red-400 font-bold text-lg">{productStats.Accessory?.outOfStock ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Out of stock</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-gold font-bold text-lg">{productStats.Accessory?.featured ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Featured</p>
                </div>
              </div>
              <Link href="/admin/accessories" className="text-gold text-xs font-semibold hover:underline block text-center mt-5">Manage Accessories &rarr;</Link>
            </div>

            {/* Herbal Products stats */}
            <div className="card p-5 border border-gold/15 bg-[#2B0008]/20 flex flex-col justify-between">
              <h3 className="text-gold font-serif text-sm font-semibold border-b border-gold/10 pb-1.5 mb-4 uppercase tracking-wider">Herbal Products</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-cream font-bold text-lg">{productStats.Herbal?.total ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Total</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-green-400 font-bold text-lg">{productStats.Herbal?.active ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Active</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-red-400 font-bold text-lg">{productStats.Herbal?.outOfStock ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Out of stock</p>
                </div>
                <div className="p-2 bg-maroon-dark/20 rounded border border-gold/5">
                  <p className="text-gold font-bold text-lg">{productStats.Herbal?.featured ?? 0}</p>
                  <p className="text-cream/50 text-[10px] uppercase font-mono mt-0.5">Featured</p>
                </div>
              </div>
              <Link href="/admin/herbal-products" className="text-gold text-xs font-semibold hover:underline block text-center mt-5">Manage Herbal &rarr;</Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap border-t border-gold/15 pt-6">
        <Link href="/admin/orders" className="btn-primary">View Orders</Link>
        <Link href="/admin/products" className="btn-secondary">Manage Sarees</Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#130305]">
        <AdminSidebar />
        <main className="flex-1"><DashboardContent /></main>
      </div>
    </AdminGuard>
  );
}
