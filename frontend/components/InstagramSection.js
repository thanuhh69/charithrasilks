'use client';

import { useEffect, useState } from 'react';
import { FiInstagram } from 'react-icons/fi';
import api from '../lib/api';

export default function InstagramSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/instagram')
      .then(({ data }) => {
        if (data.success) {
          setPosts(data.posts || []);
        }
      })
      .catch((err) => console.error('Failed to load Instagram posts', err))
      .finally(() => setLoading(false));
  }, []);

  const profileUrl = 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==';

  if (!loading && posts.length === 0) return null;

  return (
    <section className="bg-[#FAF9F6] text-[#1A0508] py-14 px-4 border-t border-gold/10 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto text-center space-y-4 mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wide text-[#2B0008]">
          Follow Us on Instagram
        </h2>
        
        <a 
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-gold-dark hover:text-gold transition-colors font-medium text-sm"
        >
          <FiInstagram className="text-base" />
          <span className="font-mono">@charithrasilks_</span>
        </a>
      </div>

      {/* Responsive Horizontal Slider */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x px-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="w-[45%] sm:w-[28%] md:w-[22%] lg:w-[15%] aspect-square rounded-[20px] bg-neutral-200 animate-pulse flex-shrink-0"
              />
            ))
          ) : (
            posts.map((post) => (
              <a
                key={post._id}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="w-[45%] sm:w-[28%] md:w-[22%] lg:w-[15%] aspect-square rounded-[20px] overflow-hidden bg-neutral-100 flex-shrink-0 snap-start shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(212,175,55,0.2)] transition-all duration-500 hover:-translate-y-1.5 active:scale-98 group relative"
              >
                <img 
                  src={post.image} 
                  alt={post.caption || 'Instagram Post'} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <FiInstagram className="text-white text-2xl drop-shadow" />
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs md:text-sm font-semibold shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-[#8134AF] via-[#DD2A7B] to-[#F58529]"
        >
          <FiInstagram className="text-base" />
          <span>Follow @charithrasilks_ on Instagram</span>
        </a>
      </div>
    </section>
  );
}
