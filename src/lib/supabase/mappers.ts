import { MASTER_USER_ID, type ActivityLog, type Category, type ManagementItem } from "@/lib/types";

export type DbCategory = {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbManagementItem = {
  id: string;
  user_id: string;
  name: string;
  target_cycle_days: number;
  category_id: string;
  status: "active" | "archived";
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type DbActivityLog = {
  id: string;
  user_id: string;
  item_id: string;
  performed_at: string;
  cost: number | string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    userId: MASTER_USER_ID,
    name: row.name,
    icon: row.icon ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapItem(row: DbManagementItem): ManagementItem {
  return {
    id: row.id,
    userId: MASTER_USER_ID,
    name: row.name,
    targetCycleDays: row.target_cycle_days,
    categoryId: row.category_id,
    status: row.status,
    notificationEnabled: row.notification_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLog(row: DbActivityLog): ActivityLog {
  return {
    id: row.id,
    userId: MASTER_USER_ID,
    itemId: row.item_id,
    performedAt: row.performed_at,
    cost: row.cost != null ? Number(row.cost) : undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
