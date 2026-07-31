import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upcoming Events | NexDrak',
  description: 'Catch NexDrak live at festivals, clubs, and venues worldwide. View the full schedule, tour dates, and secure your tickets for the ultimate audio-visual experience.',
  alternates: { canonical: 'https://nexdrak.com/events' },
  openGraph: {
    type: 'website',
    url: 'https://nexdrak.com/events',
    title: 'Upcoming Events | NexDrak',
    description: 'Catch NexDrak live. Full schedule, tour dates, and tickets.',
    siteName: 'NexDrak',
    images: [{ url: 'https://nexdrak.com/nexdrak_opengraph.webp', width: 1200, height: 630, alt: 'NexDrak Live Events' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upcoming Events | NexDrak',
    description: 'Upcoming live events and tour dates for NexDrak.',
    images: ['https://nexdrak.com/nexdrak_opengraph.webp'],
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
