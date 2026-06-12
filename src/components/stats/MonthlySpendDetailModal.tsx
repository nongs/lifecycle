"use client";

import { MonthlySpendDetailList } from "@/components/stats/MonthlySpendDetailList";
import { Modal } from "@/components/ui/Modal";
import {
  formatYearMonthLabel,
  type MonthlySpendDetail,
} from "@/lib/utils/stats";

type Props = {
  open: boolean;
  yearMonth: string | null;
  total: number;
  details: MonthlySpendDetail[];
  onClose: () => void;
};

export function MonthlySpendDetailModal({
  open,
  yearMonth,
  total,
  details,
  onClose,
}: Props) {
  if (!yearMonth) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${formatYearMonthLabel(yearMonth)} 비용`}
      fullHeight
    >
      <p className="mb-4 text-sm text-ink-muted">
        합계{" "}
        <span className="font-semibold text-ink">
          {total.toLocaleString()}원
        </span>
        <span className="text-ink-faint"> · {details.length}건</span>
      </p>
      <MonthlySpendDetailList details={details} />
    </Modal>
  );
}
