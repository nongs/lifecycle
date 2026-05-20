"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import * as api from "@/lib/api/apiService";
import type { Category } from "@/lib/types";

type Props = {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
  onSaved: () => void;
};

export function CategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setError("");
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (category) {
        await api.updateCategory(category.id, { name: name.trim() });
      } else {
        await api.createCategory({ name: name.trim() });
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
      title={category ? "카테고리 수정" : "카테고리 추가"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">이름</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white"
        >
          저장
        </button>
      </form>
    </Modal>
  );
}
