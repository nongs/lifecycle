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
  if (elapsedDays === null || item.targetCycleDays <= 0) return 0;
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
      return "border-status-overdue-border bg-status-overdue-bg text-status-overdue-text";
    case "soon":
      return "border-status-soon-border bg-status-soon-bg text-status-soon-text";
    case "ok":
    case "done_today":
      return "border-status-ok-border bg-status-ok-bg text-status-ok-text";
    default:
      return "border-status-neutral-border bg-status-neutral-bg text-status-neutral-text";
  }
}

export function getProgressBarClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "overdue":
      return "bg-status-overdue-bar";
    case "soon":
      return "bg-status-soon-bar";
    case "ok":
    case "done_today":
      return "bg-status-ok-bar";
    default:
      return "bg-status-neutral-bar";
  }
}

export function getProgressTrackClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "overdue":
      return "bg-status-overdue-track";
    case "soon":
      return "bg-status-soon-track";
    case "ok":
    case "done_today":
      return "bg-status-ok-track";
    default:
      return "bg-line";
  }
}
