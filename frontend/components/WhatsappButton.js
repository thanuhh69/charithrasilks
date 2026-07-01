'use client';

import { usePathname } from 'next/navigation';

export default function WhatsappButton() {
  const pathname = usePathname();
  const number = '8332944064';
  const message = encodeURIComponent('Hello Charithra Silks, I would like to know more about your saree collections.');
  const url = `https://wa.me/91${number}?text=${message}`;

  if (pathname !== '/') return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center animate-bounce hover:animate-none"
      style={{ animationDuration: '3s' }}
      aria-label="Contact Charithra Silks on WhatsApp"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.465L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.407.003 9.806-4.388 9.809-9.794.002-2.618-1.018-5.08-2.873-6.94C16.357 2.01 13.9 1.012 12.01 1.012c-5.41 0-9.809 4.391-9.813 9.797-.002 1.802.476 3.562 1.39 5.118l-.955 3.498 3.575-.937zm11.367-6.463c-.3-.15-1.77-.875-2.04-.972-.27-.099-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-1.125-.565-2.072-1.028-2.924-1.767-.76-.656-1.25-1.445-1.4-1.7-.15-.27-.02-.415.115-.55.12-.12.27-.3.4-.45.13-.15.17-.25.26-.42.09-.17.05-.32-.02-.47-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.075-.79.37-.27.3-1.04 1.02-1.04 2.487 0 1.468 1.07 2.885 1.22 3.085.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.62.71.22 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
      </svg>
    </a>
  );
}
