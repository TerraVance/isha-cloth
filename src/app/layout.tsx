import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Isha Vastram — Pure Cotton Handloom Sarees',
    template: '%s | Isha Vastram',
  },
  description: 'Discover exquisite pure cotton handloom sarees at Isha Vastram. Authentic Banarasi, Paithani, Chanderi and more — crafted with love, delivered to your door.',
  keywords: ['sarees', 'pure cotton sarees', 'handloom sarees', 'Banarasi sarees', 'Paithani sarees', 'Indian ethnic wear', 'Isha Vastram'],
  openGraph: {
    title: 'Isha Vastram — Pure Cotton Handloom Sarees',
    description: 'Authentic handloom sarees crafted with love. Shop our festive, bridal, and daily-wear collections.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Isha Vastram',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#800020" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ToastProvider>
          <CartProvider>
            {children}
            <WhatsAppFAB />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
