'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        toast.success('Welcome back!');
        router.push('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-maroon-dark to-[#1a0508]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-gold text-3xl font-bold">CHARITHRA SILKS</h1>
          <p className="text-cream/60 text-sm mt-2">Admin Panel Login</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@charithrasilks.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-cream/40 text-xs mt-6">
          Default seed credentials are in your backend .env (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD)
        </p>
      </div>
    </div>
  );
}
