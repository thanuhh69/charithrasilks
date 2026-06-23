'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Browse our collection, select your desired saree, add it to your cart, and click checkout. Provide your delivery address and complete the payment to place an order.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, debit cards, UPI, net banking, and popular mobile wallets via Razorpay online payment integration.',
  },
  {
    q: 'Can I track my shipping status?',
    a: 'Yes, once shipped, you can find the tracking number and shipment updates directly in your user dashboard under the "My Orders" tab.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a hassle-free 7-day return policy for unused sarees in their original packaging and labels intact. Please contact our support team to raise a return request.',
  },
  {
    q: 'Are the sarees authentic handloom?',
    a: 'Absolutely. We pride ourselves on working directly with authentic artisans and weavers to bring you premium Banarasi, Kanjivaram, and handloom cotton sarees.',
  },
];

export default function HelpPage() {
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
            <h1 className="font-serif text-2xl text-cream font-semibold">Help Center & FAQ</h1>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="card p-5 space-y-2">
                <h3 className="font-serif text-gold text-base font-semibold">{faq.q}</h3>
                <p className="text-cream/70 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="card p-5 border border-gold/15 bg-maroon-dark/10 text-center space-y-3 mt-8">
            <h3 className="font-serif text-gold text-base">Still need assistance?</h3>
            <p className="text-cream/70 text-xs max-w-sm mx-auto">
              Our customer happiness team is available to assist you with order details, custom designs, or boutique inquiries.
            </p>
            <button onClick={() => router.push('/contact')} className="btn-primary inline-block text-xs">
              Contact Support
            </button>
          </div>
        </main>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
