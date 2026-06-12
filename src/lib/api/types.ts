import type { ActivityLog, Category, ManagementItem } from "@/lib/types";

export interface IDataService {
  getCategories(): Promise<Category[]>;
  createCategory(
    input: Pick<Category, "name"> & Partial<Pick<Category, "icon">>
  ): Promise<Category>;
  updateCategory(
    id: string,
    partial: Partial<Pick<Category, "name" | "icon" | "sortOrder">>
  ): Promise<Category>;
  reorderCategories(orderedIds: string[]): Promise<Category[]>;
  deleteCategory(id: string): Promise<void>;
  countActiveItemsByCategory(categoryId: string): Promise<number>;

  getItems(includeArchived?: boolean): Promise<ManagementItem[]>;
  getArchivedItems(): Promise<ManagementItem[]>;
  createItem(
    input: Pick<
      ManagementItem,
      "name" | "targetCycleDays" | "categoryId" | "notificationEnabled"
    >
  ): Promise<ManagementItem>;
  updateItem(
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
  ): Promise<ManagementItem>;
  archiveItem(id: string): Promise<ManagementItem>;
  restoreItem(id: string): Promise<ManagementItem>;
  deleteItem(id: string): Promise<void>;

  getLogsByItem(itemId: string): Promise<ActivityLog[]>;
  getAllLogs(): Promise<ActivityLog[]>;
  getLatestLogByItem(itemId: string): Promise<ActivityLog | null>;
  addLog(
    itemId: string,
    input: Pick<ActivityLog, "performedAt"> &
      Partial<Pick<ActivityLog, "cost" | "note">>
  ): Promise<ActivityLog>;
  updateLog(
    id: string,
    partial: Partial<Pick<ActivityLog, "performedAt" | "cost" | "note">>
  ): Promise<ActivityLog>;
  deleteLog(id: string): Promise<void>;
}
