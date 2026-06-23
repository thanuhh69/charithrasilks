'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import api from '../../../lib/api';

const STATES = ['Andhra Pradesh','Telangana','Tamil Nadu','Karnataka','Kerala','Maharashtra','Delhi','Gujarat','West Bengal','Uttar Pradesh','Other'];

function CheckoutAddressContent() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', mobile: '', addressLine: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/addresses');
    if (data.success) {
      setAddresses(data.addresses);
      const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
      if (def) setSelectedId(def._id);
      if (data.addresses.length === 0) setShowForm(true);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/addresses', { ...form, label: 'Home' });
      if (data.success) {
        toast.success('Address saved');
        setShowForm(false);
        setForm({ fullName: '', mobile: '', addressLine: '', city: '', state: '', pincode: '' });
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (!selectedId) {
      toast.error('Please select or add an address');
      return;
    }
    router.push(`/checkout/payment?addressId=${selectedId}`);
  };

  return (
    <>
      {addresses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-cream font-medium mb-3">Saved Addresses</h2>
          <div className="space-y-3">
            {addresses.map((a) => (
              <button
                key={a._id}
                onClick={() => setSelectedId(a._id)}
                className={`card w-full text-left p-4 ${selectedId === a._id ? 'border-gold' : ''}`}
              >
                <div className="flex justify-between">
                  <span className="text-gold font-medium">{a.label}</span>
                  {selectedId === a._id && <span className="text-gold">●</span>}
                </div>
                <p className="text-cream text-sm mt-1">{a.fullName}</p>
                <p className="text-cream/60 text-sm">{a.addressLine}, {a.city}, {a.state} - {a.pincode}</p>
                <p className="text-cream/60 text-sm">Mobile: {a.mobile}</p>
              </button>
            ))}
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="text-gold text-sm mt-3">+ Add New Address</button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSaveAddress} className="space-y-3 card p-4 mb-6">
          <h3 className="text-cream font-medium mb-2">Add New Address</h3>
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
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      )}

      {!showForm && (
        <button onClick={handleContinue} className="btn-primary w-full">Continue</button>
      )}
    </>
  );
}

export default function CheckoutAddressPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-10">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-semibold">Add Address</h1>
          </div>
          <CheckoutAddressContent />
        </main>
      </div>
    </AuthGuard>
  );
}
