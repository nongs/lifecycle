"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthlySpendAccordionItem } from "@/components/stats/MonthlySpendAccordionItem";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import type { ActivityLog } from "@/lib/types";
import {
  filterMonthRowsByYear,
  monthSpendTotalMap,
  type MonthSpend,
  yearsFromMonthRows,
} from "@/lib/utils/stats";

type Props = {
  open: boolean;
  onClose: () => void;
  monthRows: MonthSpend[];
  logs: ActivityLog[];
  itemName: (itemId: string) => string;
  categoryNameByItemId: (itemId: string) => string;
};

export function MonthlySpendAllModal({
  open,
  onClose,
  monthRows,
  logs,
  itemName,
  categoryNameByItemId,
}: Props) {
  const years = useMemo(() => yearsFromMonthRows(monthRows), [monthRows]);
  const monthTotalMap = useMemo(
    () => monthSpendTotalMap(monthRows),
    [monthRows]
  );

  const [selectedYear, setSelectedYear] = useState("");
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    if (!open) {
      setExpandedMonths(new Set());
      return;
    }
    if (years.length > 0) {
      setSelectedYear(years[0]);
    }
  }, [open, years]);

  const rowsInYear = useMemo(
    () => filterMonthRowsByYear(monthRows, selectedYear),
    [monthRows, selectedYear]
  );

  const toggleMonth = (yearMonth: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(yearMonth)) {
        next.delete(yearMonth);
      } else {
        next.add(yearMonth);
      }
      return next;
    });
  };

  const collapseMonth = (yearMonth: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      next.delete(yearMonth);
      return next;
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="월별 비용 전체" fullHeight>
      {years.length === 0 ? (
        <p className="text-sm text-ink-muted">비용 기록이 없습니다.</p>
      ) : (
        <>
          <div
            className="-mx-1 mb-4 overflow-x-auto px-1 pb-1"
            role="tablist"
            aria-label="연도 선택"
          >
            <div className="flex flex-nowrap gap-2">
              {years.map((year) => (
                <Chip
                  key={year}
                  role="tab"
                  aria-selected={selectedYear === year}
                  active={selectedYear === year}
                  onClick={() => {
                    setSelectedYear(year);
                    setExpandedMonths(new Set());
                  }}
                >
                  {year}년
                </Chip>
              ))}
            </div>
          </div>

          {rowsInYear.length === 0 ? (
            <p className="text-sm text-ink-muted">
              {selectedYear}년 비용 기록이 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rowsInYear.map((row) => (
                <MonthlySpendAccordionItem
                  key={row.yearMonth}
                  row={row}
                  monthTotalMap={monthTotalMap}
                  logs={logs}
                  itemName={itemName}
                  categoryNameByItemId={categoryNameByItemId}
                  expanded={expandedMonths.has(row.yearMonth)}
                  onToggle={() => toggleMonth(row.yearMonth)}
                  onCollapse={() => collapseMonth(row.yearMonth)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
