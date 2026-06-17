import type {
  ActivityLog,
  Category,
  ManagementItem,
  UrgencyLevel,
} from "@/lib/types";
import { buildItemViewModel } from "@/lib/utils/dashboard";
import { URGENCY_LABELS } from "@/lib/utils/itemStatus";
import { shouldNotifyItem } from "@/lib/notifications/reminderState";

export type ReminderPayload = {
  itemId: string;
  urgency: UrgencyLevel;
  title: string;
  body: string;
  tag: string;
  url: string;
};

const NOTIFY_URGENCIES = new Set<UrgencyLevel>(["overdue", "soon"]);

function categoryName(
  categories: Category[],
  categoryId: string
): string {
  return categories.find((c) => c.id === categoryId)?.name ?? "";
}

function buildBody(
  name: string,
  urgency: UrgencyLevel,
  elapsedDays: number | null,
  remainingDays: number | null
): string {
  if (urgency === "overdue") {
    const days = elapsedDays ?? 0;
    return `${name} — 목표 주기를 넘겼습니다. (경과 ${days}일)`;
  }
  const left = remainingDays ?? 0;
  return `${name} — 곧 주기가 됩니다. (잔여 ${left}일)`;
}

export function collectReminders(
  items: ManagementItem[],
  logs: ActivityLog[],
  categories: Category[],
  homeUrl: string
): ReminderPayload[] {
  const logsByItem = new Map<string, ActivityLog[]>();
  for (const log of logs) {
    const list = logsByItem.get(log.itemId) ?? [];
    list.push(log);
    logsByItem.set(log.itemId, list);
  }

  const reminders: ReminderPayload[] = [];

  for (const item of items) {
    if (item.status !== "active" || !item.notificationEnabled) continue;

    const vm = buildItemViewModel(
      item,
      categoryName(categories, item.categoryId),
      logsByItem.get(item.id) ?? []
    );

    if (!NOTIFY_URGENCIES.has(vm.urgency)) continue;
    if (!shouldNotifyItem(item.id, vm.urgency)) continue;

    reminders.push({
      itemId: item.id,
      urgency: vm.urgency,
      title: `LifeCycle · ${URGENCY_LABELS[vm.urgency]}`,
      body: buildBody(
        item.name,
        vm.urgency,
        vm.elapsedDays,
        vm.remainingDays
      ),
      tag: `lifecycle-reminder-${item.id}`,
      url: homeUrl,
    });
  }

  return reminders;
}
