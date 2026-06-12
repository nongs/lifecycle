"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LogFormModal } from "@/components/logs/LogFormModal";
import { ItemFormModal } from "@/components/items/ItemFormModal";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api";
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
      <Modal open={open} onClose={onClose} title={item.name} fullHeight>
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            {categoryName} · 주기 {formatCycleDays(item.targetCycleDays)}
          </p>
          <ItemStatusDisplay vm={vm} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setEditLog(null);
                setLogFormOpen(true);
              }}
            >
              기록 추가
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setItemFormOpen(true)}
            >
              항목 수정
            </Button>
          </div>
          <ul className="divide-y divide-line rounded-card border border-line bg-surface-muted">
            {logs.length === 0 ? (
              <li className="p-4 text-center text-sm text-ink-faint">
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
                    <p className="font-medium text-ink">{log.performedAt}</p>
                    {log.note && (
                      <p className="text-sm text-ink-muted">{log.note}</p>
                    )}
                    {log.cost != null && (
                      <p className="text-sm text-ink-muted">
                        {log.cost.toLocaleString()}원
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm({ type: "deleteLog", log })}
                    className="text-sm text-danger hover:text-danger-hover"
                  >
                    삭제
                  </button>
                </li>
              ))
            )}
          </ul>
          <Button
            variant="secondary"
            fullWidth
            className="border-warning-border text-warning-text hover:bg-status-soon-bg"
            onClick={() => setConfirm({ type: "archive" })}
          >
            아카이브
          </Button>
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
