"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const songSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album_name: z.string().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  release_date: z.string().optional().nullable().or(z.literal("")),
  type: z.enum(["album", "single"]),
  slug: z.string().optional().nullable(),
  stream_url: z.string().url("Invalid streaming URL").optional().nullable().or(z.literal("")),
  youtube_embed_id: z.string().optional().nullable()
});

const streamingLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  is_primary: z.boolean()
});

export async function getSongs() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const res = await db.query(`
        SELECT s.*, 
               json_agg(
                   json_build_object(
                       'id', sl.id, 
                       'platform', sl.platform, 
                       'url', sl.url, 
                       'is_primary', sl.is_primary
                   ) ORDER BY sl.is_primary DESC
               ) FILTER (WHERE sl.id IS NOT NULL) as streaming_links
        FROM songs s
        LEFT JOIN streaming_links sl ON s.id = sl.song_id
        GROUP BY s.id
        ORDER BY s.release_date DESC
    `);

    return res.rows;
}

export async function createSong(data: unknown) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = songSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { title, artist, album_name, cover_image_url, release_date, type, slug, stream_url, youtube_embed_id } = result.data;

    const res = await db.query(`
        INSERT INTO songs (title, artist, album_name, cover_image_url, release_date, type, slug, stream_url, youtube_embed_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `, [title, artist, album_name, cover_image_url, release_date, type, slug, stream_url || null, youtube_embed_id]);

    revalidatePath("/admin/music");
    return res.rows[0];
}

export async function updateSong(id: number, data: unknown) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = songSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { title, artist, album_name, cover_image_url, release_date, type, slug, stream_url, youtube_embed_id } = result.data;

    const res = await db.query(`
        UPDATE songs 
        SET title = $1, artist = $2, album_name = $3, cover_image_url = $4, release_date = $5, type = $6, slug = $7, stream_url = $8, youtube_embed_id = $9, updated_at = NOW()
        WHERE id = $10
        RETURNING *
    `, [title, artist, album_name, cover_image_url, release_date, type, slug, stream_url || null, youtube_embed_id, id]);

    revalidatePath("/admin/music");
    return res.rows[0];
}

export async function deleteSong(id: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.query("DELETE FROM songs WHERE id = $1", [id]);
    revalidatePath("/admin/music");
    return { success: true };
}

// Streaming Links Actions
export async function addStreamingLink(songId: number, data: unknown) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = streamingLinkSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { platform, url, is_primary } = result.data;

    if (is_primary) {
        // Reset primary for this song
        await db.query("UPDATE streaming_links SET is_primary = false WHERE song_id = $1", [songId]);
    } else {
        // If it's the first link, make it primary
        const countRes = await db.query("SELECT COUNT(*) FROM streaming_links WHERE song_id = $1", [songId]);
        if (parseInt(countRes.rows[0].count) === 0) {
            // It's the first link, force primary
        }
    }

    const res = await db.query(`
        INSERT INTO streaming_links (song_id, platform, url, is_primary)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [songId, platform, url, is_primary]);

    revalidatePath("/admin/music");
    return res.rows[0];
}

export async function deleteStreamingLink(id: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.query("DELETE FROM streaming_links WHERE id = $1", [id]);
    revalidatePath("/admin/music");
    return { success: true };
}

export async function setPrimaryStreamingLink(id: number, songId: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    // Reset all for this song
    await db.query("UPDATE streaming_links SET is_primary = false WHERE song_id = $1", [songId]);
    
    // Set new primary
    const res = await db.query(`
        UPDATE streaming_links 
        SET is_primary = true 
        WHERE id = $1
        RETURNING *
    `, [id]);

    revalidatePath("/admin/music");
    return res.rows[0];
}
