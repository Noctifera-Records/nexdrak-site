"use server";

import { getAuth } from "@/lib/auth";
import { getRequestContextDb } from "@/lib/db";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export async function getDownloads() {
  // Obtenemos la conexión compartida de esta petición
  const { db } = await getRequestContextDb();
  
  try {
    const auth = getAuth(db);
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) return null;

    // USAMOS DRIZZLE para ser mucho más rápidos que el cliente de Supabase
    // Esto evita abrir una segunda conexión HTTP/PostgREST
    const result = await (db as any).execute(sql`SELECT * FROM downloads ORDER BY is_featured DESC, created_at DESC`);
    return result.rows || [];
  } catch (e) {
    console.error("getDownloads error", e);
    return [];
  }
}

export async function incrementDownloadCount(id: number) {
  const { db } = await getRequestContextDb();
  
  try {
    const auth = getAuth(db);
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Ejecutamos el incremento directamente en SQL
    await (db as any).execute(sql`SELECT increment_download_count(${id})`);
    return { success: true };
  } catch (err) {
    console.error("Error in incrementDownloadCount:", err);
    return { success: false };
  }
}
