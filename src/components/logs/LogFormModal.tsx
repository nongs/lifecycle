"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
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
    <Modal
      open={open}
      onClose={onClose}
      title={log ? "수행 기록 수정" : "수행 완료"}
    >
      <p className="mb-4 text-sm text-slate-500">{itemName}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">수행일</span>
          <input
            type="date"
            required
            value={performedAt}
            onChange={(e) => setPerformedAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">메모</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="선택 사항"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasCost}
            onChange={(e) => setHasCost(e.target.checked)}
          />
          <span className="text-sm text-slate-700">비용 입력</span>
        </label>
        {hasCost && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">금액 (원)</span>
            <input
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="선택 사항"
            />
          </label>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </form>
    </Modal>
  );
}
