'use server';

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getAdminStats() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    try {
        const [
            usersCount,
            songsCount,
            merchCount,
            downloadsCount,
            eventsCount,
            releasesCount
        ] = await Promise.all([
            db.query('SELECT COUNT(*) FROM "user"'),
            db.query('SELECT COUNT(*) FROM songs'),
            db.query('SELECT COUNT(*) FROM merch'),
            db.query('SELECT COUNT(*) FROM downloads'),
            db.query('SELECT COUNT(*) FROM events'),
            db.query('SELECT COUNT(*) FROM releases') // Assuming releases table exists or similar logic
        ]);

        return {
            users: parseInt(usersCount.rows[0].count),
            songs: parseInt(songsCount.rows[0].count),
            merch: parseInt(merchCount.rows[0].count),
            downloads: parseInt(downloadsCount.rows[0].count),
            events: parseInt(eventsCount.rows[0].count),
            releases: parseInt(releasesCount.rows[0].count)
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        throw new Error("Failed to fetch stats");
    }
}
