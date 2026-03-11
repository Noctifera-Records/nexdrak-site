"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  location: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  ticket_url: z.string().url().optional().nullable().or(z.literal("")),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional()
});

export async function getEvents() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const res = await db.query(`
        SELECT * FROM events ORDER BY date DESC
    `);

    return res.rows;
}

export async function createEvent(data: unknown) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = eventSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { title, description, date, location, venue, ticket_url, image_url, is_featured, is_published } = result.data;

    const res = await db.query(`
        INSERT INTO events (title, description, date, location, venue, ticket_url, image_url, is_featured, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `, [title, description, date, location, venue, ticket_url, image_url, is_featured || false, is_published || false]);

    revalidatePath("/admin/events");
    return res.rows[0];
}

export async function updateEvent(id: number, data: unknown) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = eventSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { title, description, date, location, venue, ticket_url, image_url, is_featured, is_published } = result.data;

    const res = await db.query(`
        UPDATE events 
        SET title = $1, description = $2, date = $3, location = $4, venue = $5, ticket_url = $6, image_url = $7, is_featured = $8, is_published = $9, updated_at = NOW()
        WHERE id = $10
        RETURNING *
    `, [title, description, date, location, venue, ticket_url, image_url, is_featured || false, is_published || false, id]);

    revalidatePath("/admin/events");
    return res.rows[0];
}

export async function deleteEvent(id: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.query("DELETE FROM events WHERE id = $1", [id]);
    revalidatePath("/admin/events");
    return { success: true };
}
