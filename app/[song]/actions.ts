"use server";

import { db } from "@/lib/db";

export async function getSongBySlug(slug: string) {
  const slugParam = slug.toLowerCase();
  
  // 1. Try to find by slug
  let { rows } = await db.query(`
    SELECT * FROM songs WHERE slug = $1 LIMIT 1
  `, [slugParam]);
  
  let songData = rows[0];
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
    const { rows: titleRows } = await db.query(`
      SELECT * FROM songs WHERE title ILIKE $1 LIMIT 1
    `, [searchTerm]);
    
    songData = titleRows[0];
    
    // 3. If still not found, try by album name
    if (!songData) {
      const { rows: albumRows } = await db.query(`
        SELECT * FROM songs 
        WHERE album_name ILIKE $1 
        ORDER BY title ASC
      `, [searchTerm]);
      
      if (albumRows.length > 0) {
        songData = albumRows[0];
        isAlbumView = true;
        albumSongs = albumRows;
      }
    }
  }
  
  if (!songData) {
    return null;
  }
  
  // Fetch streaming links
  const { rows: links } = await db.query(`
    SELECT * FROM streaming_links 
    WHERE song_id = $1 
    ORDER BY is_primary DESC, platform ASC
  `, [songData.id]);
  
  return {
    song: songData,
    streamingLinks: links,
    isAlbumView,
    albumSongs
  };
}
