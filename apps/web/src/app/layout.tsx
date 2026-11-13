import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Quicksand, Inter } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Petals ERP - Child Development Centre',
  description: 'Enterprise ERP for Petals Child Development Centre',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#6C3995',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${inter.variable}`}
    >
      <body className="font-inter bg-white text-ink antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
