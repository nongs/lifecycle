"use client";

import { readJSON, writeJSON } from "@/lib/storage";
import { todayISO } from "@/lib/utils/date";
import type { UrgencyLevel } from "@/lib/types";

const STATE_KEY = "lifecycle:notification-state";

type ItemNotificationState = {
  date: string;
  urgency: UrgencyLevel;
};

type NotificationState = Record<string, ItemNotificationState>;

function readState(): NotificationState {
  return readJSON<NotificationState>(STATE_KEY, {});
}

export function shouldNotifyItem(
  itemId: string,
  urgency: UrgencyLevel
): boolean {
  const prev = readState()[itemId];
  const today = todayISO();
  if (!prev) return true;
  if (prev.date !== today) return true;
  if (prev.urgency !== urgency && urgency === "overdue") return true;
  return false;
}

export function markItemsNotified(
  entries: { itemId: string; urgency: UrgencyLevel }[]
): void {
  if (entries.length === 0) return;
  const today = todayISO();
  const next = { ...readState() };
  for (const { itemId, urgency } of entries) {
    next[itemId] = { date: today, urgency };
  }
  writeJSON(STATE_KEY, next);
}
