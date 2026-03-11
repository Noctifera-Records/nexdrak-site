"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getDownloads() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

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
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    throw new Error("Database unavailable");
  }

  const { error } = await supabase.rpc("increment_download_count", { download_id: id });
  
  if (error) {
    throw new Error("Failed to increment download count");
  }
  
  return { success: true };
}
