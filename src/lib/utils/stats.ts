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

export type MonthSpend = { yearMonth: string; total: number };

/** performedAt 기준 YYYY-MM, cost가 있는 로그만 합산 */
export function monthlySpendTotals(logs: ActivityLog[]): MonthSpend[] {
  const map = new Map<string, number>();
  for (const log of logs) {
    if (log.cost == null || log.cost <= 0) continue;
    const ym = log.performedAt.slice(0, 7);
    map.set(ym, (map.get(ym) ?? 0) + log.cost);
  }
  return [...map.entries()]
    .map(([yearMonth, total]) => ({ yearMonth, total }))
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
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
