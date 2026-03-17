import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Downloads',
  description: 'Official NexDrak downloads.',
  alternates: { canonical: '/downloads' },
  openGraph: {
    type: 'website',
    url: '/downloads',
    title: 'Downloads | NexDrak',
    description: 'Official NexDrak downloads.',
    siteName: 'NexDrak',
    images: [{ url: '/nexdrak_opengraph.webp', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads | NexDrak',
    description: 'Official NexDrak downloads.',
    images: ['/nexdrak_opengraph.webp'],
    creator: '@nexdrak',
  },
};

export default function DownloadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
