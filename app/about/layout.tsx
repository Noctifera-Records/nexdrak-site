import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Official NexDrak about page.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    url: '/about',
    title: 'About | NexDrak',
    description: 'Official NexDrak about page.',
    siteName: 'NexDrak',
    images: [{ url: '/nexdrak_opengraph.webp', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | NexDrak',
    description: 'Official NexDrak about page.',
    images: ['/nexdrak_opengraph.webp'],
    creator: '@nexdrak',
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
