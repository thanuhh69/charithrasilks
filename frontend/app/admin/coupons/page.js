'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function CouponsContent() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percent', discountValue: '',
    minOrderValue: '', maxDiscountAmount: '', expiryDate: '', usageLimit: '',
  });

  const load = async () => {
    const { data } = await adminApi.get('/admin/coupons');
    if (data.success) setCoupons(data.coupons);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };
      await adminApi.post('/admin/coupons', payload);
      toast.success('Coupon created');
      setShowForm(false);
      setForm({ code: '', description: '', discountType: 'percent', discountValue: '', minOrderValue: '', maxDiscountAmount: '', expiryDate: '', usageLimit: '' });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await adminApi.delete(`/admin/coupons/${id}`);
    toast.success('Coupon deleted');
    await load();
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-cream font-semibold">Coupons</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><FiPlus /> Add Coupon</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-3 max-w-md">
          <input required placeholder="Coupon Code (e.g. SAVE20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input-field">
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
            <input required type="number" placeholder="Discount Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Min Order Value" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} className="input-field" />
            <input type="number" placeholder="Max Discount (optional)" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input-field" />
            <input type="number" placeholder="Usage Limit (optional)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 text-cream/60 text-left">
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Used</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-cream/50">No coupons found</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id} className="border-b border-gold/10">
                  <td className="p-4 text-gold font-medium">{c.code}</td>
                  <td className="p-4 text-cream/70">{c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="p-4 text-cream/70">₹{c.minOrderValue}</td>
                  <td className="p-4 text-cream/60">{new Date(c.expiryDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-4 text-cream/60">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td className="p-4"><button onClick={() => handleDelete(c._id)} className="text-red-400"><FiTrash2 size={14} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {coupons.length === 0 ? (
          <p className="text-center text-cream/50 py-6">No coupons found</p>
        ) : (
          coupons.map((c) => (
            <div key={c._id} className="card p-4 flex flex-col gap-3 border border-gold/15">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gold font-bold text-base tracking-wider block">{c.code}</span>
                  <span className="text-cream/50 text-xs block mt-0.5">{c.description || 'No description'}</span>
                </div>
                <button 
                  onClick={() => handleDelete(c._id)} 
                  className="text-red-400 hover:text-red-300 p-2 border border-red-500/10 rounded-lg hover:bg-red-500/5 transition"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-gold/10 text-xs">
                <div>
                  <span className="text-cream/50 block">Discount</span>
                  <span className="text-cream font-semibold">{c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}</span>
                </div>
                <div>
                  <span className="text-cream/50 block">Min Order</span>
                  <span className="text-cream font-semibold">₹{c.minOrderValue}</span>
                </div>
                <div>
                  <span className="text-cream/50 block">Used</span>
                  <span className="text-cream font-semibold">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</span>
                </div>
              </div>

              <div className="text-xs pt-2.5 border-t border-gold/5 flex justify-between items-center">
                <span className="text-cream/50">Expires</span>
                <span className="text-cream/80">{new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1"><CouponsContent /></main>
      </div>
    </AdminGuard>
  );
}
