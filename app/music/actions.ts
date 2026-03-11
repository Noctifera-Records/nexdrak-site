"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function getPublicSongs() {
  try {
    const supabase = createServiceRoleClient();

    const { data: songs, error: songsError } = await supabase
      .from("songs")
      .select("*")
      .order("release_date", { ascending: false });

    if (songsError) {
      console.error("Error fetching songs:", songsError);
      return { songs: [], streamingLinks: [] };
    }

    if (!songs || songs.length === 0) {
      console.log("No songs found in database");
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

    if (linksError) {
      console.error("Error fetching streaming links:", linksError);
    }

    return {
      songs,
      streamingLinks: streamingLinks || [],
    };
  } catch (error) {
    console.error("Error in getPublicSongs:", error);
    return { songs: [], streamingLinks: [] };
  }
}
