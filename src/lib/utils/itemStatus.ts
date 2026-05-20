import type {
  ActivityLog,
  ManagementItem,
  UrgencyLevel,
} from "@/lib/types";
import { addDays, getDaysSince } from "@/lib/utils/date";

export function getLastPerformedAt(logs: ActivityLog[]): string | null {
  if (logs.length === 0) return null;
  return [...logs].sort((a, b) => {
    const byDate = b.performedAt.localeCompare(a.performedAt);
    if (byDate !== 0) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  })[0].performedAt;
}

export function getUrgency(
  item: ManagementItem,
  lastPerformedAt: string | null,
  elapsedDays: number | null
): UrgencyLevel {
  if (item.targetCycleDays === 0 && lastPerformedAt) {
    const elapsed = elapsedDays ?? 0;
    if (elapsed === 0) return "done_today";
  }
  if (!lastPerformedAt) return "no_log";
  if (elapsedDays === null) return "no_log";
  if (elapsedDays === 0 && item.targetCycleDays > 0) return "done_today";
  if (item.targetCycleDays <= 0) return "done_today";

  const ratio = elapsedDays / item.targetCycleDays;
  if (ratio >= 1) return "overdue";
  if (ratio >= 0.8) return "soon";
  return "ok";
}

export function getProgressRatio(
  item: ManagementItem,
  elapsedDays: number | null
): number {
  if (!elapsedDays || item.targetCycleDays <= 0) return 0;
  return Math.min(1, elapsedDays / item.targetCycleDays);
}

export function getRemainingDays(
  item: ManagementItem,
  elapsedDays: number | null
): number | null {
  if (elapsedDays === null || item.targetCycleDays <= 0) return null;
  return Math.max(0, item.targetCycleDays - elapsedDays);
}

export function getNextDueDate(
  lastPerformedAt: string | null,
  targetCycleDays: number
): string | null {
  if (!lastPerformedAt || targetCycleDays <= 0) return null;
  return addDays(lastPerformedAt, targetCycleDays);
}

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  overdue: "지연",
  soon: "임박",
  ok: "여유",
  no_log: "기록 없음",
  done_today: "오늘 수행함",
};

export function urgencySortOrder(u: UrgencyLevel): number {
  switch (u) {
    case "overdue":
      return 0;
    case "no_log":
      return 1;
    case "soon":
      return 2;
    case "done_today":
      return 3;
    case "ok":
      return 4;
    default:
      return 5;
  }
}

export function getStatusColorClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "overdue":
      return "border-red-200 bg-red-50 text-red-700";
    case "soon":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "ok":
    case "done_today":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export function getProgressBarClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "overdue":
      return "bg-red-500";
    case "soon":
      return "bg-amber-500";
    case "ok":
    case "done_today":
      return "bg-emerald-500";
    default:
      return "bg-slate-300";
  }
}
