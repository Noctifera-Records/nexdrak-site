"use server";

import { db } from "@/lib/db";

export async function getPublicMerch() {
  const { rows } = await db.query(`
    SELECT * FROM merch 
    WHERE is_available = true 
    ORDER BY created_at DESC
  `);
  
  return rows;
}
