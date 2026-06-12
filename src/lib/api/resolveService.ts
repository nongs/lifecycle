"use client";

import { cloudPlaceholderService } from "@/lib/api/cloudPlaceholderService";
import * as local from "@/lib/api/localStorageService";
import supabaseService from "@/lib/api/supabaseService";
import type { IDataService } from "@/lib/api/types";
import {
  getCloudSession,
  isAuthenticatedSession,
} from "@/lib/supabase/auth";
import { DATA_VARIANT, isCloudBackendReady } from "@/lib/variant";

/**
 * cloud 빌드: 미로그인 → localStorage, 로그인 → Supabase.
 * demo 빌드: 항상 localStorage.
 */
export async function resolveDataService(): Promise<IDataService> {
  if (DATA_VARIANT === "demo") {
    return local;
  }

  if (!isCloudBackendReady()) {
    return cloudPlaceholderService;
  }

  const session = await getCloudSession();
  if (isAuthenticatedSession(session)) {
    return supabaseService;
  }

  return local;
}

export type DataMode = "local" | "cloud";

export async function resolveDataMode(): Promise<DataMode> {
  if (DATA_VARIANT === "demo" || !isCloudBackendReady()) {
    return "local";
  }
  const session = await getCloudSession();
  return isAuthenticatedSession(session) ? "cloud" : "local";
}
