'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';

export default function TermsPage() {
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
            <h1 className="font-serif text-2xl text-cream font-semibold">Terms & Conditions</h1>
          </div>

          <div className="card p-6 space-y-6 text-cream/80 text-xs leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                1. Service Utilization
              </h2>
              <p>
                By accessing this platform, you agree to comply with all terms and conditions detailed here. 
                You agree not to use the platform to violate regional laws, transmit scrapers/crawlers, 
                or cause network interruptions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                2. Order Registration and Prices
              </h2>
              <p>
                Product pricing and stock availability are subject to change without notice. While we strive to display 
                accurate inventory levels and pricing, system updates may occasionally result in discrepancies. 
                In such cases, we reserve the right to cancel the order and issue a full refund to the customer.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                3. Payment Terms and Transactions
              </h2>
              <p>
                Transactions must be funded in full before items are prepared for shipping. Payment processing failure 
                or chargeback issues will result in immediate cancellation of pending dispatches. All pricing listed is in Indian Rupees (INR).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                4. Shipping and Custom Modifications
              </h2>
              <p>
                Orders are processed and handed over to courier networks within 2-4 business days. Estimated delivery windows 
                are provided by shipping partners and are not guaranteed. Any custom alterations (e.g. falls, zig-zag stitching, 
                blouse tailoring) will extend shipment dates and void return eligibilities.
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
