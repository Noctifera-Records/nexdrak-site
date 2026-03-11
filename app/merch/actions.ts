"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function getPublicMerch() {
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("merch")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
