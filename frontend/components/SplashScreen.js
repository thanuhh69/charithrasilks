'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Only show splash screen once per session
    const hasSeenSplash = sessionStorage.getItem('charithra_silks_splash_seen');
    if (!hasSeenSplash) {
      setVisible(true);
      
      // Start fade out after 2.5 seconds
      const fadeTimeout = setTimeout(() => {
        setFade(true);
      }, 2500);

      // Hide completely after 3 seconds (fade animation completes)
      const hideTimeout = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('charithra_silks_splash_seen', 'true');
      }, 3000);

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(hideTimeout);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a0508] transition-opacity duration-500 ease-in-out ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Self-contained CSS for smooth animations */}
      <style jsx global>{`
        @keyframes custom-zoom-in {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes text-fade-in {
          0% {
            transform: translateY(15px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-logo-zoom {
          animation: custom-zoom-in 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-text-reveal {
          animation: text-fade-in 2.0s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="text-center space-y-6 max-w-xs">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gold/40 overflow-hidden mx-auto shadow-2xl animate-logo-zoom">
          <img
            src="/logo.jpg"
            alt="Charithra Silks Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="animate-text-reveal space-y-1">
          <h1 className="font-serif text-gold text-2xl md:text-3xl font-bold tracking-widest uppercase">
            CHARITHRA
          </h1>
          <p className="text-gold/70 text-xs tracking-[0.3em] font-serif uppercase">
            SILKS
          </p>
          <div className="w-12 h-[1px] bg-gold/30 mx-auto mt-3"></div>
          <p className="text-cream/50 text-[10px] tracking-[0.2em] uppercase mt-2">
            Timeless Weaves. Eternal Elegance.
          </p>
        </div>
      </div>
    </div>
  );
}
