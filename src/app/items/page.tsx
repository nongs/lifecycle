"use client";

import { useMemo, useState } from "react";
import { ItemDetailModal } from "@/components/items/ItemDetailModal";
import { ItemFormModal } from "@/components/items/ItemFormModal";
import { LogFormModal } from "@/components/logs/LogFormModal";
import { CategoryEditModal } from "@/components/categories/CategoryEditModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useData } from "@/contexts/DataContext";
import { useItemViewModels } from "@/hooks/useItemViewModels";
import * as api from "@/lib/api/apiService";
import { formatCycleDays } from "@/lib/utils/cycle";
import { URGENCY_LABELS } from "@/lib/utils/itemStatus";
import { AddItemButton } from "@/components/items/AddItemButton";
import { ItemsEmptyState } from "@/components/items/ItemsEmptyState";
import { buildItemViewModel } from "@/lib/utils/dashboard";
import type { ItemViewModel, ManagementItem } from "@/lib/types";

export default function ItemsPage() {
  const { refresh, categories, archivedItems, logs } = useData();
  const { ready, viewModels } = useItemViewModels(true);

  const [filterId, setFilterId] = useState<string | "all">("all");
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ManagementItem | null>(null);
  const [detailItem, setDetailItem] = useState<ManagementItem | null>(null);
  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [logItem, setLogItem] = useState<ManagementItem | null>(null);
  const [menuItem, setMenuItem] = useState<ManagementItem | null>(null);
  const [confirm, setConfirm] = useState<
    null | { type: "delete"; item: ManagementItem } | { type: "restore"; item: ManagementItem }
  >(null);

  const activeSorted = useMemo(() => {
    let list = viewModels.filter((vm) => vm.item.status === "active");
    if (filterId !== "all") {
      list = list.filter((vm) => vm.item.categoryId === filterId);
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.item.createdAt).getTime() -
        new Date(a.item.createdAt).getTime()
    );
  }, [viewModels, filterId]);

  const archivedVMs = useMemo((): ItemViewModel[] => {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    return archivedItems.map((item) =>
      buildItemViewModel(
        item,
        categoryMap.get(item.categoryId) ?? "미분류",
        logs.filter((l) => l.itemId === item.id)
      )
    );
  }, [archivedItems, categories, logs]);

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "미분류";

  const activeItemCount = useMemo(
    () => viewModels.filter((vm) => vm.item.status === "active").length,
    [viewModels]
  );

  const isCategoryFilter = filterId !== "all";
  const isCategoryFilterEmpty =
    isCategoryFilter && activeSorted.length === 0 && activeItemCount > 0;
  const addCategoryPrefill =
    isCategoryFilter && filterId !== "all" ? filterId : undefined;

  const openAddItem = () => {
    setEditItem(null);
    setItemFormOpen(true);
  };

  if (!ready) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-slate-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">항목 관리</h1>
        <button
          type="button"
          onClick={() => setCategoryEditOpen(true)}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          카테고리 편집
        </button>
      </header>

      <div className="-mx-4 mb-4 overflow-x-auto px-4 pb-1">
        <div className="flex flex-nowrap gap-2" role="tablist" aria-label="카테고리 필터">
          <button
            type="button"
            role="tab"
            aria-selected={filterId === "all"}
            onClick={() => setFilterId("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              filterId === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={filterId === c.id}
              onClick={() => setFilterId(c.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                filterId === c.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">정렬: 생성일 (최신순)</p>
        <AddItemButton onClick={openAddItem} />
      </div>

      {activeSorted.length === 0 ? (
        isCategoryFilterEmpty ? (
          <ItemsEmptyState
            variant="category-empty"
            categoryName={categoryName(filterId)}
            onAdd={openAddItem}
            onShowAll={() => setFilterId("all")}
          />
        ) : (
          <ItemsEmptyState onAdd={openAddItem} />
        )
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {activeSorted.map((vm) => (
            <li
              key={vm.item.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{vm.item.name}</h3>
                  <p className="text-xs text-slate-500">
                    {vm.categoryName} · {formatCycleDays(vm.item.targetCycleDays)}{" "}
                    · {URGENCY_LABELS[vm.urgency]}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setDetailItem(vm.item)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    상세
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuItem(vm.item)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    aria-label="더보기"
                  >
                    ⋮
                  </button>
                </div>
              </div>
            </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-center">
            <AddItemButton onClick={openAddItem} variant="outline" />
          </div>
        </>
      )}

      {archivedVMs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-slate-500">아카이브</h2>
          <ul className="flex flex-col gap-2">
            {archivedVMs.map((vm) =>
              vm ? (
                <li
                  key={vm.item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-80"
                >
                  <p className="font-medium">{vm.item.name}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="text-sm text-slate-700 underline"
                      onClick={() =>
                        setConfirm({ type: "restore", item: vm.item })
                      }
                    >
                      복구
                    </button>
                    <button
                      type="button"
                      className="text-sm text-red-600"
                      onClick={() =>
                        setConfirm({ type: "delete", item: vm.item })
                      }
                    >
                      영구 삭제
                    </button>
                  </div>
                </li>
              ) : null
            )}
          </ul>
        </section>
      )}

      {menuItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-4">
            <p className="mb-3 font-medium">{menuItem.name}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="rounded-lg py-2 text-left text-sm"
                onClick={() => {
                  setEditItem(menuItem);
                  setItemFormOpen(true);
                  setMenuItem(null);
                }}
              >
                수정
              </button>
              <button
                type="button"
                className="rounded-lg py-2 text-left text-sm"
                onClick={() => {
                  setLogItem(menuItem);
                  setMenuItem(null);
                }}
              >
                기록 추가
              </button>
              <button
                type="button"
                className="rounded-lg py-2 text-left text-sm text-amber-800"
                onClick={async () => {
                  await api.archiveItem(menuItem.id);
                  setMenuItem(null);
                  refresh();
                }}
              >
                아카이브
              </button>
              <button
                type="button"
                className="rounded-lg py-2 text-left text-sm"
                onClick={() => setMenuItem(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <ItemFormModal
        open={itemFormOpen}
        categories={categories}
        item={editItem}
        defaultCategoryId={!editItem ? addCategoryPrefill : undefined}
        onClose={() => {
          setItemFormOpen(false);
          setEditItem(null);
        }}
        onSaved={refresh}
      />

      <ItemDetailModal
        open={!!detailItem}
        item={detailItem}
        categoryName={detailItem ? categoryName(detailItem.categoryId) : ""}
        categories={categories}
        onClose={() => setDetailItem(null)}
        onChanged={refresh}
      />

      <CategoryEditModal
        open={categoryEditOpen}
        categories={categories}
        onClose={() => setCategoryEditOpen(false)}
        onChanged={refresh}
      />

      <LogFormModal
        open={!!logItem}
        itemId={logItem?.id ?? ""}
        itemName={logItem?.name ?? ""}
        onClose={() => setLogItem(null)}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={confirm?.type === "delete"}
        title="항목 영구 삭제"
        message="항목과 모든 기록이 삭제됩니다."
        destructive
        confirmLabel="삭제"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm?.type === "delete") {
            await api.deleteItem(confirm.item.id);
            setConfirm(null);
            refresh();
          }
        }}
      />

      <ConfirmDialog
        open={confirm?.type === "restore"}
        title="항목 복구"
        message="대시보드에 다시 표시합니다."
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm?.type === "restore") {
            await api.restoreItem(confirm.item.id);
            setConfirm(null);
            refresh();
          }
        }}
      />
    </div>
  );
}
