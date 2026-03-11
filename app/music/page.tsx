import { getPublicSongs } from "./actions";
import MusicClient from "./music-client";

export const metadata = {
  title: 'Music',
  description: 'Listen to the latest tracks, albums, and singles by NexDrak.',
};

export default async function MusicPage() {
  const { songs, streamingLinks } = await getPublicSongs();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            name: "NexDrak",
            url: "https://nexdrak.com",
            logo: "https://nexdrak.com/nav-logo.webp",
            sameAs: [
              "https://www.instagram.com/nexdrak",
              "https://x.com/nexdrak",
              "https://www.youtube.com/@nexdrak",
              "https://open.spotify.com/artist/1DRRpAYf6HmdFkLLPXeMEx"
            ]
          })
        }}
      />
      <MusicClient initialSongs={songs} initialLinks={streamingLinks} />
    </>
  );
}
