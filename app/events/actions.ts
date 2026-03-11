"use server";

import { db } from "@/lib/db";

export async function getPublicEvents() {
    const res = await db.query(`
        SELECT * FROM events 
        WHERE is_published = true 
        AND date >= CURRENT_DATE
        ORDER BY date ASC
    `);
    
    return res.rows;
}
