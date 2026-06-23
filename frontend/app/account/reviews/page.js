'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import api from '../../../lib/api';

function ReviewsContent() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/reviews')
      .then(({ data }) => {
        if (data.success) {
          setReviews(data.reviews || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gold"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gold/20 rounded-2xl bg-maroon-dark/20">
          <p className="text-cream/50 text-sm">You haven't written any reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card p-4 space-y-3">
              <Link href={`/product/${r.product.slug}`} className="flex items-center gap-3 group">
                <div className="w-12 h-16 bg-maroon rounded overflow-hidden flex-shrink-0 relative">
                  {r.product.thumbnail && (
                    <img src={r.product.thumbnail} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-cream font-medium text-sm truncate group-hover:text-gold transition">
                    {r.product.title}
                  </h3>
                  <p className="text-cream/40 text-[10px] mt-0.5">
                    Reviewed on {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>

              <div className="border-t border-gold/10 pt-3">
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      className={`text-sm ${
                        i < r.rating ? 'text-gold fill-gold' : 'text-cream/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-cream/80 text-xs italic leading-relaxed">
                  "{r.comment || 'No comment provided'}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountReviewsPage() {
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
            <h1 className="font-serif text-xl text-cream font-semibold">My Reviews</h1>
          </div>
          <ReviewsContent />
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
