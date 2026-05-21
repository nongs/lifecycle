"use client";

import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
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
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-slate-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">통계</h1>
        <p className="mt-1 text-sm text-slate-500">
          실제 기록을 바탕으로 한 요약입니다.
        </p>
      </header>

      <section
        className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        aria-label="요약"
      >
        <h2 className="text-sm font-semibold text-slate-800">요약</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>전체 수행 기록: {stats.totalLogs}건</li>
          <li>비용이 입력된 기록: {stats.logsWithCostCount}건</li>
          <li>
            이번 달({stats.ym}) 비용 합계:{" "}
            <span className="font-semibold text-slate-900">
              {stats.thisMonthSpend.toLocaleString()}원
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-6" aria-labelledby="monthly-spend-heading">
        <h2
          id="monthly-spend-heading"
          className="mb-3 text-sm font-semibold text-slate-800"
        >
          월별 비용
        </h2>
        {stats.monthRows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            비용이 입력된 기록이 없습니다. 항목 완료 시 비용 입력을 켜 보세요.
          </p>
        ) : (
          <ul className="space-y-3">
            {stats.monthRows.slice(0, 12).map((row) => (
              <li key={row.yearMonth} className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-800">
                    {row.yearMonth}
                  </span>
                  <span className="text-slate-900">
                    {row.total.toLocaleString()}원
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-slate-800"
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
          className="mb-3 text-sm font-semibold text-slate-800"
        >
          항목별
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            활성 항목이 없습니다. 항목 관리에서 추가해 주세요.
          </p>
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
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-sm"
                >
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {categoryName(item.categoryId)}
                  </div>
                  <dl className="mt-3 space-y-1 text-slate-600">
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
