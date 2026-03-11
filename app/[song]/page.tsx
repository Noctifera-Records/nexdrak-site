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
  
  // Serialize dates
  const song = {
    ...data.song,
    created_at: data.song.created_at.toISOString(),
    release_date: data.song.release_date ? new Date(data.song.release_date).toISOString() : null,
  };
  
  const streamingLinks = data.streamingLinks.map((link: any) => ({
    ...link,
    created_at: link.created_at.toISOString(),
    updated_at: link.updated_at ? link.updated_at.toISOString() : null,
  }));
  
  const albumSongs = data.albumSongs.map((s: any) => ({
    ...s,
    created_at: s.created_at.toISOString(),
    release_date: s.release_date ? new Date(s.release_date).toISOString() : null,
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
