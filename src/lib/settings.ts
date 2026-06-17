"use client";

import { readJSON, writeJSON } from "@/lib/storage";

const SETTINGS_KEY = "lifecycle:settings";

export type AppSettings = {
  pushNotificationsEnabled: boolean;
  /** 로컬 시각 기준 리마인더 시작 시각 (0–23) */
  reminderHour: number;
};

const DEFAULT_SETTINGS: AppSettings = {
  pushNotificationsEnabled: false,
  reminderHour: 9,
};

function normalizeReminderHour(value: unknown): number {
  const hour = typeof value === "number" ? value : DEFAULT_SETTINGS.reminderHour;
  if (!Number.isFinite(hour)) return DEFAULT_SETTINGS.reminderHour;
  return Math.min(23, Math.max(0, Math.floor(hour)));
}

export function readAppSettings(): AppSettings {
  const stored = readJSON<Partial<AppSettings>>(SETTINGS_KEY, {});
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    reminderHour: normalizeReminderHour(stored.reminderHour),
  };
}

export function updateAppSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...readAppSettings(), ...partial };
  writeJSON(SETTINGS_KEY, next);
  return next;
}
