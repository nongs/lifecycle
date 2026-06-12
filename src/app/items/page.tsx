"use client";

import { useMemo, useState } from "react";
import { ItemDetailModal } from "@/components/items/ItemDetailModal";
import { ItemFormModal } from "@/components/items/ItemFormModal";
import { LogFormModal } from "@/components/logs/LogFormModal";
import { CategoryEditModal } from "@/components/categories/CategoryEditModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useData } from "@/contexts/DataContext";
import { useItemViewModels } from "@/hooks/useItemViewModels";
import * as api from "@/lib/api";
import { formatCycleDays } from "@/lib/utils/cycle";
import { URGENCY_LABELS } from "@/lib/utils/itemStatus";
import { AddItemButton } from "@/components/items/AddItemButton";
import { ItemsEmptyState } from "@/components/items/ItemsEmptyState";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PageLoading } from "@/components/ui/PageLoading";
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
    return <PageLoading />;
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="page-header-title">항목 관리</h1>
        <Button variant="secondary" className="shrink-0 px-3 py-2" onClick={() => setCategoryEditOpen(true)}>
          카테고리 편집
        </Button>
      </header>

      <div className="-mx-4 mb-4 overflow-x-auto px-4 pb-1">
        <div className="flex flex-nowrap gap-2" role="tablist" aria-label="카테고리 필터">
          <Chip
            role="tab"
            aria-selected={filterId === "all"}
            active={filterId === "all"}
            onClick={() => setFilterId("all")}
          >
            전체
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              role="tab"
              aria-selected={filterId === c.id}
              active={filterId === c.id}
              onClick={() => setFilterId(c.id)}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-end justify-between gap-3">
        <p className="pb-0.5 text-xs text-ink-faint">정렬: 생성일 (최신순)</p>
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
              className="card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 px-1">
                  <h3 className="item-title mb-2">{vm.item.name}</h3>
                  <p className="text-xs text-ink-muted">
                    {vm.categoryName} · {formatCycleDays(vm.item.targetCycleDays)}{" "}
                    · {URGENCY_LABELS[vm.urgency]}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setDetailItem(vm.item)}
                    className="rounded-xl border border-line-strong px-2.5 py-1 text-xs text-ink-muted hover:bg-accent-soft"
                  >
                    상세
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuItem(vm.item)}
                    className="rounded-xl border border-line-strong px-2.5 py-1 text-xs text-ink-muted hover:bg-accent-soft"
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
          <h2 className="mb-2 text-sm font-semibold text-ink-faint">아카이브</h2>
          <ul className="flex flex-col gap-2">
            {archivedVMs.map((vm) =>
              vm ? (
                <li
                  key={vm.item.id}
                  className="card-muted p-4 opacity-90"
                >
                  <p className="font-medium text-ink-muted">{vm.item.name}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="text-sm text-ink-muted underline"
                      onClick={() =>
                        setConfirm({ type: "restore", item: vm.item })
                      }
                    >
                      복구
                    </button>
                    <button
                      type="button"
                      className="text-sm text-danger"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-overlay/30"
            aria-label="메뉴 닫기"
            onClick={() => setMenuItem(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-t-modal bg-surface px-2 pb-4 pt-3 shadow-modal">
            <p className="item-title mb-2 px-3">{menuItem.name}</p>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className="menu-action"
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
                className="menu-action"
                onClick={() => {
                  setLogItem(menuItem);
                  setMenuItem(null);
                }}
              >
                기록 추가
              </button>
              <button
                type="button"
                className="menu-action-danger"
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
                className="menu-action text-ink-faint"
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
