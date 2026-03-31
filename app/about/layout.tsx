import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About NexDrak | The Artist & The Journey',
  description: 'Learn about the story, vision, and musical journey of NexDrak. From underground electronic beginnings to immersive audio-visual live experiences.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    url: '/about',
    title: 'About NexDrak | The Artist & The Journey',
    description: 'Learn about the story and vision of electronic music artist NexDrak.',
    siteName: 'NexDrak',
    images: [{ url: '/img/live_experience.png', width: 1200, height: 630, alt: 'NexDrak Live' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About NexDrak | The Artist & The Journey',
    description: 'The story and vision of electronic music artist NexDrak.',
    images: ['/img/live_experience.png'],
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
