import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Official NexDrak upcoming events.',
  alternates: { canonical: '/events' },
  openGraph: {
    type: 'website',
    url: '/events',
    title: 'Events | NexDrak',
    description: 'Official NexDrak upcoming events.',
    siteName: 'NexDrak',
    images: [{ url: '/nexdrak_opengraph.webp', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events | NexDrak',
    description: 'Official NexDrak upcoming events.',
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
