'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiClock, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
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

  useEffect(() => {
    adminApi.get('/admin/orders/stats').then(({ data }) => {
      if (data.success) setStats(data.stats);
    });
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <h1 className="font-serif text-2xl text-cream font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiShoppingBag} label="Total Orders" value={stats?.totalOrders ?? '—'} color="text-gold" />
        <StatCard icon={FiClock} label="Pending Confirmation" value={stats?.pendingConfirmation ?? '—'} color="text-yellow-400" />
        <StatCard icon={FiDollarSign} label="Total Revenue (Paid)" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} color="text-green-400" />
        <StatCard icon={FiAlertCircle} label="Pending Payments" value={stats?.pendingPayments ?? '—'} color="text-red-400" />
      </div>

      {stats?.statusBreakdown && (
        <div className="card p-5 mb-8">
          <h2 className="text-cream font-medium mb-4">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-gold text-xl font-bold">{count}</p>
                <p className="text-cream/60 text-xs">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <Link href="/admin/orders" className="btn-primary">View Orders</Link>
        <Link href="/admin/products/new" className="btn-secondary">+ Add Product</Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1"><DashboardContent /></main>
      </div>
    </AdminGuard>
  );
}
