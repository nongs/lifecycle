"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/PageLoading";
import { formatCycleDays } from "@/lib/utils/cycle";
import {
  averageActualCycleDays,
  currentYearMonth,
  monthlySpendTotals,
  spendByItemId,
  totalSpendInMonth,
} from "@/lib/utils/stats";

export default function StatsPage() {
  const { ready, items, logs, categories } = useData();

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "미분류";

  const stats = useMemo(() => {
    const ym = currentYearMonth();
    const monthRows = monthlySpendTotals(logs);
    const spendMap = spendByItemId(logs);
    const logsWithCost = logs.filter((l) => l.cost != null && l.cost > 0);

    const perItem = items.map((item) => {
      const itemLogs = logs
        .filter((l) => l.itemId === item.id)
        .sort((a, b) => a.performedAt.localeCompare(b.performedAt));
      const avgActual = averageActualCycleDays(itemLogs);
      return {
        item,
        logCount: itemLogs.length,
        avgActualDays: avgActual,
        targetDays: item.targetCycleDays,
        totalSpend: spendMap.get(item.id) ?? 0,
      };
    });

    return {
      ym,
      thisMonthSpend: totalSpendInMonth(logs, ym),
      monthRows,
      logsWithCostCount: logsWithCost.length,
      totalLogs: logs.length,
      perItem,
    };
  }, [items, logs]);

  const maxMonthSpend = useMemo(() => {
    if (stats.monthRows.length === 0) return 1;
    return Math.max(...stats.monthRows.map((r) => r.total), 1);
  }, [stats.monthRows]);

  if (!ready) {
    return <PageLoading />;
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="page-header-title">통계</h1>
        <p className="page-header-sub">실제 기록을 바탕으로 한 요약입니다.</p>
      </header>

      <Card className="mb-6 p-4" aria-label="요약">
        <h2 className="text-sm font-semibold text-ink">요약</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          <li>전체 수행 기록: {stats.totalLogs}건</li>
          <li>비용이 입력된 기록: {stats.logsWithCostCount}건</li>
          <li>
            이번 달({stats.ym}) 비용 합계:{" "}
            <span className="font-semibold text-ink">
              {stats.thisMonthSpend.toLocaleString()}원
            </span>
          </li>
        </ul>
      </Card>

      <section className="mb-6" aria-labelledby="monthly-spend-heading">
        <h2
          id="monthly-spend-heading"
          className="mb-3 text-sm font-semibold text-ink"
        >
          월별 비용
        </h2>
        {stats.monthRows.length === 0 ? (
          <EmptyState
            illustration="cost"
            title="비용이 입력된 기록이 없습니다"
            description="대시보드에서 항목 완료 시 비용 입력을 켜면 월별·항목별 비용이 집계됩니다"
          />
        ) : (
          <ul className="space-y-3">
            {stats.monthRows.slice(0, 12).map((row) => (
              <li key={row.yearMonth} className="card p-3">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-ink">{row.yearMonth}</span>
                  <span className="text-ink-muted">
                    {row.total.toLocaleString()}원
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-line"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (row.total / maxMonthSpend) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="per-item-heading">
        <h2
          id="per-item-heading"
          className="mb-3 text-sm font-semibold text-ink"
        >
          항목별
        </h2>
        {items.length === 0 ? (
          <EmptyState
            title="활성 항목이 없습니다"
            description="항목 관리에서 추가하면 항목별 통계를 확인할 수 있습니다"
          >
            <Link href="/items">
              <Button>항목 관리로 이동</Button>
            </Link>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.perItem.map(
              ({
                item,
                logCount,
                avgActualDays,
                targetDays,
                totalSpend,
              }) => (
                <li key={item.id} className="card p-4 text-sm">
                  <div className="item-title">{item.name}</div>
                  <div className="mt-1 text-xs text-ink-faint">
                    {categoryName(item.categoryId)}
                  </div>
                  <dl className="mt-3 space-y-1 text-ink-muted">
                    <div className="flex justify-between gap-2">
                      <dt>목표 주기</dt>
                      <dd>{formatCycleDays(targetDays)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>실제 평균 주기</dt>
                      <dd>
                        {avgActualDays != null
                          ? `약 ${avgActualDays}일 (기록 ${logCount}건)`
                          : `— (기록 2회 이상 필요, 현재 ${logCount}건)`}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>누적 비용</dt>
                      <dd>
                        {totalSpend > 0
                          ? `${totalSpend.toLocaleString()}원`
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </li>
              )
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
