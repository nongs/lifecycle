"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LogFormModal } from "@/components/logs/LogFormModal";
import { ItemFormModal } from "@/components/items/ItemFormModal";
import * as api from "@/lib/api/apiService";
import type { ActivityLog, Category, ManagementItem } from "@/lib/types";
import { formatCycleDays } from "@/lib/utils/cycle";
import { ItemStatusDisplay } from "@/components/items/ItemStatusDisplay";
import { buildItemViewModel } from "@/lib/utils/dashboard";

type Props = {
  open: boolean;
  item: ManagementItem | null;
  categoryName: string;
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
};

export function ItemDetailModal({
  open,
  item,
  categoryName,
  categories,
  onClose,
  onChanged,
}: Props) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [editLog, setEditLog] = useState<ActivityLog | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [confirm, setConfirm] = useState<
    | null
    | { type: "archive" }
    | { type: "deleteLog"; log: ActivityLog }
  >(null);

  const loadLogs = useCallback(async () => {
    if (!item) return;
    setLogs(await api.getLogsByItem(item.id));
  }, [item]);

  useEffect(() => {
    if (open && item) loadLogs();
  }, [open, item, loadLogs]);

  if (!item) return null;

  const vm = buildItemViewModel(item, categoryName, logs);

  return (
    <>
      <Modal open={open} onClose={onClose} title={item.name} fullScreen>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {categoryName} · 주기 {formatCycleDays(item.targetCycleDays)}
          </p>
          <ItemStatusDisplay vm={vm} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditLog(null);
                setLogFormOpen(true);
              }}
              className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium"
            >
              기록 추가
            </button>
            <button
              type="button"
              onClick={() => setItemFormOpen(true)}
              className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium"
            >
              항목 수정
            </button>
          </div>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {logs.length === 0 ? (
              <li className="p-4 text-center text-sm text-slate-500">
                기록이 없습니다
              </li>
            ) : (
              logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between p-3">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => {
                      setEditLog(log);
                      setLogFormOpen(true);
                    }}
                  >
                    <p className="font-medium text-slate-900">{log.performedAt}</p>
                    {log.note && (
                      <p className="text-sm text-slate-500">{log.note}</p>
                    )}
                    {log.cost != null && (
                      <p className="text-sm text-slate-500">
                        {log.cost.toLocaleString()}원
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm({ type: "deleteLog", log })}
                    className="text-sm text-red-600"
                  >
                    삭제
                  </button>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            onClick={() => setConfirm({ type: "archive" })}
            className="w-full rounded-lg border border-amber-300 py-2 text-sm text-amber-800"
          >
            아카이브
          </button>
        </div>
      </Modal>

      <LogFormModal
        open={logFormOpen}
        itemId={item.id}
        itemName={item.name}
        log={editLog}
        onClose={() => {
          setLogFormOpen(false);
          setEditLog(null);
        }}
        onSaved={() => {
          loadLogs();
          onChanged();
        }}
      />

      <ItemFormModal
        open={itemFormOpen}
        categories={categories}
        item={item}
        onClose={() => setItemFormOpen(false)}
        onSaved={() => {
          onChanged();
          onClose();
        }}
      />

      <ConfirmDialog
        open={confirm?.type === "archive"}
        title="항목 아카이브"
        message="대시보드 목록에서 숨깁니다. 기록은 유지됩니다."
        confirmLabel="아카이브"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await api.archiveItem(item.id);
          setConfirm(null);
          onChanged();
          onClose();
        }}
      />

      <ConfirmDialog
        open={confirm?.type === "deleteLog"}
        title="기록 삭제"
        message="이 수행 기록을 삭제합니다."
        destructive
        confirmLabel="삭제"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm?.type === "deleteLog") {
            await api.deleteLog(confirm.log.id);
            setConfirm(null);
            loadLogs();
            onChanged();
          }
        }}
      />
    </>
  );
}
