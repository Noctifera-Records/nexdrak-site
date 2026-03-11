"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getDownloads() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return null;
  }

  const { rows } = await db.query(`
    SELECT * FROM downloads 
    ORDER BY is_featured DESC, created_at DESC
  `);
  
  return rows;
}

export async function incrementDownloadCount(id: number) {
  // We can allow incrementing count without strict auth check if we want, 
  // but since the page is protected, it's fine. 
  // However, the action might be called from client component.
  // Ideally, we check auth here too.
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.query(`
    UPDATE downloads 
    SET download_count = download_count + 1 
    WHERE id = $1
  `, [id]);
  
  return { success: true };
}
