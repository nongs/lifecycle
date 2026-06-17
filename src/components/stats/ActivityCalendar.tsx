"use client";

import { useMemo, useState } from "react";
import type { ActivityLog } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  activityOnDate,
  buildMonthCalendar,
  formatCalendarMonthLabel,
  initialCalendarMonth,
  logCountByDate,
  shiftMonth,
  weekdayLabels,
} from "@/lib/utils/activityCalendar";

type Props = {
  logs: ActivityLog[];
  itemName: (itemId: string) => string;
  categoryNameByItemId: (itemId: string) => string;
};

export function ActivityCalendar({
  logs,
  itemName,
  categoryNameByItemId,
}: Props) {
  const initial = useMemo(() => initialCalendarMonth(logs), [logs]);
  const [year, setYear] = useState(initial.year);
  const [monthIndex, setMonthIndex] = useState(initial.monthIndex);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const counts = useMemo(() => logCountByDate(logs), [logs]);
  const cells = useMemo(
    () => buildMonthCalendar(year, monthIndex, counts),
    [year, monthIndex, counts]
  );

  const selectedEntries = useMemo(() => {
    if (!selectedDate) return [];
    return activityOnDate(
      selectedDate,
      logs,
      itemName,
      categoryNameByItemId
    );
  }, [selectedDate, logs, itemName, categoryNameByItemId]);

  const moveMonth = (delta: number) => {
    const next = shiftMonth(year, monthIndex, delta);
    setYear(next.year);
    setMonthIndex(next.monthIndex);
    setSelectedDate(null);
  };

  if (logs.length === 0) {
    return (
      <EmptyState
        title="수행 기록이 없습니다"
        description="대시보드에서 항목을 완료하면 날짜별로 표시됩니다"
      />
    );
  }

  const formatSelectedLabel = (date: string) => {
    const [y, m, d] = date.split("-").map(Number);
    return `${y}년 ${m}월 ${d}일`;
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          className="px-2 py-1.5 text-lg leading-none"
          aria-label="이전 달"
          onClick={() => moveMonth(-1)}
        >
          ‹
        </Button>
        <h2 className="text-sm font-semibold text-ink">
          {formatCalendarMonthLabel(year, monthIndex)}
        </h2>
        <Button
          variant="ghost"
          className="px-2 py-1.5 text-lg leading-none"
          aria-label="다음 달"
          onClick={() => moveMonth(1)}
        >
          ›
        </Button>
      </div>

      <Card className="p-3">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdayLabels().map((label) => (
            <div
              key={label}
              className="py-1 text-center text-xs font-medium text-ink-faint"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.date || cell.day == null) {
              return <div key={`pad-${i}`} className="aspect-square" />;
            }

            const selected = selectedDate === cell.date;
            const hasActivity = cell.logCount > 0;

            return (
              <button
                key={cell.date}
                type="button"
                aria-label={`${cell.day}일${
                  hasActivity ? `, 완료 ${cell.logCount}건` : ""
                }`}
                aria-pressed={selected}
                onClick={() =>
                  setSelectedDate((prev) =>
                    prev === cell.date ? null : cell.date
                  )
                }
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : cell.isToday
                      ? "ring-1 ring-primary/40 bg-accent-soft/80 text-ink"
                      : hasActivity
                        ? "bg-accent-soft text-ink hover:bg-accent-soft/90"
                        : "text-ink-muted hover:bg-accent-soft/60"
                }`}
              >
                <span className="font-medium leading-none">{cell.day}</span>
                {hasActivity ? (
                  <span
                    className={`mt-1 text-[10px] leading-none ${
                      selected ? "text-primary-foreground/90" : "text-primary"
                    }`}
                  >
                    {cell.logCount}
                  </span>
                ) : (
                  <span className="mt-1 h-2.5" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDate && (
        <Card className="mt-4 p-4">
          <h3 className="text-sm font-semibold text-ink">
            {formatSelectedLabel(selectedDate)}
          </h3>
          {selectedEntries.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">완료 기록이 없습니다.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {selectedEntries.map((entry) => (
                <li
                  key={entry.logId}
                  className="rounded-xl border border-line bg-surface-muted/80 px-3 py-2.5 text-sm"
                >
                  <p className="font-medium text-ink">{entry.itemName}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {entry.categoryName}
                  </p>
                  {entry.note ? (
                    <p className="mt-1.5 text-xs text-ink-muted">{entry.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <p className="mt-3 px-1 text-xs text-ink-faint">
        날짜를 누르면 그날 완료한 항목을 볼 수 있습니다. 보기 전용입니다.
      </p>
    </div>
  );
}
