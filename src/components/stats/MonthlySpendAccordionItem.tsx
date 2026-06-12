"use client";

import { useMemo } from "react";
import { MonthlySpendDetailList } from "@/components/stats/MonthlySpendDetailList";
import { MonthlySpendRow } from "@/components/stats/MonthlySpendRow";
import type { ActivityLog } from "@/lib/types";
import {
  monthlySpendDetails,
  type MonthSpend,
} from "@/lib/utils/stats";

type Props = {
  row: MonthSpend;
  monthTotalMap: Map<string, number>;
  logs: ActivityLog[];
  itemName: (itemId: string) => string;
  categoryNameByItemId: (itemId: string) => string;
  expanded: boolean;
  onToggle: () => void;
  onCollapse: () => void;
};

export function MonthlySpendAccordionItem({
  row,
  monthTotalMap,
  logs,
  itemName,
  categoryNameByItemId,
  expanded,
  onToggle,
  onCollapse,
}: Props) {
  const details = useMemo(
    () =>
      monthlySpendDetails(
        row.yearMonth,
        logs,
        itemName,
        categoryNameByItemId
      ),
    [row.yearMonth, logs, itemName, categoryNameByItemId]
  );

  return (
    <li className="card overflow-hidden">
      <MonthlySpendRow
        row={row}
        monthTotalMap={monthTotalMap}
        onClick={onToggle}
        expanded={expanded}
      />
      {expanded ? (
        <div className="border-t border-line px-3.5 pb-3 pt-3">
          <div className="max-h-[min(50vh,20rem)] overflow-y-auto">
            <MonthlySpendDetailList details={details} variant="plain" />
          </div>
          <button
            type="button"
            onClick={onCollapse}
            className="mt-3 w-full py-2 text-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            접기
          </button>
        </div>
      ) : null}
    </li>
  );
}
