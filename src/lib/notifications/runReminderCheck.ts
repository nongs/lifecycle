"use client";

import type { ActivityLog, Category, ManagementItem } from "@/lib/types";
import { collectReminders } from "@/lib/notifications/reminders";
import { dispatchReminders } from "@/lib/notifications/dispatch";
import { readAppSettings } from "@/lib/settings";
import { isWebAppFeaturesEnabled } from "@/lib/variant";

function homeUrl(): string {
  const base = process.env.NEXT_PUBLIC_DEPLOY_BASE_PATH ?? "";
  const path = `${base}/`.replace(/\/{2,}/g, "/");
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).href;
}

function isPastReminderHour(hour: number): boolean {
  return new Date().getHours() >= hour;
}

export async function runReminderCheck(input: {
  items: ManagementItem[];
  logs: ActivityLog[];
  categories: Category[];
}): Promise<void> {
  if (!isWebAppFeaturesEnabled()) return;
  if (typeof window === "undefined") return;

  const settings = readAppSettings();
  if (!settings.pushNotificationsEnabled) return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (!isPastReminderHour(settings.reminderHour)) return;

  const reminders = collectReminders(
    input.items,
    input.logs,
    input.categories,
    homeUrl()
  );
  await dispatchReminders(reminders);
}
