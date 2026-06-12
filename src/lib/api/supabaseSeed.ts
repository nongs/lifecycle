"use client";

import type { PostgrestError } from "@supabase/supabase-js";
import { SEED_CATEGORIES } from "@/lib/seed";
import { requireCloudUserId } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

function throwIfError(error: PostgrestError | null): void {
  if (error) throw new Error(error.message);
}

let seedPromise: Promise<void> | null = null;
let seedUserId: string | null = null;

export async function ensureSeededCloud(): Promise<void> {
  const userId = await requireCloudUserId();
  if (!seedPromise || seedUserId !== userId) {
    seedUserId = userId;
    seedPromise = seedCloudCategories();
  }
  await seedPromise;
}

export function resetCloudSeedCache(): void {
  seedPromise = null;
  seedUserId = null;
}

async function seedCloudCategories(): Promise<void> {
  const userId = await requireCloudUserId();
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  throwIfError(error);

  if ((count ?? 0) > 0) return;

  const rows = SEED_CATEGORIES.map((c) => ({
    user_id: userId,
    name: c.name,
    icon: c.icon ?? null,
    sort_order: c.sortOrder,
  }));

  const { error: insertError } = await supabase.from("categories").insert(rows);
  throwIfError(insertError);
}
