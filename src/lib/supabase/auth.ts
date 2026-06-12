"use client";

import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

/** 실제 로그인 세션만 cloud DB 사용 대상 (익명·미로그인 제외) */
export function isAuthenticatedSession(session: Session | null): boolean {
  if (!session?.user) return false;
  return !session.user.is_anonymous;
}

export async function getCloudSession(): Promise<Session | null> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function requireCloudUserId(): Promise<string> {
  const session = await getCloudSession();
  if (!isAuthenticatedSession(session)) {
    throw new Error("로그인이 필요합니다.");
  }
  return session!.user.id;
}
