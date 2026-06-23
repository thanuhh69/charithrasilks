'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';

export default function LegalPage() {
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
            <h1 className="font-serif text-2xl text-cream font-semibold">Legal Policy</h1>
          </div>

          <div className="card p-6 space-y-6 text-cream/80 text-xs leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                1. Corporate Information
              </h2>
              <p>
                Charithra Silks is the registered trademark representing handcrafted luxury sarees. 
                All transactions completed on this platform are processed by Charithra Silks Inc. 
                with registered offices situated in India.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                2. Intellectual Property Rights
              </h2>
              <p>
                All content published on this website, including but not limited to images, logos, copy, 
                designs, graphics, and interface code, is the exclusive intellectual property of Charithra Silks. 
                Unauthorized replication, extraction, or commercial misuse is strictly prohibited under local copyright and design protection acts.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                3. Trade Practices and Product Authenticity
              </h2>
              <p>
                We strictly work in compliance with handloom protection acts. Every saree listed as authentic pure silk 
                is woven using pure raw silk yarn and real/imitation gold-coated silver zari, as specifically detailed 
                on individual product sheets. Minor discrepancies in weave pattern, dye consistency, or yarn texture 
                are characteristics of handloom items and are not considered manufacturing defects.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-gold text-sm font-semibold uppercase tracking-wider">
                4. Jurisdiction and Dispute Resolution
              </h2>
              <p>
                These legal statements and trade operations shall be governed by, and interpreted in compliance with, 
                applicable regional laws. Any legal disputes arising out of the use of this storefront 
                or product procurement shall be settled under the exclusive jurisdiction of the registered headquarters' local courts.
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
