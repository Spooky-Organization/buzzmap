import type { Metadata } from 'next';
import { Providers } from '@/providers';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BuzzMap — For You, By You',
    template: '%s | BuzzMap',
  },
  description:
    'A social commerce platform for authentic POV video reviews, local business discovery, marketplace shopping, and real-time messaging — all in one place.',
  keywords: [
    'BuzzMap',
    'local business discovery',
    'POV video reviews',
    'social commerce',
    'marketplace',
    'business reviews',
    'product reviews',
    'local shopping',
  ],
  authors: [{ name: 'theBuzzmap' }],
  creator: 'theBuzzmap',
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  openGraph: {
    type: 'website',
    siteName: 'BuzzMap',
    title: 'BuzzMap — For You, By You',
    description:
      'Discover local businesses through authentic POV video reviews. Shop, connect, and share real experiences.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuzzMap — For You, By You',
    description:
      'Discover local businesses through authentic POV video reviews. Shop, connect, and share real experiences.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
