import type { ActivityLog, ManagementItem } from "@/lib/types";
import { formatDateISO, startOfDay } from "@/lib/utils/date";

/** ISO 날짜 두 개 사이의 일수 (앞 ≤ 뒤 가정 시 양수) */
export function daysBetweenEarlierLater(earlier: string, later: string): number {
  const a = startOfDay(new Date(earlier + "T00:00:00")).getTime();
  const b = startOfDay(new Date(later + "T00:00:00")).getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * 항목별 실제 수행 간격(일)의 평균. 로그가 2개 미만이면 null.
 * performedAt 오름차순으로 인접 기록 간격만 사용.
 */
export function averageActualCycleDays(
  logs: ActivityLog[]
): number | null {
  if (logs.length < 2) return null;
  const sorted = [...logs].sort((a, b) => {
    const d = a.performedAt.localeCompare(b.performedAt);
    if (d !== 0) return d;
    return a.createdAt.localeCompare(b.createdAt);
  });
  let sum = 0;
  let count = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetweenEarlierLater(
      sorted[i - 1].performedAt,
      sorted[i].performedAt
    );
    if (gap >= 0) {
      sum += gap;
      count++;
    }
  }
  if (count === 0) return null;
  return Math.round((sum / count) * 10) / 10;
}

export type MonthSpend = { yearMonth: string; total: number; count: number };

export type MonthOverMonth = {
  kind: "up" | "down" | "same";
  diff: number;
};

/** `2025-03` → `2025년 3월` */
export function formatYearMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  return `${y}년 ${Number(m)}월`;
}

export function previousYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${month}`;
}

export function compareMonthOverMonth(
  yearMonth: string,
  totalByMonth: Map<string, number>
): MonthOverMonth {
  const current = totalByMonth.get(yearMonth) ?? 0;
  const previous = totalByMonth.get(previousYearMonth(yearMonth)) ?? 0;
  const delta = current - previous;
  if (delta > 0) return { kind: "up", diff: delta };
  if (delta < 0) return { kind: "down", diff: Math.abs(delta) };
  return { kind: "same", diff: 0 };
}

export type MonthlySpendDetail = {
  logId: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  performedAt: string;
  cost: number;
  note?: string;
};

/** performedAt 기준 YYYY-MM, cost가 있는 로그만 합산 */
export function monthlySpendTotals(logs: ActivityLog[]): MonthSpend[] {
  const totalMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  for (const log of logs) {
    if (log.cost == null || log.cost <= 0) continue;
    const ym = log.performedAt.slice(0, 7);
    totalMap.set(ym, (totalMap.get(ym) ?? 0) + log.cost);
    countMap.set(ym, (countMap.get(ym) ?? 0) + 1);
  }
  return [...totalMap.entries()]
    .map(([yearMonth, total]) => ({
      yearMonth,
      total,
      count: countMap.get(yearMonth) ?? 0,
    }))
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
}

export function monthSpendTotalMap(rows: MonthSpend[]): Map<string, number> {
  return new Map(rows.map((r) => [r.yearMonth, r.total]));
}

/** 비용이 있는 연도 목록 (최신순) */
export function yearsFromMonthRows(rows: MonthSpend[]): string[] {
  const years = new Set(rows.map((r) => r.yearMonth.slice(0, 4)));
  return [...years].sort((a, b) => b.localeCompare(a));
}

export function filterMonthRowsByYear(
  rows: MonthSpend[],
  year: string
): MonthSpend[] {
  if (!year) return [];
  return rows.filter((r) => r.yearMonth.startsWith(`${year}-`));
}

export function totalSpendInMonth(
  logs: ActivityLog[],
  yearMonth: string
): number {
  return logs
    .filter(
      (l) =>
        l.performedAt.startsWith(yearMonth) &&
        l.cost != null &&
        l.cost > 0
    )
    .reduce((s, l) => s + (l.cost ?? 0), 0);
}

/** 해당 월 비용 입력 로그 상세 (수행일 최신순) */
export function monthlySpendDetails(
  yearMonth: string,
  logs: ActivityLog[],
  itemNameById: (itemId: string) => string,
  categoryNameByItemId: (itemId: string) => string
): MonthlySpendDetail[] {
  return logs
    .filter(
      (l) =>
        l.performedAt.startsWith(yearMonth) &&
        l.cost != null &&
        l.cost > 0
    )
    .map((log) => ({
      logId: log.id,
      itemId: log.itemId,
      itemName: itemNameById(log.itemId),
      categoryName: categoryNameByItemId(log.itemId),
      performedAt: log.performedAt,
      cost: log.cost!,
      note: log.note,
    }))
    .sort((a, b) => {
      const byDate = b.performedAt.localeCompare(a.performedAt);
      if (byDate !== 0) return byDate;
      return b.logId.localeCompare(a.logId);
    });
}

/** 항목별 비용 합계 (전체 기간) */
export function spendByItemId(logs: ActivityLog[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const log of logs) {
    if (log.cost == null || log.cost <= 0) continue;
    m.set(log.itemId, (m.get(log.itemId) ?? 0) + log.cost);
  }
  return m;
}

export function currentYearMonth(): string {
  return formatDateISO(new Date()).slice(0, 7);
}
