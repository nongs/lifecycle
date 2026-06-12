"use client";

import type { IDataService } from "@/lib/api/types";
import type { ActivityLog, Category, ManagementItem } from "@/lib/types";

const MSG =
  "클라우드 API는 아직 연결되지 않았습니다. B단계(Supabase) 구현 후 사용할 수 있습니다.";

function notReady(): never {
  throw new Error(MSG);
}

/** B-1에서 Supabase 구현체로 교체 예정 */
export const cloudPlaceholderService: IDataService = {
  getCategories: async () => notReady(),
  createCategory: async () => notReady(),
  updateCategory: async () => notReady(),
  reorderCategories: async () => notReady(),
  deleteCategory: async () => notReady(),
  countActiveItemsByCategory: async () => notReady(),

  getItems: async () => notReady(),
  getArchivedItems: async () => notReady(),
  createItem: async () => notReady(),
  updateItem: async () => notReady(),
  archiveItem: async () => notReady(),
  restoreItem: async () => notReady(),
  deleteItem: async () => notReady(),

  getLogsByItem: async () => notReady(),
  getAllLogs: async () => notReady(),
  getLatestLogByItem: async () => notReady(),
  addLog: async () => notReady(),
  updateLog: async () => notReady(),
  deleteLog: async () => notReady(),
};
