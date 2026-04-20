"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { getAuth } from "@/lib/auth";
import { createRequestContextDb } from "@/lib/db";
import { headers } from "next/headers";

export async function getDownloads() {
  const { db, client } = await createRequestContextDb();
  
  let session;
  try {
    const auth = getAuth(db);
    session = await auth.api.getSession({
      headers: await headers()
    });
  } catch (e) {
    console.error("getDownloads auth error", e);
    session = null;
  } finally {
    await client.end();
  }

  if (!session) {
    return null;
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("downloads")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  
  if (error || !data) return [];
  return data;
}

export async function incrementDownloadCount(id: number) {
  const { db, client } = await createRequestContextDb();
  
  let session;
  try {
    const auth = getAuth(db);
    session = await auth.api.getSession({
      headers: await headers()
    });
  } catch (e) {
    console.error("incrementDownloadCount auth error", e);
    session = null;
  } finally {
    await client.end();
  }

  if (!session) {
    throw new Error("Unauthorized");
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    throw new Error("Database unavailable");
  }

  try {
    const { error } = await supabase.rpc("increment_download_count", { download_id: id });
    if (error) {
      console.warn("Could not increment download count:", error.message);
    }
  } catch (err) {
    console.error("Error in incrementDownloadCount:", err);
  }
  
  return { success: true };
}
