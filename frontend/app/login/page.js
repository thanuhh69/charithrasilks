'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FiPhone, FiArrowLeft } from 'react-icons/fi';
import { sendOtp, signInWithGoogle, resetRecaptcha } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { syncWithBackend } = useAuth();

  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `+91${cleaned}`;
      const result = await sendOtp(fullNumber);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.message?.includes('firebase') ? 'OTP service not configured yet' : 'Failed to send OTP');
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await syncWithBackend(result.user);
      toast.success('Logged in successfully');
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await syncWithBackend(user);
      toast.success('Logged in successfully');
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-maroon-dark to-[#1a0508]">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-1 text-gold mb-6 text-sm">
          <FiArrowLeft /> Back to home
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-serif text-gold text-3xl font-bold">CHARITHRA SILKS</h1>
          <p className="text-cream/60 text-sm mt-2">Sign in to continue shopping</p>
        </div>

        <div className="card p-6">
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <label className="text-cream/80 text-sm block">Mobile Number</label>
              <div className="flex items-center input-field gap-2">
                <FiPhone className="text-gold" />
                <span className="text-cream/60">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="bg-transparent flex-1 outline-none text-cream"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-cream/70 text-sm">
                Enter the 6-digit OTP sent to <span className="text-gold">+91 {phone}</span>
              </p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="input-field text-center text-2xl tracking-widest"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-gold text-sm w-full text-center"
              >
                Change mobile number
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gold/20 flex-1" />
            <span className="text-cream/50 text-xs">OR</span>
            <div className="h-px bg-gold/20 flex-1" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-cream text-maroon-dark font-semibold py-3 rounded-lg hover:bg-white transition"
          >
            <FcGoogle className="text-xl" /> Continue with Google
          </button>
        </div>

        <p className="text-center text-cream/40 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#1a0508]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
