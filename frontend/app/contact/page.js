'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';

export default function ContactPage() {
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
            <h1 className="font-serif text-2xl text-cream font-semibold">Contact Us</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details Card */}
            <div className="card p-6 space-y-6">
              <h2 className="font-serif text-gold text-lg font-semibold border-b border-gold/10 pb-2">
                Customer Support
              </h2>
              
              <div className="space-y-4 text-cream/80 text-xs">
                <div className="flex items-start gap-3">
                  <FiMail className="text-gold text-lg mt-0.5" />
                  <div>
                    <p className="font-semibold text-cream">Email Address</p>
                    <p className="mt-0.5">support@charithrasilks.com</p>
                    <p className="text-[10px] text-cream/40">We reply within 12-24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiPhone className="text-gold text-lg mt-0.5" />
                  <div>
                    <p className="font-semibold text-cream">Phone Number</p>
                    <p className="mt-0.5">+91 98765 43210</p>
                    <p className="text-[10px] text-cream/40">Available 10 AM - 7 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiClock className="text-gold text-lg mt-0.5" />
                  <div>
                    <p className="font-semibold text-cream">Working Hours</p>
                    <p className="mt-0.5">Monday to Saturday</p>
                    <p>10:00 AM - 7:00 PM (IST)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Address Card */}
            <div className="card p-6 space-y-6">
              <h2 className="font-serif text-gold text-lg font-semibold border-b border-gold/10 pb-2">
                Boutique Studio
              </h2>

              <div className="space-y-4 text-cream/80 text-xs">
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-gold text-lg mt-0.5" />
                  <div>
                    <p className="font-semibold text-cream">Flagship Store</p>
                    <p className="mt-0.5 leading-relaxed">
                      Charithra Silks Studio,<br />
                      45 Silk Weaver's Street, Kanchipuram,<br />
                      Tamil Nadu - 631501, India
                    </p>
                  </div>
                </div>

                <div className="bg-[#130305] border border-gold/10 p-3 rounded-lg text-[10px] text-gold/80 italic">
                  Note: Visits to the weave showroom for wedding orders are by appointment only. Please schedule at least 2 days in advance.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
