'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col justify-between">
      <div>
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gold text-xl">
              <FiArrowLeft />
            </button>
            <h1 className="font-serif text-2xl text-cream font-semibold">Privacy Policy</h1>
          </div>

          <div className="card p-6 space-y-6 text-cream/80 text-xs leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                1. Data Collection
              </h2>
              <p>
                We collect personal information necessary for account provisioning and order processing, 
                specifically: name, email address, shipping addresses, and mobile numbers verified via OTP authentication.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                2. Data Usage and Security
              </h2>
              <p>
                Your personal and contact details are stored securely in our database and linked via 
                Firebase Auth encryption tokens. We utilize this information exclusively to process payments, 
                ship orders, and send customer support communications. We do not rent, sell, or distribute your information to third-party marketers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                3. Cookies and Session Tokens
              </h2>
              <p>
                We set functional cookies (e.g. JWT admin tokens, cart cookies) to maintain login states, 
                track user cart items, and provide a fluid shopping experience. You can block or remove 
                cookies using your browser preferences, but this will disable checkout and dashboard features.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                4. Third-Party Integrations
              </h2>
              <p>
                We use secure, PCI-compliant payment networks (Razorpay) and global identity providers (Firebase, Google Auth) 
                to handle logins and checkouts. Your financial credentials are processed on their secure domains and never stored on our servers.
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
