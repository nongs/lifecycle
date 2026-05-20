"use client";

import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import {
  buildItemViewModel,
  sortDashboardItems,
} from "@/lib/utils/dashboard";
import type { ItemViewModel } from "@/lib/types";

export function useItemViewModels(activeOnly = true) {
  const { categories, items, archivedItems, logs, ready } = useData();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const viewModels: ItemViewModel[] = useMemo(() => {
    const sourceItems = activeOnly ? items : [...items, ...archivedItems];
    return sourceItems.map((item) => {
      const itemLogs = logs.filter((l) => l.itemId === item.id);
      return buildItemViewModel(
        item,
        categoryMap.get(item.categoryId) ?? "미분류",
        itemLogs
      );
    });
  }, [activeOnly, items, archivedItems, logs, categoryMap]);

  const dashboardSorted = useMemo(
    () => sortDashboardItems(viewModels.filter((vm) => vm.item.status === "active")),
    [viewModels]
  );

  return { ready, viewModels, dashboardSorted, categories, logs };
}
