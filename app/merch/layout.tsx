import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merch | NexDrak',
  description: 'Official NexDrak merchandise and limited items.',
  alternates: { canonical: '/merch' },
  openGraph: {
    type: 'website',
    url: '/merch',
    title: 'Merch | NexDrak',
    description: 'Official NexDrak merchandise and limited items.',
    siteName: 'NexDrak',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merch | NexDrak',
    description: 'Official NexDrak merchandise and limited items.',
    images: ['/og-image.png'],
    creator: '@nexdrak',
  },
};

export default function MerchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
