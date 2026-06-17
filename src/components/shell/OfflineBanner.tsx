"use client";

import { useOnline } from "@/hooks/useOnline";
import { isWebAppFeaturesEnabled } from "@/lib/variant";

export function OfflineBanner() {
  const online = useOnline();

  if (!isWebAppFeaturesEnabled() || online) return null;

  return (
    <div
      className="border-b border-line bg-surface-muted px-4 py-2 text-center text-xs text-ink-muted"
      role="status"
    >
      오프라인입니다. 저장된 화면만 볼 수 있으며, 로그인·동기화는 연결 후
      가능합니다.
    </div>
  );
}
