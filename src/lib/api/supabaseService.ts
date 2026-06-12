"use client";

import type { PostgrestError } from "@supabase/supabase-js";
import { ensureSeededCloud } from "@/lib/api/supabaseSeed";
import type { IDataService } from "@/lib/api/types";
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
import type { ActivityLog, Category, ManagementItem } from "@/lib/types";

function throwIfError(error: PostgrestError | null): void {
  if (error) throw new Error(error.message);
}

// ——— Category ———

export async function getCategories(): Promise<Category[]> {
  await ensureSeededCloud();
  const userId = await requireCloudUserId();
  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order");
  throwIfError(error);
  return (data as DbCategory[]).map(mapCategory);
}

export async function createCategory(
  input: Pick<Category, "name"> & Partial<Pick<Category, "icon">>
): Promise<Category> {
  await ensureSeededCloud();
  const userId = await requireCloudUserId();
  const existing = await getCategories();
  const maxOrder = existing.reduce((m, c) => Math.max(m, c.sortOrder), -1);

  const { data, error } = await getSupabase()
    .from("categories")
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon ?? null,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();
  throwIfError(error);
  return mapCategory(data as DbCategory);
}

export async function updateCategory(
  id: string,
  partial: Partial<Pick<Category, "name" | "icon" | "sortOrder">>
): Promise<Category> {
  const userId = await requireCloudUserId();
  const patch: Record<string, unknown> = {};
  if (partial.name !== undefined) patch.name = partial.name;
  if (partial.icon !== undefined) patch.icon = partial.icon ?? null;
  if (partial.sortOrder !== undefined) patch.sort_order = partial.sortOrder;

  const { data, error } = await getSupabase()
    .from("categories")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  throwIfError(error);
  if (!data) throw new Error("Category not found");
  return mapCategory(data as DbCategory);
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<Category[]> {
  const userId = await requireCloudUserId();
  const supabase = getSupabase();

  await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("categories")
        .update({ sort_order: i })
        .eq("id", id)
        .eq("user_id", userId)
        .then(({ error }) => throwIfError(error))
    )
  );

  return getCategories();
}

export async function deleteCategory(id: string): Promise<void> {
  const items = await getItems(true);
  if (items.some((i) => i.categoryId === id && i.status === "active")) {
    throw new Error("ACTIVE_ITEMS_LINKED");
  }

  const userId = await requireCloudUserId();
  const { error } = await getSupabase()
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  throwIfError(error);
}

export async function countActiveItemsByCategory(
  categoryId: string
): Promise<number> {
  const items = await getItems(false);
  return items.filter((i) => i.categoryId === categoryId).length;
}

// ——— Items ———

export async function getItems(
  includeArchived = false
): Promise<ManagementItem[]> {
  await ensureSeededCloud();
  const userId = await requireCloudUserId();
  let query = getSupabase()
    .from("management_items")
    .select("*")
    .eq("user_id", userId);

  if (!includeArchived) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query.order("created_at");
  throwIfError(error);
  return (data as DbManagementItem[]).map(mapItem);
}

export async function getArchivedItems(): Promise<ManagementItem[]> {
  const userId = await requireCloudUserId();
  const { data, error } = await getSupabase()
    .from("management_items")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "archived")
    .order("created_at");
  throwIfError(error);
  return (data as DbManagementItem[]).map(mapItem);
}

export async function createItem(
  input: Pick<
    ManagementItem,
    "name" | "targetCycleDays" | "categoryId" | "notificationEnabled"
  >
): Promise<ManagementItem> {
  const userId = await requireCloudUserId();
  const { data, error } = await getSupabase()
    .from("management_items")
    .insert({
      user_id: userId,
      name: input.name,
      target_cycle_days: input.targetCycleDays,
      category_id: input.categoryId,
      status: "active",
      notification_enabled: input.notificationEnabled,
    })
    .select()
    .single();
  throwIfError(error);
  return mapItem(data as DbManagementItem);
}

export async function updateItem(
  id: string,
  partial: Partial<
    Pick<
      ManagementItem,
      | "name"
      | "targetCycleDays"
      | "categoryId"
      | "notificationEnabled"
      | "status"
    >
  >
): Promise<ManagementItem> {
  const userId = await requireCloudUserId();
  const patch: Record<string, unknown> = {};
  if (partial.name !== undefined) patch.name = partial.name;
  if (partial.targetCycleDays !== undefined) {
    patch.target_cycle_days = partial.targetCycleDays;
  }
  if (partial.categoryId !== undefined) patch.category_id = partial.categoryId;
  if (partial.notificationEnabled !== undefined) {
    patch.notification_enabled = partial.notificationEnabled;
  }
  if (partial.status !== undefined) patch.status = partial.status;

  const { data, error } = await getSupabase()
    .from("management_items")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  throwIfError(error);
  if (!data) throw new Error("Item not found");
  return mapItem(data as DbManagementItem);
}

export async function archiveItem(id: string): Promise<ManagementItem> {
  return updateItem(id, { status: "archived" });
}

export async function restoreItem(id: string): Promise<ManagementItem> {
  return updateItem(id, { status: "active" });
}

export async function deleteItem(id: string): Promise<void> {
  const userId = await requireCloudUserId();
  const { error } = await getSupabase()
    .from("management_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  throwIfError(error);
}

// ——— Logs ———

export async function getLogsByItem(itemId: string): Promise<ActivityLog[]> {
  await ensureSeededCloud();
  const userId = await requireCloudUserId();
  const { data, error } = await getSupabase()
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .order("performed_at", { ascending: false })
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data as DbActivityLog[]).map(mapLog);
}

export async function getAllLogs(): Promise<ActivityLog[]> {
  await ensureSeededCloud();
  const userId = await requireCloudUserId();
  const { data, error } = await getSupabase()
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId);
  throwIfError(error);
  return (data as DbActivityLog[]).map(mapLog);
}

export async function getLatestLogByItem(
  itemId: string
): Promise<ActivityLog | null> {
  const logs = await getLogsByItem(itemId);
  return logs[0] ?? null;
}

export async function addLog(
  itemId: string,
  input: Pick<ActivityLog, "performedAt"> &
    Partial<Pick<ActivityLog, "cost" | "note">>
): Promise<ActivityLog> {
  const userId = await requireCloudUserId();
  const { data, error } = await getSupabase()
    .from("activity_logs")
    .insert({
      user_id: userId,
      item_id: itemId,
      performed_at: input.performedAt,
      cost: input.cost ?? null,
      note: input.note ?? null,
    })
    .select()
    .single();
  throwIfError(error);
  return mapLog(data as DbActivityLog);
}

export async function updateLog(
  id: string,
  partial: Partial<Pick<ActivityLog, "performedAt" | "cost" | "note">>
): Promise<ActivityLog> {
  const userId = await requireCloudUserId();
  const patch: Record<string, unknown> = {};
  if (partial.performedAt !== undefined) patch.performed_at = partial.performedAt;
  if (partial.cost !== undefined) patch.cost = partial.cost ?? null;
  if (partial.note !== undefined) patch.note = partial.note ?? null;

  const { data, error } = await getSupabase()
    .from("activity_logs")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  throwIfError(error);
  if (!data) throw new Error("Log not found");
  return mapLog(data as DbActivityLog);
}

export async function deleteLog(id: string): Promise<void> {
  const userId = await requireCloudUserId();
  const { error } = await getSupabase()
    .from("activity_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  throwIfError(error);
}

const supabaseService: IDataService = {
  getCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
  countActiveItemsByCategory,
  getItems,
  getArchivedItems,
  createItem,
  updateItem,
  archiveItem,
  restoreItem,
  deleteItem,
  getLogsByItem,
  getAllLogs,
  getLatestLogByItem,
  addLog,
  updateLog,
  deleteLog,
};

export default supabaseService;
