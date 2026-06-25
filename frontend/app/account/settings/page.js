'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

function SettingsContent() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', { name, email });
      if (data.success) {
        toast.success('Settings updated successfully');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="input-label">Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field-icon"
              placeholder="Your Name"
            />
            <FiUser className="input-icon" />
          </div>
        </div>

        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field-icon"
              placeholder="email@example.com"
            />
            <FiMail className="input-icon" />
          </div>
        </div>

        <div>
          <label className="input-label text-cream/40">Verified Phone Number</label>
          <div className="relative opacity-60">
            <input
              type="text"
              disabled
              value={user?.mobile || 'Not Linked'}
              className="input-field-icon bg-maroon/20 cursor-not-allowed"
            />
            <FiPhone className="input-icon text-gold/40" />
          </div>
          <p className="text-[10px] text-cream/40 mt-2">Phone number cannot be changed as it is verified via OTP.</p>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full mt-4">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default function AccountSettingsPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl">
              <FiArrowLeft />
            </button>
            <h1 className="font-serif text-xl text-cream font-semibold">Account Settings</h1>
          </div>
          <SettingsContent />
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
