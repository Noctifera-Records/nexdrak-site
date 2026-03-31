import { getSongBySlug } from "./actions";
import ClientSongPage from "./ClientSongPage";
import { notFound } from "next/navigation";

interface SongPageProps {
  params: Promise<{
    song: string;
  }>;
}

export async function generateMetadata({ params }: SongPageProps) {
  const p = await params;
  const data = await getSongBySlug(p.song);
  
  if (!data) {
    return {
      title: 'Song Not Found',
    };
  }
  
  const title = `${data.song.title} | ${data.song.artist} | NexDrak`;
  const description = `Listen to ${data.song.title} ${data.song.type === 'album' ? 'Album' : 'Single'} by ${data.song.artist} on NexDrak. Explore streaming links and track details.`;
  const url = `https://nexdrak.com/${data.song.slug}`;
  const imageUrl = data.song.cover_image_url || 'https://nexdrak.com/img/red.png';
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "NexDrak",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: data.song.title,
        },
      ],
      locale: "en_US",
      type: "music.song",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SongPage({ params }: SongPageProps) {
  const p = await params;
  const data = await getSongBySlug(p.song);
  
  if (!data) {
    notFound();
  }
  
  // Serialize dates for client component
  const serializeDate = (date: any) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
      return null;
    }
  };

  const song = {
    ...data.song,
    created_at: serializeDate(data.song.created_at),
    release_date: serializeDate(data.song.release_date),
  };
  
  const streamingLinks = data.streamingLinks.map((link: any) => ({
    ...link,
    created_at: serializeDate(link.created_at),
  }));
  
  const albumSongs = data.albumSongs.map((s: any) => ({
    ...s,
    created_at: serializeDate(s.created_at),
    release_date: serializeDate(s.release_date),
  }));

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": song.type === 'album' ? "MusicAlbum" : "MusicRecording",
    "name": song.title,
    "byArtist": {
      "@type": "MusicGroup",
      "name": song.artist,
      "url": "https://nexdrak.com"
    },
    "url": `https://nexdrak.com/${song.slug}`,
    "image": song.cover_image_url,
    "datePublished": song.release_date || song.created_at,
    "genre": "Electronic",
  };
  
  if (song.type === 'album') {
    (jsonLd as any).numTracks = albumSongs.length;
    (jsonLd as any).track = albumSongs.map(s => ({
      "@type": "MusicRecording",
      "name": s.title,
      "position": s.track_number
    }));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClientSongPage 
        song={song} 
        streamingLinks={streamingLinks}
        isAlbumView={data.isAlbumView}
        albumSongs={albumSongs}
      />
    </>
  );
}
