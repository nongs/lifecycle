"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { DataMode } from "@/lib/api";

type Props = {
  dataMode: DataMode;
};

const DATA_MODE_LABEL: Record<DataMode, string> = {
  local: "이 기기 (로컬)",
  cloud: "클라우드 동기화",
};

export function AccountCard({ dataMode }: Props) {
  const { user, signOut } = useAuth();
  const { refresh } = useData();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = user?.email ?? "로그인됨";

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그아웃에 실패했습니다.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Card className="mb-6 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">계정</p>
          <p className="mt-1 truncate text-sm text-ink-muted">{email}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-ink-muted">
          {DATA_MODE_LABEL[dataMode]}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        로그아웃 시 클라우드 데이터를 이 기기에 저장한 뒤 로컬 모드로
        전환합니다.
      </p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <Button
        variant="secondary"
        fullWidth
        className="mt-4"
        disabled={signingOut}
        onClick={() => void handleSignOut()}
      >
        {signingOut ? "로그아웃 중…" : "로그아웃"}
      </Button>
    </Card>
  );
}
