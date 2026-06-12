"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as api from "@/lib/api";
import type { DataMode } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ActivityLog, Category, ManagementItem } from "@/lib/types";

interface DataContextValue {
  ready: boolean;
  dataMode: DataMode;
  categories: Category[];
  items: ManagementItem[];
  archivedItems: ManagementItem[];
  logs: ActivityLog[];
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { authReady, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);
  const [dataMode, setDataMode] = useState<DataMode>("local");
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ManagementItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<ManagementItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const refresh = useCallback(async () => {
    const mode = await api.resolveDataMode();
    const [cats, active, archived, allLogs] = await Promise.all([
      api.getCategories(),
      api.getItems(false),
      api.getArchivedItems(),
      api.getAllLogs(),
    ]);
    setDataMode(mode);
    setCategories(cats);
    setItems(active);
    setArchivedItems(archived);
    setLogs(allLogs);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    setReady(false);
    refresh();
  }, [authReady, isAuthenticated, refresh]);

  const value = useMemo(
    () => ({
      ready,
      dataMode,
      categories,
      items,
      archivedItems,
      logs,
      refresh,
    }),
    [ready, dataMode, categories, items, archivedItems, logs, refresh]
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
