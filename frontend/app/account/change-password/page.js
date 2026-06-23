'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiLock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import adminApi from '../../../lib/adminApi';

export default function ChangePasswordPage() {
  const router = useRouter();
  const isAdmin = !!Cookies.get('adminToken'); // Check if logged in as admin

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setSaving(true);
    try {
      const { data } = await adminApi.put('/admin/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (data.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gold text-xl">
            <FiArrowLeft />
          </button>
          <h1 className="font-serif text-xl text-cream font-semibold">Change Password</h1>
        </div>

        {isAdmin ? (
          /* Admin Password Change Form */
          <div className="card p-6 space-y-4">
            <p className="text-xs text-gold font-serif">Logged in as Administrator</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-cream/70 text-xs block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/70" />
                </div>
              </div>

              <div>
                <label className="text-cream/70 text-xs block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/70" />
                </div>
              </div>

              <div>
                <label className="text-cream/70 text-xs block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/70" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        ) : (
          /* Storefront User Info screen (OTP/Google authentication method) */
          <div className="card p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold text-2xl mx-auto">
              <FiShield />
            </div>
            <div>
              <h3 className="text-cream font-medium">OTP & OAuth Security</h3>
              <p className="text-cream/60 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                Your Charithra Silks account is secured via **Firebase Phone OTP** and **Google Sign-In**. 
                Since we do not store static passwords for shopper accounts, there is no password to change.
              </p>
            </div>
            <div className="bg-[#130305] border border-gold/10 rounded-lg p-3 max-w-sm mx-auto">
              <p className="text-[10px] text-gold font-serif">Security Status: FULLY SECURED</p>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
