"use client";

import {
  compareMonthOverMonth,
  formatYearMonthLabel,
  type MonthSpend,
} from "@/lib/utils/stats";

type Props = {
  row: MonthSpend;
  monthTotalMap: Map<string, number>;
  onClick: () => void;
  expanded?: boolean;
  className?: string;
};

export function MonthlySpendRow({
  row,
  monthTotalMap,
  onClick,
  expanded = false,
  className = "",
}: Props) {
  const mom = compareMonthOverMonth(row.yearMonth, monthTotalMap);
  const momLabel =
    mom.kind === "up"
      ? `전월대비 ${mom.diff.toLocaleString()}원 증가`
      : mom.kind === "down"
        ? `전월대비 ${mom.diff.toLocaleString()}원 감소`
        : "전월대비 동일";
  const momClass =
    mom.kind === "up"
      ? "text-danger"
      : mom.kind === "down"
        ? "text-sky-600"
        : "text-ink-faint";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`w-full p-3.5 text-left transition-colors hover:bg-accent-soft/60 active:bg-accent-soft ${className}`}
      aria-label={`${formatYearMonthLabel(row.yearMonth)} 비용 ${row.total.toLocaleString()}원 ${row.count}건${expanded ? ", 접기" : ", 펼치기"}`}
    >
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-ink">
          {formatYearMonthLabel(row.yearMonth)}
        </span>
        <span className="text-ink-muted">{row.count}건</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className={`text-xs ${momClass}`}>{momLabel}</span>
        <span className="text-base font-semibold text-ink">
          {row.total.toLocaleString()}원
        </span>
      </div>
    </button>
  );
}
