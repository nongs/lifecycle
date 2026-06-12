"use client";

import { readJSON, writeJSON } from "@/lib/storage";

const SETTINGS_KEY = "lifecycle:settings";

export type AppSettings = {
  pushNotificationsEnabled: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  pushNotificationsEnabled: false,
};

export function readAppSettings(): AppSettings {
  const stored = readJSON<Partial<AppSettings>>(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function updateAppSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...readAppSettings(), ...partial };
  writeJSON(SETTINGS_KEY, next);
  return next;
}
