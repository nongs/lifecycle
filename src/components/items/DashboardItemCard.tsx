"use client";

import { ItemStatusDisplay } from "@/components/items/ItemStatusDisplay";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ItemViewModel } from "@/lib/types";

function formatMetrics(vm: ItemViewModel): string {
  if (!vm.lastPerformedAt || vm.urgency === "done_today") return "";
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
  const metrics = formatMetrics(vm);

  return (
    <Card className="p-4" aria-label={`${vm.item.name} 항목`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="mb-1.5 inline-block rounded-lg bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-ink-muted">
            {vm.categoryName}
          </span>
          <h3 className="item-title">{vm.item.name}</h3>
        </div>
        <Button className="shrink-0 px-3 py-2" onClick={onComplete}>
          완료
        </Button>
      </div>
      <div className="mt-3">
        <ItemStatusDisplay vm={vm} />
      </div>
      {metrics ? (
        <p className="mt-2.5 text-sm text-ink-muted">{metrics}</p>
      ) : null}
    </Card>
  );
}
