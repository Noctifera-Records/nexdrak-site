"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function getSongBySlug(slug: string) {
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return null;
  }
  const slugParam = slug.toLowerCase();
  
  // 1. Try to find by slug
  const { data: bySlug, error: bySlugError } = await supabase
    .from("songs")
    .select("*")
    .eq("slug", slugParam)
    .limit(1);

  let songData = !bySlugError && bySlug && bySlug.length > 0 ? bySlug[0] : null;
  let isAlbumView = false;
  let albumSongs = [];

  // 2. If not found, try by title
  if (!songData) {
    const searchTerm = slug
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/-/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    // Use ILIKE for case-insensitive search
    const { data: titleRows, error: titleError } = await supabase
      .from("songs")
      .select("*")
      .ilike("title", searchTerm)
      .limit(1);

    songData = !titleError && titleRows && titleRows.length > 0 ? titleRows[0] : null;
    
    // 3. If still not found, try by album name
    if (!songData) {
      const { data: albumRows, error: albumError } = await supabase
        .from("songs")
        .select("*")
        .ilike("album_name", searchTerm)
        .order("title", { ascending: true });

      if (!albumError && albumRows && albumRows.length > 0) {
        songData = albumRows[0] as any;
        isAlbumView = true;
        albumSongs = albumRows;
      }
    }
  }
  
  if (!songData) {
    return null;
  }
  
  // Fetch streaming links
  const { data: links, error: linksError } = await supabase
    .from("streaming_links")
    .select("*")
    .eq("song_id", songData.id)
    .order("is_primary", { ascending: false })
    .order("platform", { ascending: true });
  
  return {
    song: songData,
    streamingLinks: linksError || !links ? [] : links,
    isAlbumView,
    albumSongs
  };
}
