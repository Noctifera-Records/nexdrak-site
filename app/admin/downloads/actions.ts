"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getDownloads() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const res = await db.query(`
        SELECT * FROM downloads ORDER BY created_at DESC
    `);

    return res.rows;
}

export async function createDownload(data: any) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const { title, description, category, file_url, cover_image_url, file_size, file_type, is_featured, is_public } = data;

    const res = await db.query(`
        INSERT INTO downloads (title, description, category, file_url, cover_image_url, file_size, file_type, is_featured, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `, [title, description, category, file_url, cover_image_url, file_size, file_type, is_featured, is_public]);

    revalidatePath("/admin/downloads");
    return res.rows[0];
}

export async function updateDownload(id: number, data: any) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const { title, description, category, file_url, cover_image_url, file_size, file_type, is_featured, is_public } = data;

    const res = await db.query(`
        UPDATE downloads 
        SET title = $1, description = $2, category = $3, file_url = $4, cover_image_url = $5, file_size = $6, file_type = $7, is_featured = $8, is_public = $9
        WHERE id = $10
        RETURNING *
    `, [title, description, category, file_url, cover_image_url, file_size, file_type, is_featured, is_public, id]);

    revalidatePath("/admin/downloads");
    return res.rows[0];
}

export async function deleteDownload(id: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.query("DELETE FROM downloads WHERE id = $1", [id]);
    revalidatePath("/admin/downloads");
    return { success: true };
}
