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
  
  return {
    title: `${data.song.title} | NexDrak`,
    description: `Listen to ${data.song.title} by ${data.song.artist} on NexDrak.`,
    openGraph: {
      images: [data.song.cover_image_url || '/nav-logo.webp'],
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
    // If it's already a string, assume it's an ISO string from Supabase
    if (typeof date === 'string') return date;
    // If it's a Date object, convert to ISO string
    if (date instanceof Date) return date.toISOString();
    // Otherwise, try to create a Date and convert
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
    // Removed updated_at as it doesn't exist in schema
  }));
  
  const albumSongs = data.albumSongs.map((s: any) => ({
    ...s,
    created_at: serializeDate(s.created_at),
    release_date: serializeDate(s.release_date),
  }));

  return (
    <ClientSongPage 
      song={song} 
      streamingLinks={streamingLinks}
      isAlbumView={data.isAlbumView}
      albumSongs={albumSongs}
    />
  );
}
