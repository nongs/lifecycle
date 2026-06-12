"use client";

import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import { SEED_CATEGORIES, createSeedCategory, newId } from "@/lib/seed";
import {
  MASTER_USER_ID,
  type ActivityLog,
  type Category,
  type ManagementItem,
} from "@/lib/types";

function ensureSeeded(): void {
  const existing = readJSON<Category[]>(STORAGE_KEYS.categories, []);
  if (existing.length > 0) return;

  const categories = SEED_CATEGORIES.map((c, i) =>
    createSeedCategory(c, `seed-cat-${i}`)
  );
  writeJSON(STORAGE_KEYS.categories, categories);
  writeJSON(STORAGE_KEYS.items, []);
  writeJSON(STORAGE_KEYS.logs, []);
}

function filterUser<T extends { userId: number }>(rows: T[]): T[] {
  return rows.filter((r) => r.userId === MASTER_USER_ID);
}

const now = () => new Date().toISOString();

// ——— Category ———

export async function getCategories(): Promise<Category[]> {
  ensureSeeded();
  const rows = filterUser(readJSON<Category[]>(STORAGE_KEYS.categories, []));
  return rows.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createCategory(
  input: Pick<Category, "name"> & Partial<Pick<Category, "icon">>
): Promise<Category> {
  ensureSeeded();
  const rows = filterUser(readJSON<Category[]>(STORAGE_KEYS.categories, []));
  const maxOrder = rows.reduce((m, c) => Math.max(m, c.sortOrder), -1);
  const t = now();
  const category: Category = {
    id: newId(),
    userId: MASTER_USER_ID,
    name: input.name,
    icon: input.icon,
    sortOrder: maxOrder + 1,
    createdAt: t,
    updatedAt: t,
  };
  writeJSON(STORAGE_KEYS.categories, [...rows, category]);
  return category;
}

export async function updateCategory(
  id: string,
  partial: Partial<Pick<Category, "name" | "icon" | "sortOrder">>
): Promise<Category> {
  const rows = filterUser(readJSON<Category[]>(STORAGE_KEYS.categories, []));
  const idx = rows.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("Category not found");
  const updated: Category = {
    ...rows[idx],
    ...partial,
    updatedAt: now(),
  };
  const next = [...rows];
  next[idx] = updated;
  writeJSON(STORAGE_KEYS.categories, next);
  return updated;
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<Category[]> {
  const rows = filterUser(readJSON<Category[]>(STORAGE_KEYS.categories, []));
  const map = new Map(rows.map((c) => [c.id, c]));
  const reordered = orderedIds
    .map((id, i) => {
      const c = map.get(id);
      if (!c) return null;
      return { ...c, sortOrder: i, updatedAt: now() };
    })
    .filter((c): c is Category => c !== null);
  const rest = rows.filter((c) => !orderedIds.includes(c.id));
  const merged = [...reordered, ...rest].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  writeJSON(STORAGE_KEYS.categories, merged);
  return merged;
}

export async function deleteCategory(id: string): Promise<void> {
  const items = await getItems(true);
  if (items.some((i) => i.categoryId === id && i.status === "active")) {
    throw new Error("ACTIVE_ITEMS_LINKED");
  }
  const rows = filterUser(readJSON<Category[]>(STORAGE_KEYS.categories, []));
  writeJSON(
    STORAGE_KEYS.categories,
    rows.filter((c) => c.id !== id)
  );
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
  ensureSeeded();
  const rows = filterUser(
    readJSON<ManagementItem[]>(STORAGE_KEYS.items, [])
  );
  if (includeArchived) return rows;
  return rows.filter((i) => i.status === "active");
}

export async function getArchivedItems(): Promise<ManagementItem[]> {
  ensureSeeded();
  return filterUser(readJSON<ManagementItem[]>(STORAGE_KEYS.items, [])).filter(
    (i) => i.status === "archived"
  );
}

export async function createItem(
  input: Pick<
    ManagementItem,
    "name" | "targetCycleDays" | "categoryId" | "notificationEnabled"
  >
): Promise<ManagementItem> {
  const t = now();
  const item: ManagementItem = {
    id: newId(),
    userId: MASTER_USER_ID,
    name: input.name,
    targetCycleDays: input.targetCycleDays,
    categoryId: input.categoryId,
    status: "active",
    notificationEnabled: input.notificationEnabled,
    createdAt: t,
    updatedAt: t,
  };
  const rows = filterUser(readJSON<ManagementItem[]>(STORAGE_KEYS.items, []));
  writeJSON(STORAGE_KEYS.items, [...rows, item]);
  return item;
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
  const rows = filterUser(readJSON<ManagementItem[]>(STORAGE_KEYS.items, []));
  const idx = rows.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error("Item not found");
  const updated: ManagementItem = {
    ...rows[idx],
    ...partial,
    updatedAt: now(),
  };
  const next = [...rows];
  next[idx] = updated;
  writeJSON(STORAGE_KEYS.items, next);
  return updated;
}

export async function archiveItem(id: string): Promise<ManagementItem> {
  return updateItem(id, { status: "archived" });
}

export async function restoreItem(id: string): Promise<ManagementItem> {
  return updateItem(id, { status: "active" });
}

export async function deleteItem(id: string): Promise<void> {
  const rows = filterUser(readJSON<ManagementItem[]>(STORAGE_KEYS.items, []));
  writeJSON(
    STORAGE_KEYS.items,
    rows.filter((i) => i.id !== id)
  );
  const logs = filterUser(readJSON<ActivityLog[]>(STORAGE_KEYS.logs, []));
  writeJSON(
    STORAGE_KEYS.logs,
    logs.filter((l) => l.itemId !== id)
  );
}

// ——— Logs ———

export async function getLogsByItem(itemId: string): Promise<ActivityLog[]> {
  ensureSeeded();
  return filterUser(readJSON<ActivityLog[]>(STORAGE_KEYS.logs, []))
    .filter((l) => l.itemId === itemId)
    .sort((a, b) => {
      const byDate = b.performedAt.localeCompare(a.performedAt);
      if (byDate !== 0) return byDate;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export async function getAllLogs(): Promise<ActivityLog[]> {
  ensureSeeded();
  return filterUser(readJSON<ActivityLog[]>(STORAGE_KEYS.logs, []));
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
  const t = now();
  const log: ActivityLog = {
    id: newId(),
    userId: MASTER_USER_ID,
    itemId,
    performedAt: input.performedAt,
    cost: input.cost,
    note: input.note,
    createdAt: t,
    updatedAt: t,
  };
  const rows = filterUser(readJSON<ActivityLog[]>(STORAGE_KEYS.logs, []));
  writeJSON(STORAGE_KEYS.logs, [...rows, log]);
  return log;
}

export async function updateLog(
  id: string,
  partial: Partial<Pick<ActivityLog, "performedAt" | "cost" | "note">>
): Promise<ActivityLog> {
  const rows = filterUser(readJSON<ActivityLog[]>(STORAGE_KEYS.logs, []));
  const idx = rows.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error("Log not found");
  const updated: ActivityLog = {
    ...rows[idx],
    ...partial,
    updatedAt: now(),
  };
  const next = [...rows];
  next[idx] = updated;
  writeJSON(STORAGE_KEYS.logs, next);
  return updated;
}

export async function deleteLog(id: string): Promise<void> {
  const rows = filterUser(readJSON<ActivityLog[]>(STORAGE_KEYS.logs, []));
  writeJSON(
    STORAGE_KEYS.logs,
    rows.filter((l) => l.id !== id)
  );
}
