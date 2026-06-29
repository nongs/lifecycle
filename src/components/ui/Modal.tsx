"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fullHeight?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  fullHeight = false,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelClass = fullHeight
    ? "h-[92dvh] max-h-[92dvh] rounded-t-modal sm:h-[85vh] sm:max-w-lg sm:rounded-modal"
    : "max-h-[85dvh] max-w-md rounded-t-modal sm:rounded-modal";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-overlay/30"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`relative z-10 flex w-full min-w-0 flex-col bg-surface shadow-modal ${panelClass}`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-2.5 py-1 text-ink-faint transition-colors hover:bg-accent-soft hover:text-ink-muted"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
