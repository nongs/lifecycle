"use client";

import type { PostgrestError } from "@supabase/supabase-js";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import { requireCloudUserId } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import {
  mapCategory,
  mapItem,
  mapLog,
  type DbActivityLog,
  type DbCategory,
  type DbManagementItem,
} from "@/lib/supabase/mappers";
import {
  MASTER_USER_ID,
  type ActivityLog,
  type Category,
  type ManagementItem,
} from "@/lib/types";

export type AppDataset = {
  categories: Category[];
  items: ManagementItem[];
  logs: ActivityLog[];
};

export type UserDataPresence = {
  hasData: boolean;
  itemCount: number;
  logCount: number;
};

export type PostLoginAction =
  | { type: "use_cloud" }
  | { type: "offer_migration"; local: UserDataPresence }
  | { type: "fresh_cloud" };

function throwIfError(error: PostgrestError | null): void {
  if (error) throw new Error(error.message);
}

function filterUser<T extends { userId: number }>(rows: T[]): T[] {
  return rows.filter((r) => r.userId === MASTER_USER_ID);
}

export function readLocalDataset(): AppDataset {
  return {
    categories: filterUser(readJSON<Category[]>(STORAGE_KEYS.categories, [])),
    items: filterUser(readJSON<ManagementItem[]>(STORAGE_KEYS.items, [])),
    logs: filterUser(readJSON<ActivityLog[]>(STORAGE_KEYS.logs, [])),
  };
}

export function writeLocalDataset(dataset: AppDataset): void {
  writeJSON(STORAGE_KEYS.categories, dataset.categories);
  writeJSON(STORAGE_KEYS.items, dataset.items);
  writeJSON(STORAGE_KEYS.logs, dataset.logs);
}

export function getLocalUserDataPresence(): UserDataPresence {
  const { items, logs } = readLocalDataset();
  const itemCount = items.length;
  const logCount = logs.length;
  return {
    hasData: itemCount > 0 || logCount > 0,
    itemCount,
    logCount,
  };
}

export async function fetchCloudDataset(): Promise<AppDataset> {
  const userId = await requireCloudUserId();
  const supabase = getSupabase();

  const [catRes, itemRes, logRes] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("management_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at"),
    supabase.from("activity_logs").select("*").eq("user_id", userId),
  ]);

  throwIfError(catRes.error);
  throwIfError(itemRes.error);
  throwIfError(logRes.error);

  return {
    categories: ((catRes.data ?? []) as DbCategory[]).map(mapCategory),
    items: ((itemRes.data ?? []) as DbManagementItem[]).map(mapItem),
    logs: ((logRes.data ?? []) as DbActivityLog[]).map(mapLog),
  };
}

export async function getCloudUserDataPresence(): Promise<UserDataPresence> {
  const userId = await requireCloudUserId();
  const supabase = getSupabase();

  const [itemRes, logRes] = await Promise.all([
    supabase
      .from("management_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  throwIfError(itemRes.error);
  throwIfError(logRes.error);

  const itemCount = itemRes.count ?? 0;
  const logCount = logRes.count ?? 0;
  return {
    hasData: itemCount > 0 || logCount > 0,
    itemCount,
    logCount,
  };
}

/** 로그인 직후 UI 분기용 (B-2) */
export async function evaluatePostLogin(): Promise<PostLoginAction> {
  const cloud = await getCloudUserDataPresence();
  if (cloud.hasData) {
    return { type: "use_cloud" };
  }

  const local = getLocalUserDataPresence();
  if (local.hasData) {
    return { type: "offer_migration", local };
  }

  return { type: "fresh_cloud" };
}

/** 로그아웃 직전: 클라우드 진실 → localStorage 덮어쓰기 */
export async function snapshotCloudToLocal(): Promise<void> {
  const dataset = await fetchCloudDataset();
  writeLocalDataset(dataset);
}

async function clearCloudUserData(userId: string): Promise<void> {
  const supabase = getSupabase();
  const tables = ["activity_logs", "management_items", "categories"] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    throwIfError(error);
  }
}

/** 클라우드 데이터 전체 교체 (가져오기·마이그레이션 공용) */
export async function uploadDatasetToCloud(dataset: AppDataset): Promise<void> {
  const userId = await requireCloudUserId();
  const supabase = getSupabase();
  await clearCloudUserData(userId);

  const categoryIdMap = new Map<string, string>();

  for (const cat of [...dataset.categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  )) {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: cat.name,
        icon: cat.icon ?? null,
        sort_order: cat.sortOrder,
      })
      .select()
      .single();
    throwIfError(error);
    categoryIdMap.set(cat.id, (data as DbCategory).id);
  }

  const itemIdMap = new Map<string, string>();

  for (const item of dataset.items) {
    const categoryId = categoryIdMap.get(item.categoryId);
    if (!categoryId) continue;

    const { data, error } = await supabase
      .from("management_items")
      .insert({
        user_id: userId,
        name: item.name,
        target_cycle_days: item.targetCycleDays,
        category_id: categoryId,
        status: item.status,
        notification_enabled: item.notificationEnabled,
      })
      .select()
      .single();
    throwIfError(error);
    itemIdMap.set(item.id, (data as DbManagementItem).id);
  }

  for (const log of dataset.logs) {
    const itemId = itemIdMap.get(log.itemId);
    if (!itemId) continue;

    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      item_id: itemId,
      performed_at: log.performedAt,
      cost: log.cost ?? null,
      note: log.note ?? null,
    });
    throwIfError(error);
  }
}

/**
 * 로컬 데이터를 클라우드로 1회 업로드.
 * 클라우드에 항목/로그가 이미 있으면 거부 (클라우드 우선).
 */
export async function migrateLocalToCloud(): Promise<void> {
  const cloud = await getCloudUserDataPresence();
  if (cloud.hasData) {
    throw new Error("클라우드에 이미 데이터가 있습니다.");
  }

  const local = readLocalDataset();
  if (!getLocalUserDataPresence().hasData && local.categories.length === 0) {
    return;
  }

  await uploadDatasetToCloud(local);
}
