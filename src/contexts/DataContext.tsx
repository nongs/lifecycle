"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as api from "@/lib/api/apiService";
import type { ActivityLog, Category, ManagementItem } from "@/lib/types";

interface DataContextValue {
  ready: boolean;
  categories: Category[];
  items: ManagementItem[];
  archivedItems: ManagementItem[];
  logs: ActivityLog[];
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ManagementItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<ManagementItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const refresh = useCallback(async () => {
    const [cats, active, archived, allLogs] = await Promise.all([
      api.getCategories(),
      api.getItems(false),
      api.getArchivedItems(),
      api.getAllLogs(),
    ]);
    setCategories(cats);
    setItems(active);
    setArchivedItems(archived);
    setLogs(allLogs);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ready,
      categories,
      items,
      archivedItems,
      logs,
      refresh,
    }),
    [ready, categories, items, archivedItems, logs, refresh]
  );

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
