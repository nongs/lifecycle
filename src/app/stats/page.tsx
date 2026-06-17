"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { ActivityCalendar } from "@/components/stats/ActivityCalendar";
import { MonthlySpendAllModal } from "@/components/stats/MonthlySpendAllModal";
import { MonthlySpendDetailModal } from "@/components/stats/MonthlySpendDetailModal";
import { MonthlySpendRow } from "@/components/stats/MonthlySpendRow";
import {
  StatsViewTabs,
  type StatsViewTab,
} from "@/components/stats/StatsViewTabs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/PageLoading";
import { formatCycleDays } from "@/lib/utils/cycle";
import {
  averageActualCycleDays,
  currentYearMonth,
  formatYearMonthLabel,
  monthSpendTotalMap,
  monthlySpendDetails,
  monthlySpendTotals,
  spendByItemId,
  totalSpendInMonth,
} from "@/lib/utils/stats";

const MONTHLY_PREVIEW_LIMIT = 3;

export default function StatsPage() {
  const { ready, items, archivedItems, logs, categories } = useData();
  const [view, setView] = useState<StatsViewTab>("spend");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [allMonthsOpen, setAllMonthsOpen] = useState(false);

  const itemById = useMemo(() => {
    const map = new Map<string, (typeof items)[0]>();
    for (const item of [...items, ...archivedItems]) {
      map.set(item.id, item);
    }
    return map;
  }, [items, archivedItems]);

  const categoryName = useCallback(
    (id: string) => categories.find((c) => c.id === id)?.name ?? "미분류",
    [categories]
  );

  const itemName = useCallback(
    (itemId: string) => itemById.get(itemId)?.name ?? "삭제된 항목",
    [itemById]
  );

  const categoryNameByItemId = useCallback(
    (itemId: string) => {
      const item = itemById.get(itemId);
      return item ? categoryName(item.categoryId) : "미분류";
    },
    [itemById, categoryName]
  );

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

  const monthTotalMap = useMemo(
    () => monthSpendTotalMap(stats.monthRows),
    [stats.monthRows]
  );

  const previewRows = stats.monthRows.slice(0, MONTHLY_PREVIEW_LIMIT);
  const showViewAll = stats.monthRows.length > MONTHLY_PREVIEW_LIMIT;

  const selectedMonthDetails = useMemo(() => {
    if (!selectedMonth) return [];
    return monthlySpendDetails(
      selectedMonth,
      logs,
      itemName,
      categoryNameByItemId
    );
  }, [selectedMonth, logs, itemName, categoryNameByItemId]);

  const selectedMonthTotal = selectedMonth
    ? totalSpendInMonth(logs, selectedMonth)
    : 0;

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
            이번 달({formatYearMonthLabel(stats.ym)}) 비용 합계:{" "}
            <span className="font-semibold text-ink">
              {stats.thisMonthSpend.toLocaleString()}원
            </span>
          </li>
        </ul>
      </Card>

      <StatsViewTabs value={view} onChange={setView} />

      {view === "activity" ? (
        <section aria-labelledby="activity-calendar-heading">
          <h2 id="activity-calendar-heading" className="sr-only">
            활동 캘린더
          </h2>
          <ActivityCalendar
            logs={logs}
            itemName={itemName}
            categoryNameByItemId={categoryNameByItemId}
          />
        </section>
      ) : null}

      {view === "spend" ? (
      <>
      <section className="mb-6" aria-labelledby="monthly-spend-heading">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="monthly-spend-heading" className="text-sm font-semibold text-ink">
            월별 비용
          </h2>
          {showViewAll ? (
            <Button
              variant="ghost"
              className="shrink-0 px-2 py-1.5 text-xs"
              onClick={() => setAllMonthsOpen(true)}
            >
              전체 보기
            </Button>
          ) : null}
        </div>
        {stats.monthRows.length === 0 ? (
          <EmptyState
            illustration="cost"
            title="비용이 입력된 기록이 없습니다"
            description="대시보드에서 항목 완료 시 비용 입력을 켜면 월별·항목별 비용이 집계됩니다"
          />
        ) : (
          <ul className="space-y-3">
            {previewRows.map((row) => (
              <li key={row.yearMonth} className="card overflow-hidden">
                <MonthlySpendRow
                  row={row}
                  monthTotalMap={monthTotalMap}
                  onClick={() => setSelectedMonth(row.yearMonth)}
                />
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
      </>
      ) : null}

      <MonthlySpendDetailModal
        open={!!selectedMonth}
        yearMonth={selectedMonth}
        total={selectedMonthTotal}
        details={selectedMonthDetails}
        onClose={() => setSelectedMonth(null)}
      />

      <MonthlySpendAllModal
        open={allMonthsOpen}
        onClose={() => setAllMonthsOpen(false)}
        monthRows={stats.monthRows}
        logs={logs}
        itemName={itemName}
        categoryNameByItemId={categoryNameByItemId}
      />
    </div>
  );
}
