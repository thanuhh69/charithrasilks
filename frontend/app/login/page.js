'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FiArrowLeft } from 'react-icons/fi';
import { signInWithGoogle } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { syncWithBackend } = useAuth();
  const [loading, setLoading] = useState(false);

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
        <Link href="/" className="flex items-center gap-1 text-gold mb-6 text-sm hover:underline">
          <FiArrowLeft /> Back to home
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-serif text-gold text-3xl font-bold tracking-wide">CHARITHRA SILKS</h1>
          <p className="text-cream/60 text-sm mt-2 font-serif">Sign in to continue shopping</p>
        </div>

        <div className="card p-8 flex flex-col items-center justify-center space-y-5">
          <p className="text-cream/70 text-sm text-center leading-relaxed">
            Verify your email to access your account, orders, and wishlist.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-cream text-maroon-dark font-semibold py-3.5 px-4 rounded-lg hover:bg-white transition shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-maroon-dark"></span>
                Signing in...
              </span>
            ) : (
              <>
                <FcGoogle className="text-xl" /> Continue with Google
              </>
            )}
          </button>
        </div>

        <p className="text-center text-cream/40 text-[11px] mt-6">
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
