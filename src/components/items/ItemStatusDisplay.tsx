import type { ItemViewModel, UrgencyLevel } from "@/lib/types";
import { URGENCY_LABELS, getStatusColorClass } from "@/lib/utils/itemStatus";

const PROGRESS_TRACK: Record<string, string> = {
  overdue: "bg-status-overdue-track",
  soon: "bg-status-soon-track",
  ok: "bg-status-ok-track",
  done_today: "bg-status-ok-track",
  no_log: "bg-line",
};

const PROGRESS_BAR: Record<string, string> = {
  overdue: "bg-status-overdue-bar",
  soon: "bg-status-soon-bar",
  ok: "bg-status-ok-bar",
  done_today: "bg-status-ok-bar",
  no_log: "bg-status-neutral-bar",
};

function progressTrackClass(urgency: UrgencyLevel): string {
  return PROGRESS_TRACK[urgency] ?? PROGRESS_TRACK.no_log;
}

function progressBarClass(urgency: UrgencyLevel): string {
  return PROGRESS_BAR[urgency] ?? PROGRESS_BAR.no_log;
}

export function ItemStatusDisplay({ vm }: { vm: ItemViewModel }) {
  const { urgency, progressRatio } = vm;
  const showBar =
    vm.lastPerformedAt &&
    vm.item.targetCycleDays > 0 &&
    urgency !== "done_today";

  const fillPercent = Math.min(100, Math.max(0, progressRatio * 100));

  return (
    <div className="w-full space-y-2">
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColorClass(urgency)}`}
      >
        {URGENCY_LABELS[urgency]}
      </span>
      {showBar ? (
        <div
          className={`h-2.5 w-full overflow-hidden rounded-full ${progressTrackClass(urgency)}`}
          role="progressbar"
          aria-valuenow={Math.round(fillPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="주기 진행률"
        >
          <div
            className={`h-full min-w-[2px] rounded-full transition-all duration-300 ${progressBarClass(urgency)}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
