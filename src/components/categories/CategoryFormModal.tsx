"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
        <Input
          label="이름"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
        />
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </Button>
      </form>
    </Modal>
  );
}
