"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function getPublicSongs() {
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return { songs: [], streamingLinks: [] };
  }

  const { data: songs, error: songsError } = await supabase
    .from("songs")
    .select("*")
    .order("release_date", { ascending: false });

  if (songsError || !songs || songs.length === 0) {
    return { songs: [], streamingLinks: [] };
  }

  const songIds = songs.map((s: any) => s.id).filter(Boolean);
  if (songIds.length === 0) {
    return { songs, streamingLinks: [] };
  }

  const { data: streamingLinks, error: linksError } = await supabase
    .from("streaming_links")
    .select("*")
    .in("song_id", songIds)
    .order("is_primary", { ascending: false })
    .order("platform", { ascending: true });

  return {
    songs,
    streamingLinks: linksError || !streamingLinks ? [] : streamingLinks,
  };
}
