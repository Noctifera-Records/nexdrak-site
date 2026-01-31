import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Music | NexDrak',
  description: 'Discover albums and singles by NexDrak with streaming links.',
  alternates: { canonical: '/music' },
  openGraph: {
    type: 'website',
    url: '/music',
    title: 'Music | NexDrak',
    description: 'Discover albums and singles by NexDrak with streaming links.',
    siteName: 'NexDrak',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music | NexDrak',
    description: 'Discover albums and singles by NexDrak with streaming links.',
    images: ['/og-image.png'],
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
