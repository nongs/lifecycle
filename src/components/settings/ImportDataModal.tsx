"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  datasetSummary,
  parseImportJson,
} from "@/lib/data/datasetIO";
import type { DataMode } from "@/lib/api";

type Props = {
  open: boolean;
  dataMode: DataMode;
  onClose: () => void;
  onImport: (raw: string) => Promise<void>;
};

export function ImportDataModal({
  open,
  dataMode,
  onClose,
  onImport,
}: Props) {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!raw.trim()) return null;
    try {
      return datasetSummary(parseImportJson(raw));
    } catch {
      return null;
    }
  }, [raw]);

  const targetLabel = dataMode === "cloud" ? "클라우드" : "이 기기(로컬)";

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      parseImportJson(raw);
      await onImport(raw);
      setRaw("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "가져오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="데이터 가져오기">
      <p className="mb-3 text-sm text-ink-muted">
        JSON을 붙여넣으면 현재{" "}
        <strong className="text-ink">{targetLabel}</strong> 데이터를{" "}
        <strong className="text-danger">모두 덮어씁니다</strong>.
      </p>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder='{"version":1,"categories":[],"items":[],"logs":[]}'
        rows={10}
        className="input-field min-h-[200px] resize-y font-mono text-xs leading-relaxed"
        spellCheck={false}
      />
      {preview && (
        <p className="mt-2 text-xs text-ink-faint">미리보기: {preview}</p>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={loading}
          onClick={handleClose}
        >
          취소
        </Button>
        <Button
          className="flex-1"
          disabled={loading || !raw.trim()}
          onClick={() => void handleImport()}
        >
          {loading ? "가져오는 중…" : "덮어쓰기"}
        </Button>
      </div>
    </Modal>
  );
}
