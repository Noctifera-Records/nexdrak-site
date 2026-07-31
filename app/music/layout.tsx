import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Music | NexDrak',
  description: 'Explore the full discography of NexDrak. Stream techno, house, and darkwave releases including albums, singles, and exclusive tracks with direct streaming links.',
  alternates: { canonical: 'https://nexdrak.com/music' },
  openGraph: {
    type: 'website',
    url: 'https://nexdrak.com/music',
    title: 'Music | NexDrak',
    description: 'Explore the full discography of NexDrak. Stream techno, house, and darkwave releases.',
    siteName: 'NexDrak',
    images: [{ url: 'https://nexdrak.com/nexdrak_opengraph.webp', width: 1200, height: 630, alt: 'NexDrak Music' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music | NexDrak',
    description: 'Listen to the latest electronic music releases from NexDrak.',
    images: ['https://nexdrak.com/nexdrak_opengraph.webp'],
    creator: '@nexdrak',
  },
};

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
