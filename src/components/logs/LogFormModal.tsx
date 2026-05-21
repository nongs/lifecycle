"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as api from "@/lib/api/apiService";
import type { ActivityLog } from "@/lib/types";
import { todayISO } from "@/lib/utils/date";

type Props = {
  open: boolean;
  itemId: string;
  itemName: string;
  log?: ActivityLog | null;
  onClose: () => void;
  onSaved: () => void;
};

export function LogFormModal({
  open,
  itemId,
  itemName,
  log,
  onClose,
  onSaved,
}: Props) {
  const [performedAt, setPerformedAt] = useState(todayISO());
  const [note, setNote] = useState("");
  const [hasCost, setHasCost] = useState(false);
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (log) {
      setPerformedAt(log.performedAt);
      setNote(log.note ?? "");
      setHasCost(log.cost != null);
      setCost(log.cost != null ? String(log.cost) : "");
    } else {
      setPerformedAt(todayISO());
      setNote("");
      setHasCost(false);
      setCost("");
    }
    setError("");
  }, [open, log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        performedAt,
        note: note.trim() || undefined,
        cost: hasCost && cost ? Number(cost) : undefined,
      };
      if (log) {
        await api.updateLog(log.id, payload);
      } else {
        await api.addLog(itemId, payload);
      }
      onSaved();
      onClose();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={log ? "수행 기록 수정" : "수행 완료"}>
      <p className="mb-4 text-sm text-ink-muted">{itemName}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="label-text">수행일</span>
          <input
            type="date"
            required
            value={performedAt}
            onChange={(e) => setPerformedAt(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
        <label className="block">
          <span className="label-text">메모</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="textarea-field mt-1.5"
            placeholder="선택 사항"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasCost}
            onChange={(e) => setHasCost(e.target.checked)}
            className="accent-primary"
          />
          <span className="text-sm text-ink-muted">비용 입력</span>
        </label>
        {hasCost && (
          <Input
            label="금액 (원)"
            type="number"
            min={0}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="선택 사항"
          />
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </Button>
      </form>
    </Modal>
  );
}
