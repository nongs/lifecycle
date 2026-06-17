import type { ActivityLog } from "@/lib/types";
import { formatDateISO, todayISO } from "@/lib/utils/date";

export type ActivityDayEntry = {
  logId: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  performedAt: string;
  note?: string;
};

export type CalendarCell = {
  date: string | null;
  day: number | null;
  isToday: boolean;
  logCount: number;
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number
): { year: number; monthIndex: number } {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

export function formatCalendarMonthLabel(year: number, monthIndex: number): string {
  return `${year}년 ${monthIndex + 1}월`;
}

/** performedAt(YYYY-MM-DD) → 해당 일 로그 수 */
export function logCountByDate(logs: ActivityLog[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const log of logs) {
    const date = log.performedAt.slice(0, 10);
    map.set(date, (map.get(date) ?? 0) + 1);
  }
  return map;
}

export function buildMonthCalendar(
  year: number,
  monthIndex: number,
  counts: Map<string, number>
): CalendarCell[] {
  const today = todayISO();
  const first = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const startPad = first.getDay();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ date: null, day: null, isToday: false, logCount: 0 });
  }

  for (let day = 1; day <= lastDay; day++) {
    const date = formatDateISO(new Date(year, monthIndex, day));
    cells.push({
      date,
      day,
      isToday: date === today,
      logCount: counts.get(date) ?? 0,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null, isToday: false, logCount: 0 });
  }

  return cells;
}

export function activityOnDate(
  date: string,
  logs: ActivityLog[],
  itemNameById: (itemId: string) => string,
  categoryNameByItemId: (itemId: string) => string
): ActivityDayEntry[] {
  return logs
    .filter((log) => log.performedAt.slice(0, 10) === date)
    .map((log) => ({
      logId: log.id,
      itemId: log.itemId,
      itemName: itemNameById(log.itemId),
      categoryName: categoryNameByItemId(log.itemId),
      performedAt: log.performedAt,
      note: log.note,
    }))
    .sort((a, b) => a.itemName.localeCompare(b.itemName, "ko"));
}

/** 로그가 있는 가장 최근 월 (없으면 이번 달) */
export function initialCalendarMonth(logs: ActivityLog[]): {
  year: number;
  monthIndex: number;
} {
  if (logs.length === 0) {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  }
  const latest = [...logs].sort((a, b) =>
    b.performedAt.localeCompare(a.performedAt)
  )[0];
  const d = new Date(latest.performedAt + "T00:00:00");
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}
