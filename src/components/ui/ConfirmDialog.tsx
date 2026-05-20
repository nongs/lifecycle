"use client";

import { Modal } from "@/components/ui/Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-6 text-sm text-slate-600">{message}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white ${
            destructive ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
