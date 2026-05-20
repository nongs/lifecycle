export const MASTER_USER_ID = 1;

export type ItemStatus = "active" | "archived";

export type UrgencyLevel = "overdue" | "soon" | "ok" | "no_log" | "done_today";

export type CycleUnit = "day" | "week" | "month" | "year";

export interface Category {
  id: string;
  userId: number;
  name: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagementItem {
  id: string;
  userId: number;
  name: string;
  targetCycleDays: number;
  categoryId: string;
  status: ItemStatus;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: number;
  itemId: string;
  performedAt: string;
  cost?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemViewModel {
  item: ManagementItem;
  categoryName: string;
  lastPerformedAt: string | null;
  elapsedDays: number | null;
  remainingDays: number | null;
  urgency: UrgencyLevel;
  progressRatio: number;
}
