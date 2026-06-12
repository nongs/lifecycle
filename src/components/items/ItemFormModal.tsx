"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as api from "@/lib/api";
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
      fullHeight
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="항목명"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="block">
          <span className="label-text">카테고리</span>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="select-field mt-1.5"
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
            <span className="label-text">목표 주기</span>
            <input
              type="number"
              required
              min={0}
              value={cycleValue}
              onChange={(e) => setCycleValue(Number(e.target.value))}
              className="input-field mt-1.5"
            />
          </label>
          <label className="block w-28">
            <span className="label-text">단위</span>
            <select
              value={cycleUnit}
              onChange={(e) => setCycleUnit(e.target.value as CycleUnit)}
              className="select-field mt-1.5"
            >
              {(Object.keys(CYCLE_UNIT_LABELS) as CycleUnit[]).map((u) => (
                <option key={u} value={u}>
                  {CYCLE_UNIT_LABELS[u]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-start gap-3 rounded-xl bg-accent-soft/80 px-3 py-3">
          <input
            type="checkbox"
            checked={notificationEnabled}
            onChange={(e) => setNotificationEnabled(e.target.checked)}
            className="mt-1 accent-primary"
          />
          <span className="text-sm text-ink-muted">
            알림 받기
            <span className="mt-0.5 block text-xs text-ink-faint">
              푸시 알림은 추후 제공됩니다.
            </span>
          </span>
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </Button>
      </form>
    </Modal>
  );
}
