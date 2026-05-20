import type { ItemViewModel } from "@/lib/types";
import {
  URGENCY_LABELS,
  getProgressBarClass,
  getStatusColorClass,
} from "@/lib/utils/itemStatus";

export function ItemStatusDisplay({ vm }: { vm: ItemViewModel }) {
  const { urgency, progressRatio } = vm;
  const showBar =
    vm.lastPerformedAt &&
    vm.item.targetCycleDays > 0 &&
    urgency !== "done_today";

  return (
    <div className="space-y-2">
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColorClass(urgency)}`}
      >
        {URGENCY_LABELS[urgency]}
      </span>
      {showBar && (
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="주기 진행률"
        >
          <div
            className={`h-full rounded-full transition-all ${getProgressBarClass(urgency)}`}
            style={{ width: `${Math.min(100, progressRatio * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
