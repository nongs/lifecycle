"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { migrateLocalToCloud } from "@/lib/data/cloudLocalSync";
import type { UserDataPresence } from "@/lib/data/cloudLocalSync";

type Props = {
  open: boolean;
  local: UserDataPresence;
  onComplete: () => Promise<void>;
  onSkip: () => void;
};

export function MigrationModal({
  open,
  local,
  onComplete,
  onSkip,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    try {
      await migrateLocalToCloud();
      await onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onSkip} title="이 기기 데이터 올리기">
      <p className="text-sm leading-relaxed text-ink-muted">
        이 기기에 저장된 항목{" "}
        <strong className="text-ink">{local.itemCount}개</strong>, 기록{" "}
        <strong className="text-ink">{local.logCount}건</strong>을 계정에
        올릴까요? 다른 기기에서도 같은 데이터를 볼 수 있습니다.
      </p>
      <p className="mt-3 text-xs text-ink-faint">
        나중에 선택하면 빈 클라우드로 시작합니다. 이 기기의 로컬 데이터는
        그대로 남습니다.
      </p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-6 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={loading}
          onClick={onSkip}
        >
          나중에
        </Button>
        <Button
          className="flex-1"
          disabled={loading}
          onClick={() => void handleMigrate()}
        >
          {loading ? "업로드 중…" : "올리기"}
        </Button>
      </div>
    </Modal>
  );
}
