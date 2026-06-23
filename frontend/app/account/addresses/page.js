'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import api from '../../../lib/api';

const STATES = ['Andhra Pradesh','Telangana','Tamil Nadu','Karnataka','Kerala','Maharashtra','Delhi','Gujarat','West Bengal','Uttar Pradesh','Other'];

function AddressesContent() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ fullName: '', mobile: '', addressLine: '', city: '', state: '', pincode: '' });

  const load = async () => {
    const { data } = await api.get('/addresses');
    if (data.success) setAddresses(data.addresses);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/addresses/${editId}`, form);
        toast.success('Address updated');
      } else {
        await api.post('/addresses', { ...form, label: 'Home' });
        toast.success('Address added');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ fullName: '', mobile: '', addressLine: '', city: '', state: '', pincode: '' });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEdit = (a) => {
    setForm({ fullName: a.fullName, mobile: a.mobile, addressLine: a.addressLine, city: a.city, state: a.state, pincode: a.pincode });
    setEditId(a._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    await api.delete(`/addresses/${id}`);
    toast.success('Address deleted');
    await load();
  };

  return (
    <>
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full mb-6">+ Add New Address</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 card p-4 mb-6">
          <input required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
          <input required placeholder="Mobile Number" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g,'') })} className="input-field" />
          <textarea required placeholder="House no, Street, Area" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} className="input-field" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
            <input required placeholder="Pin code" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g,'') })} className="input-field" />
          </div>
          <select required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field">
            <option value="">Select state</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a._id} className="card p-4">
            <div className="flex justify-between">
              <span className="text-gold font-medium">{a.label} {a.isDefault && <span className="text-xs text-cream/50">(Default)</span>}</span>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(a)} className="text-cream/60 hover:text-gold"><FiEdit2 /></button>
                <button onClick={() => handleDelete(a._id)} className="text-cream/60 hover:text-red-400"><FiTrash2 /></button>
              </div>
            </div>
            <p className="text-cream text-sm mt-1">{a.fullName}</p>
            <p className="text-cream/60 text-sm">{a.addressLine}, {a.city}, {a.state} - {a.pincode}</p>
            <p className="text-cream/60 text-sm">{a.mobile}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-10">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold">My Addresses</h1>
          </div>
          <AddressesContent />
        </main>
      </div>
    </AuthGuard>
  );
}
