"use client";

import type { ReminderPayload } from "@/lib/notifications/reminders";
import { markItemsNotified } from "@/lib/notifications/reminderState";

function iconUrl(): string {
  const base = process.env.NEXT_PUBLIC_DEPLOY_BASE_PATH ?? "";
  return `${base}/icons/icon.svg`.replace(/\/{2,}/g, "/");
}

async function showViaServiceWorker(
  reminders: ReminderPayload[]
): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (!reg?.active) return false;

  reg.active.postMessage({
    type: "SHOW_REMINDERS",
    notifications: reminders.map((r) => ({
      title: r.title,
      body: r.body,
      tag: r.tag,
      url: r.url,
      icon: iconUrl(),
    })),
  });
  return true;
}

function showViaWindowApi(reminders: ReminderPayload[]): void {
  for (const r of reminders) {
    new Notification(r.title, {
      body: r.body,
      tag: r.tag,
      icon: iconUrl(),
    });
  }
}

export async function dispatchReminders(
  reminders: ReminderPayload[]
): Promise<void> {
  if (reminders.length === 0) return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const viaSw = await showViaServiceWorker(reminders);
  if (!viaSw) showViaWindowApi(reminders);

  markItemsNotified(
    reminders.map((r) => ({ itemId: r.itemId, urgency: r.urgency }))
  );
}
