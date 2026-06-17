"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { isCloudBackendReady } from "@/lib/variant";

/** 세션 만료·refresh 실패 시 재로그인 유도 */
export function SessionRecoveryBanner() {
  const { needsReauth } = useAuth();

  if (!isCloudBackendReady() || !needsReauth) return null;

  return (
    <div
      className="border-b border-warning-border bg-[rgb(var(--status-soon-bg))] px-4 py-3 text-sm text-ink-muted"
      role="alert"
    >
      로그인이 만료되었습니다.{" "}
      <Link
        href="/settings/login"
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        다시 로그인
      </Link>
      하면 클라우드 데이터를 이어서 사용할 수 있습니다.
    </div>
  );
}
