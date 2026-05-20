"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import * as api from "@/lib/api/apiService";
import type { Category, CycleUnit, ManagementItem } from "@/lib/types";
import {
  CYCLE_UNIT_LABELS,
  cycleToDays,
  daysToCycleDisplay,
} from "@/lib/utils/cycle";

type Props = {
  open: boolean;
  categories: Category[];
  item?: ManagementItem | null;
  /** 새 항목 추가 시 기본 선택 카테고리 */
  defaultCategoryId?: string;
  onClose: () => void;
  onSaved: () => void;
};

export function ItemFormModal({
  open,
  categories,
  item,
  defaultCategoryId,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cycleValue, setCycleValue] = useState(4);
  const [cycleUnit, setCycleUnit] = useState<CycleUnit>("week");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (item) {
      setName(item.name);
      setCategoryId(item.categoryId);
      const d = daysToCycleDisplay(item.targetCycleDays);
      setCycleValue(d.value || 1);
      setCycleUnit(d.unit);
      setNotificationEnabled(item.notificationEnabled);
    } else {
      setName("");
      const fallback = categories[0]?.id ?? "";
      const preferred =
        defaultCategoryId &&
        categories.some((c) => c.id === defaultCategoryId)
          ? defaultCategoryId
          : fallback;
      setCategoryId(preferred);
      setCycleValue(4);
      setCycleUnit("week");
      setNotificationEnabled(false);
    }
    setError("");
  }, [open, item, categories, defaultCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError("카테고리를 선택해 주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const targetCycleDays = cycleToDays(cycleValue, cycleUnit);
      const payload = {
        name: name.trim(),
        categoryId,
        targetCycleDays,
        notificationEnabled,
      };
      if (item) {
        await api.updateItem(item.id, payload);
      } else {
        await api.createItem(payload);
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
      title={item ? "항목 수정" : "항목 추가"}
      fullScreen
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">항목명</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">카테고리</span>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <label className="block flex-1">
            <span className="text-sm font-medium text-slate-700">목표 주기</span>
            <input
              type="number"
              required
              min={0}
              value={cycleValue}
              onChange={(e) => setCycleValue(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block w-28">
            <span className="text-sm font-medium text-slate-700">단위</span>
            <select
              value={cycleUnit}
              onChange={(e) => setCycleUnit(e.target.value as CycleUnit)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {(Object.keys(CYCLE_UNIT_LABELS) as CycleUnit[]).map((u) => (
                <option key={u} value={u}>
                  {CYCLE_UNIT_LABELS[u]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={notificationEnabled}
            onChange={(e) => setNotificationEnabled(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-slate-600">
            알림 받기
            <span className="block text-xs text-slate-400">
              푸시 알림은 추후 제공됩니다.
            </span>
          </span>
        </label>
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
