import type { ActivityLog, ItemViewModel, ManagementItem } from "@/lib/types";
import {
  endOfMonthISO,
  getDaysSince,
  hasLogInMonth,
} from "@/lib/utils/date";
import {
  getLastPerformedAt,
  getNextDueDate,
  getProgressRatio,
  getRemainingDays,
  getUrgency,
  urgencySortOrder,
} from "@/lib/utils/itemStatus";

export function buildItemViewModel(
  item: ManagementItem,
  categoryName: string,
  logs: ActivityLog[]
): ItemViewModel {
  const lastPerformedAt = getLastPerformedAt(logs);
  const elapsedDays = lastPerformedAt
    ? getDaysSince(lastPerformedAt)
    : null;
  const urgency = getUrgency(item, lastPerformedAt, elapsedDays);

  return {
    item,
    categoryName,
    lastPerformedAt,
    elapsedDays,
    remainingDays: getRemainingDays(item, elapsedDays),
    urgency,
    progressRatio: getProgressRatio(item, elapsedDays),
  };
}

export function sortDashboardItems(items: ItemViewModel[]): ItemViewModel[] {
  return [...items].sort((a, b) => {
    const orderA = urgencySortOrder(a.urgency);
    const orderB = urgencySortOrder(b.urgency);
    if (orderA !== orderB) return orderA - orderB;

    if (a.urgency === "ok" && b.urgency === "ok") {
      const remA = a.remainingDays ?? 9999;
      const remB = b.remainingDays ?? 9999;
      return remA - remB;
    }

    const elA = a.elapsedDays ?? 9999;
    const elB = b.elapsedDays ?? 9999;
    return elB - elA;
  });
}

export function needsAttentionThisMonth(
  vm: ItemViewModel,
  logs: ActivityLog[],
  now: Date = new Date()
): boolean {
  const { item, lastPerformedAt, urgency } = vm;
  const year = now.getFullYear();
  const month = now.getMonth();

  if (urgency === "overdue" || urgency === "no_log" || urgency === "soon") {
    return true;
  }

  const monthEnd = endOfMonthISO(now);
  const nextDue = getNextDueDate(lastPerformedAt, item.targetCycleDays);
  if (nextDue && nextDue <= monthEnd) {
    return true;
  }

  return !hasLogInMonth(logs, year, month);
}

export function countMonthlyPending(
  viewModels: ItemViewModel[],
  allLogs: ActivityLog[]
): number {
  const now = new Date();
  return viewModels.filter((vm) => {
    const logs = allLogs.filter((l) => l.itemId === vm.item.id);
    if (!needsAttentionThisMonth(vm, logs, now)) return false;
    return !hasLogInMonth(logs, now.getFullYear(), now.getMonth());
  }).length;
}
