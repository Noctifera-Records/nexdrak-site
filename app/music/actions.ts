"use server";

import { db } from "@/lib/db";

export async function getPublicSongs() {
    // Consulta para obtener canciones
    // Eliminamos el filtro 'WHERE is_available = true' porque la columna no existe en la tabla 'songs'
    // Según el esquema, parece que todas las canciones creadas se consideran disponibles o públicas por defecto
    const songsRes = await db.query(`
        SELECT * FROM songs 
        ORDER BY release_date DESC
    `);
    
    const songs = songsRes.rows;
    
    // Consulta para obtener enlaces de streaming para todas las canciones obtenidas
    // Si no hay canciones, devolvemos arrays vacíos
    if (songs.length === 0) {
        return { songs: [], streamingLinks: [] };
    }

    const songIds = songs.map(s => s.id);
    
    const linksRes = await db.query(`
        SELECT * FROM streaming_links 
        WHERE song_id = ANY($1)
        ORDER BY is_primary DESC, platform ASC
    `, [songIds]);

    return {
        songs: songs,
        streamingLinks: linksRes.rows
    };
}
