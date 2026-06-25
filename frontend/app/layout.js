import './globals.css';
import Providers from './providers';
import WhatsappButton from '../components/WhatsappButton';

export const metadata = {
  title: 'Charithra Silks | Premium Sarees Online',
  description: 'Shop premium Banarasi, Kanjivaram, Mysore Crepe and handloom sarees at Charithra Silks.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1a0508]">
        <Providers>{children}</Providers>
        <WhatsappButton />
        <div id="recaptcha-container"></div>
      </body>
    </html>
  );
}
