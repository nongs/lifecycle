import { resolveDataService } from "@/lib/api/resolveService";
import type { IDataService } from "@/lib/api/types";
import type { ActivityLog, Category, ManagementItem } from "@/lib/types";

export type { IDataService } from "@/lib/api/types";
export type { DataMode } from "@/lib/api/resolveService";
export { resolveDataMode } from "@/lib/api/resolveService";

async function withService<T>(
  fn: (service: IDataService) => Promise<T>
): Promise<T> {
  const service = await resolveDataService();
  return fn(service);
}

export const getCategories = () =>
  withService((s) => s.getCategories());

export const createCategory = (
  input: Pick<Category, "name"> & Partial<Pick<Category, "icon">>
) => withService((s) => s.createCategory(input));

export const updateCategory = (
  id: string,
  partial: Partial<Pick<Category, "name" | "icon" | "sortOrder">>
) => withService((s) => s.updateCategory(id, partial));

export const reorderCategories = (orderedIds: string[]) =>
  withService((s) => s.reorderCategories(orderedIds));

export const deleteCategory = (id: string) =>
  withService((s) => s.deleteCategory(id));

export const countActiveItemsByCategory = (categoryId: string) =>
  withService((s) => s.countActiveItemsByCategory(categoryId));

export const getItems = (includeArchived?: boolean) =>
  withService((s) => s.getItems(includeArchived));

export const getArchivedItems = () =>
  withService((s) => s.getArchivedItems());

export const createItem = (
  input: Pick<
    ManagementItem,
    "name" | "targetCycleDays" | "categoryId" | "notificationEnabled"
  >
) => withService((s) => s.createItem(input));

export const updateItem = (
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
) => withService((s) => s.updateItem(id, partial));

export const archiveItem = (id: string) =>
  withService((s) => s.archiveItem(id));

export const restoreItem = (id: string) =>
  withService((s) => s.restoreItem(id));

export const deleteItem = (id: string) =>
  withService((s) => s.deleteItem(id));

export const getLogsByItem = (itemId: string) =>
  withService((s) => s.getLogsByItem(itemId));

export const getAllLogs = () => withService((s) => s.getAllLogs());

export const getLatestLogByItem = (itemId: string) =>
  withService((s) => s.getLatestLogByItem(itemId));

export const addLog = (
  itemId: string,
  input: Pick<ActivityLog, "performedAt"> &
    Partial<Pick<ActivityLog, "cost" | "note">>
) => withService((s) => s.addLog(itemId, input));

export const updateLog = (
  id: string,
  partial: Partial<Pick<ActivityLog, "performedAt" | "cost" | "note">>
) => withService((s) => s.updateLog(id, partial));

export const deleteLog = (id: string) =>
  withService((s) => s.deleteLog(id));
