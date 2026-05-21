"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardItemCard } from "@/components/items/DashboardItemCard";
import { LogFormModal } from "@/components/logs/LogFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/PageLoading";
import { useData } from "@/contexts/DataContext";
import { useItemViewModels } from "@/hooks/useItemViewModels";
import { countMonthlyPending } from "@/lib/utils/dashboard";
import type { ManagementItem } from "@/lib/types";

export default function DashboardPage() {
  const { refresh, logs } = useData();
  const { ready, dashboardSorted } = useItemViewModels(true);
  const [logItem, setLogItem] = useState<ManagementItem | null>(null);

  const monthlyCount = countMonthlyPending(dashboardSorted, logs);

  if (!ready) {
    return <PageLoading />;
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">LifeCycle</h1>
        <p className="page-header-sub">오늘 처리할 일을 확인하세요</p>
      </header>

      <Card className="mb-6 p-5" aria-label="이번 달 일정 요약">
        <p className="text-sm text-ink-muted">이번 달 일정</p>
        <p className="mt-1 text-3xl font-semibold text-ink">
          {monthlyCount}
          <span className="ml-1 text-base font-normal text-ink-muted">건</span>
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          아직 이번 달에 처리하지 않은 항목
        </p>
      </Card>

      {dashboardSorted.length === 0 ? (
        <EmptyState
          title="관리할 항목이 없습니다"
          description="항목 관리에서 반복해서 관리할 일상을 추가해 보세요"
        >
          <Link href="/items">
            <Button>항목 관리로 이동</Button>
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="항목 목록">
          {dashboardSorted.map((vm) => (
            <li key={vm.item.id}>
              <DashboardItemCard
                vm={vm}
                onComplete={() => setLogItem(vm.item)}
              />
            </li>
          ))}
        </ul>
      )}

      <LogFormModal
        open={!!logItem}
        itemId={logItem?.id ?? ""}
        itemName={logItem?.name ?? ""}
        onClose={() => setLogItem(null)}
        onSaved={refresh}
      />
    </div>
  );
}
