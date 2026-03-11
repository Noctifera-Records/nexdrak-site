"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const res = await db.query(`
        SELECT key, value FROM site_settings ORDER BY key
    `);

    return res.rows;
}

export async function updateSiteSettings(settings: Record<string, string>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value?.trim() || ''
    }));

    try {
        await db.query("BEGIN");

        for (const { key, value } of updates) {
            // Check if key exists
            const check = await db.query("SELECT key FROM site_settings WHERE key = $1", [key]);
            
            if (check.rows.length > 0) {
                await db.query("UPDATE site_settings SET value = $1, updated_at = NOW() WHERE key = $2", [value, key]);
            } else {
                await db.query("INSERT INTO site_settings (key, value) VALUES ($1, $2)", [key, value]);
            }
        }

        await db.query("COMMIT");
        revalidatePath("/admin/settings");
        revalidatePath("/"); // Update home page as well since it uses these settings
        return { success: true };
    } catch (error: any) {
        await db.query("ROLLBACK");
        console.error("Error updating site settings:", error);
        throw new Error("Failed to update settings");
    }
}
