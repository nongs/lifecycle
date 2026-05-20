"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardItemCard } from "@/components/items/DashboardItemCard";
import { LogFormModal } from "@/components/logs/LogFormModal";
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
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-slate-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">LifeCycle</h1>
        <p className="text-sm text-slate-500">오늘 처리할 일을 확인하세요</p>
      </header>

      <section
        className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        aria-label="이번 달 일정 요약"
      >
        <p className="text-sm text-slate-500">이번 달 일정</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          {monthlyCount}
          <span className="ml-1 text-base font-normal text-slate-600">건</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          아직 이번 달에 처리하지 않은 항목
        </p>
      </section>

      {dashboardSorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">관리할 항목이 없습니다</p>
          <Link
            href="/items"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            항목 관리로 이동
          </Link>
        </div>
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
