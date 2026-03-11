"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const merchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be positive"),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  purchase_url: z.string().url("Invalid purchase URL"),
  category: z.string().min(1, "Category is required"),
  is_available: z.boolean().optional()
});

export async function getMerch() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const res = await db.query(`
        SELECT * FROM merch ORDER BY created_at DESC
    `);

    return res.rows;
}

export async function createMerch(data: unknown) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = merchSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { name, description, price, image_url, purchase_url, category, is_available } = result.data;

    const res = await db.query(`
        INSERT INTO merch (name, description, price, image_url, purchase_url, category, is_available)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `, [name, description, price, image_url, purchase_url, category, is_available || false]);

    revalidatePath("/admin/merch");
    return res.rows[0];
}

export async function updateMerch(id: number, data: unknown) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const result = merchSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { name, description, price, image_url, purchase_url, category, is_available } = result.data;

    const res = await db.query(`
        UPDATE merch 
        SET name = $1, description = $2, price = $3, image_url = $4, purchase_url = $5, category = $6, is_available = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *
    `, [name, description, price, image_url, purchase_url, category, is_available || false, id]);

    revalidatePath("/admin/merch");
    return res.rows[0];
}

export async function deleteMerch(id: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.query("DELETE FROM merch WHERE id = $1", [id]);
    revalidatePath("/admin/merch");
    return { success: true };
}
