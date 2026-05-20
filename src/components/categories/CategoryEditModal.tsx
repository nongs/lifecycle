"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import * as api from "@/lib/api/apiService";
import type { Category } from "@/lib/types";

type Props = {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
};

export function CategoryEditModal({
  open,
  categories,
  onClose,
  onChanged,
}: Props) {
  const [local, setLocal] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (open) {
      setLocal([...categories].sort((a, b) => a.sortOrder - b.sortOrder));
      setDeleteError("");
    }
  }, [open, categories]);

  const list = local.length ? local : categories;

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...list];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setLocal(next);
    await api.reorderCategories(next.map((c) => c.id));
    onChanged();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteError("");
    try {
      const count = await api.countActiveItemsByCategory(deleteId);
      if (count > 0) {
        setDeleteError(
          `활성 항목 ${count}개가 연결되어 있습니다. 카테고리를 변경한 뒤 삭제해 주세요.`
        );
        return;
      }
      await api.deleteCategory(deleteId);
      setDeleteId(null);
      onChanged();
    } catch {
      setDeleteError("삭제할 수 없습니다.");
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="카테고리 편집" fullScreen>
        <button
          type="button"
          onClick={() => {
            setEditCat(null);
            setFormOpen(true);
          }}
          className="mb-4 w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-700"
        >
          + 카테고리 추가
        </button>
        <ul className="space-y-2">
          {list.map((cat, i) => (
            <li
              key={cat.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 p-3"
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="text-xs text-slate-500 disabled:opacity-30"
                  aria-label="위로"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={i === list.length - 1}
                  onClick={() => move(i, 1)}
                  className="text-xs text-slate-500 disabled:opacity-30"
                  aria-label="아래로"
                >
                  ▼
                </button>
              </div>
              <button
                type="button"
                className="flex-1 text-left font-medium"
                onClick={() => {
                  setEditCat(cat);
                  setFormOpen(true);
                }}
              >
                {cat.name}
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(cat.id)}
                className="text-sm text-red-600"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
        {deleteError && (
          <p className="mt-4 text-sm text-red-600">{deleteError}</p>
        )}
      </Modal>

      <CategoryFormModal
        open={formOpen}
        category={editCat}
        onClose={() => {
          setFormOpen(false);
          setEditCat(null);
        }}
        onSaved={onChanged}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="카테고리 삭제"
        message="이 카테고리를 삭제합니다."
        destructive
        confirmLabel="삭제"
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
