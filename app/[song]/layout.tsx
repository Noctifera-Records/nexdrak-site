import type { Metadata } from 'next';

export default async function SongLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ song: string }>
}) {
  const resolvedParams = await params;
  if (!resolvedParams?.song) {
    return <>{children}</>;
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const slugParam = resolvedParams.song.toLowerCase();

  let song: any = null;
  try {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('slug', slugParam)
      .single();
    song = data;
  } catch {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexdrak.com';
  const canonical = `${siteUrl}/${slugParam}`;
  const imageUrl = song?.cover_image_url || `${siteUrl}/og-image.png`;

  let albumTracks: any[] = [];
  if (song?.type === 'album' && song?.album_name) {
    try {
      const { data: tracks } = await supabase
        .from('songs')
        .select('*')
        .eq('album_name', song.album_name)
        .order('track_number', { ascending: true });
      albumTracks = tracks || [];
    } catch {}
  }

  let streamingLinks: any[] = [];
  if (song?.id) {
    try {
      const { data: links } = await supabase
        .from('streaming_links')
        .select('*')
        .eq('song_id', song.id)
        .order('is_primary', { ascending: false })
        .order('platform');
      streamingLinks = links || [];
    } catch {}
  }

  const jsonLd =
    song?.type === 'album'
      ? {
          '@context': 'https://schema.org',
          '@type': 'MusicAlbum',
          name: song?.album_name || song?.title,
          byArtist: song?.artist
            ? { '@type': 'MusicGroup', name: song.artist }
            : undefined,
          image: imageUrl,
          datePublished: song?.release_date
            ? new Date(song.release_date).toISOString().slice(0, 10)
            : undefined,
          numTracks: albumTracks?.length || undefined,
          track:
            albumTracks?.map((t) => ({
              '@type': 'MusicRecording',
              name: t?.title,
              position: t?.track_number,
              inAlbum: song?.album_name
                ? { '@type': 'MusicAlbum', name: song.album_name }
                : undefined,
              byArtist: song?.artist
                ? { '@type': 'MusicGroup', name: song.artist }
                : undefined,
              image: t?.cover_image_url || imageUrl,
              datePublished: t?.release_date
                ? new Date(t.release_date).toISOString().slice(0, 10)
                : undefined,
              url: canonical,
            })) || undefined,
          url: canonical,
        }
      : song
      ? {
          '@context': 'https://schema.org',
          '@type': 'MusicRecording',
          name: song?.title,
          byArtist: song?.artist
            ? { '@type': 'MusicGroup', name: song.artist }
            : undefined,
          image: imageUrl,
          datePublished: song?.release_date
            ? new Date(song.release_date).toISOString().slice(0, 10)
            : undefined,
          inAlbum: song?.album_name
            ? { '@type': 'MusicAlbum', name: song.album_name }
            : undefined,
          url: canonical,
          audio:
            streamingLinks?.map((l) => l?.url).filter(Boolean) || undefined,
          sameAs:
            streamingLinks?.map((l) => l?.url).filter(Boolean) || undefined,
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      ) : null}
      {children}
    </>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ song: string }> }
): Promise<Metadata> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const resolvedParams = await params;
  const slugParam = resolvedParams.song.toLowerCase();

  let song: any = null;
  try {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('slug', slugParam)
      .single();
    song = data;
  } catch {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexdrak.com';
  const canonical = `${siteUrl}/${slugParam}`;

  const title = song?.title ? `${song.title} | NexDrak` : 'Music | NexDrak';
  const description = song?.artist
    ? `Listen to ${song.title} by ${song.artist}.`
    : 'Discover NexDrak music releases.';
  const imageUrl = song?.cover_image_url || `${siteUrl}/og-image.png`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'music.song',
      url: canonical,
      title,
      description,
      siteName: 'NexDrak',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@nexdrak',
    },
  };
}
