'use client';

import { useEffect, useState } from 'react';
import { FiInstagram } from 'react-icons/fi';
import api from '../lib/api';

const MOCK_POSTS = [
  { _id: 'mock1', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', link: 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==' },
  { _id: 'mock2', image: 'https://images.unsplash.com/photo-1610030470224-1a3b50c05dd7?w=600&auto=format&fit=crop&q=80', link: 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==' },
  { _id: 'mock3', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80', link: 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==' },
  { _id: 'mock4', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', link: 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==' },
  { _id: 'mock5', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80', link: 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==' },
  { _id: 'mock6', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80', link: 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==' },
];

export default function InstagramSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/instagram')
      .then(({ data }) => {
        if (data.success && data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          setPosts(MOCK_POSTS);
        }
      })
      .catch((err) => {
        console.error('Failed to load Instagram posts', err);
        setPosts(MOCK_POSTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const profileUrl = 'https://www.instagram.com/charithrasilks_?igsh=MTBibm5xdTB6bHdhdQ==';

  const displayedPosts = posts.length > 0 ? posts : MOCK_POSTS;

  return (
    <section className="bg-gradient-to-b from-[#130305] to-[#1a0508] text-cream py-14 px-4 border-t border-gold/15 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto text-center space-y-3 mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wide text-gold">
          Follow Us on Instagram
        </h2>
        
        <a 
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-cream/70 hover:text-gold transition-colors font-medium text-sm"
        >
          <FiInstagram className="text-base text-gold" />
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
                className="w-[45%] sm:w-[28%] md:w-[22%] lg:w-[15%] aspect-square rounded-[20px] bg-maroon-dark/40 border border-gold/10 animate-pulse flex-shrink-0"
              />
            ))
          ) : (
            displayedPosts.map((post) => (
              <a
                key={post._id}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="w-[45%] sm:w-[28%] md:w-[22%] lg:w-[15%] aspect-square rounded-[20px] overflow-hidden bg-maroon-dark/60 border border-gold/20 flex-shrink-0 snap-start shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all duration-500 hover:-translate-y-1.5 active:scale-98 group relative"
              >
                <img 
                  src={post.image} 
                  alt={post.caption || 'Instagram Post'} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
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
