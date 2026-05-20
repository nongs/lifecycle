"use client";

import type { ItemViewModel } from "@/lib/types";
import { ItemStatusDisplay } from "@/components/items/ItemStatusDisplay";

function formatMetrics(vm: ItemViewModel): string {
  if (!vm.lastPerformedAt) return "기록이 없습니다";
  if (vm.urgency === "done_today") return "오늘 수행했습니다";
  if (vm.urgency === "overdue" && vm.elapsedDays !== null) {
    const over = vm.elapsedDays - vm.item.targetCycleDays;
    return `${over}일 지남`;
  }
  if (vm.elapsedDays !== null && vm.remainingDays !== null) {
    return `경과 ${vm.elapsedDays}일 · 잔여 ${vm.remainingDays}일`;
  }
  return "";
}

type Props = {
  vm: ItemViewModel;
  onComplete: () => void;
};

export function DashboardItemCard({ vm, onComplete }: Props) {
  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label={`${vm.item.name} 항목`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <span className="mb-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {vm.categoryName}
          </span>
          <h3 className="font-semibold text-slate-900">{vm.item.name}</h3>
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          완료
        </button>
      </div>
      <ItemStatusDisplay vm={vm} />
      <p className="mt-2 text-sm text-slate-500">{formatMetrics(vm)}</p>
    </article>
  );
}
