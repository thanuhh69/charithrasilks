import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Charithra Silks | Premium Sarees Online',
  description: 'Shop premium Banarasi, Kanjivaram, Mysore Crepe and handloom sarees at Charithra Silks.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1a0508]">
        <Providers>{children}</Providers>
        <div id="recaptcha-container"></div>
      </body>
    </html>
  );
}
