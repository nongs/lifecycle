import type { MonthlySpendDetail } from "@/lib/utils/stats";

type Variant = "card" | "plain";

type Props = {
  details: MonthlySpendDetail[];
  emptyMessage?: string;
  variant?: Variant;
};

function DetailRow({ row }: { row: MonthlySpendDetail }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{row.itemName}</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {row.categoryName} · {row.performedAt}
        </p>
        {row.note ? (
          <p className="mt-1.5 text-sm text-ink-muted">{row.note}</p>
        ) : null}
      </div>
      <span className="shrink-0 text-sm font-semibold text-ink">
        {row.cost.toLocaleString()}원
      </span>
    </div>
  );
}

export function MonthlySpendDetailList({
  details,
  emptyMessage = "해당 월 비용 기록이 없습니다.",
  variant = "card",
}: Props) {
  if (details.length === 0) {
    return <p className="text-sm text-ink-faint">{emptyMessage}</p>;
  }

  if (variant === "plain") {
    return (
      <ul className="spend-detail-plain">
        {details.map((row) => (
          <li key={row.logId}>
            <DetailRow row={row} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-card border border-line bg-surface-muted">
      {details.map((row) => (
        <li key={row.logId} className="p-3.5">
          <DetailRow row={row} />
        </li>
      ))}
    </ul>
  );
}
