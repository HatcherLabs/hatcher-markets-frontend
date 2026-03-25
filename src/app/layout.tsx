import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Hatcher Markets — AI Agent Rental Marketplace',
    template: '%s | Hatcher Markets',
  },
  description:
    'Rent AI agents in seconds. Pay with SOL, platform tokens, or card. Browse, rent, and use AI agents from top creators on Solana.',
  keywords: [
    'AI agents',
    'rent AI',
    'Solana',
    'AI marketplace',
    'AI bot rental',
    'hatcher',
  ],
  authors: [{ name: 'Hatcher Labs' }],
  creator: 'Hatcher Labs',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hatcher.markets',
    siteName: 'Hatcher Markets',
    title: 'Hatcher Markets — Rent AI Agents in Seconds',
    description:
      'The premier marketplace for AI agent rentals. Pay with SOL, tokens, or card.',
    images: [
      { url: '/og', width: 1200, height: 630, alt: 'Hatcher Markets' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hatcher Markets — Rent AI Agents',
    description:
      'Browse and rent AI agents from top creators. Pay with SOL or card.',
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://hatcher.markets'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Hatcher Markets',
    description: 'AI Agent Rental Marketplace',
    url: 'https://hatcher.markets',
    applicationCategory: 'Marketplace',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AuthProvider>
          <Header />
          <main className="pt-16 min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
