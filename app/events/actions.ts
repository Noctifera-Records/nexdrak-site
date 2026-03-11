"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function getPublicEvents() {
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return [];
  }
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("date", today)
    .order("date", { ascending: true });

  if (error || !data) return [];
  return data;
}
