import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Downloads | NexDrak',
  description: 'Access exclusive producer tools, sample packs, and free downloads from NexDrak. Enhance your production with high-quality assets.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/downloads' },
  openGraph: {
    type: 'website',
    url: '/downloads',
    title: 'Downloads | NexDrak',
    description: 'Exclusive producer tools and free downloads from NexDrak.',
    siteName: 'NexDrak',
    images: [{ url: '/nexdrak_opengraph.webp', width: 1200, height: 630, alt: 'NexDrak Downloads' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads | NexDrak',
    description: 'Free producer tools and downloads from NexDrak.',
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
