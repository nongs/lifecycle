"use client";

import type { AppDataset } from "@/lib/data/cloudLocalSync";
import {
  readLocalDataset,
  uploadDatasetToCloud,
  writeLocalDataset,
} from "@/lib/data/cloudLocalSync";
import type { DataMode } from "@/lib/api/resolveService";
import {
  MASTER_USER_ID,
  type ActivityLog,
  type Category,
  type ItemStatus,
  type ManagementItem,
} from "@/lib/types";

export const DATASET_EXPORT_VERSION = 1 as const;

export type DatasetExportBundle = {
  version: typeof DATASET_EXPORT_VERSION;
  exportedAt: string;
  categories: Category[];
  items: ManagementItem[];
  logs: ActivityLog[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} 값이 올바르지 않습니다.`);
  }
  return value;
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${field} 값이 올바르지 않습니다.`);
  }
  return value;
}

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new Error("문자열 필드 형식이 올바르지 않습니다.");
  }
  return value;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("숫자 필드 형식이 올바르지 않습니다.");
  }
  return value;
}

function parseCategory(value: unknown, index: number): Category {
  if (!isRecord(value)) {
    throw new Error(`categories[${index}] 형식이 올바르지 않습니다.`);
  }
  const now = new Date().toISOString();
  return {
    id: asString(value.id, `categories[${index}].id`),
    userId: MASTER_USER_ID,
    name: asString(value.name, `categories[${index}].name`),
    icon: asOptionalString(value.icon),
    sortOrder: asNumber(value.sortOrder, `categories[${index}].sortOrder`),
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

function parseItem(value: unknown, index: number): ManagementItem {
  if (!isRecord(value)) {
    throw new Error(`items[${index}] 형식이 올바르지 않습니다.`);
  }
  const status = value.status;
  if (status !== "active" && status !== "archived") {
    throw new Error(`items[${index}].status 값이 올바르지 않습니다.`);
  }
  const now = new Date().toISOString();
  return {
    id: asString(value.id, `items[${index}].id`),
    userId: MASTER_USER_ID,
    name: asString(value.name, `items[${index}].name`),
    targetCycleDays: asNumber(
      value.targetCycleDays,
      `items[${index}].targetCycleDays`
    ),
    categoryId: asString(value.categoryId, `items[${index}].categoryId`),
    status: status as ItemStatus,
    notificationEnabled: Boolean(value.notificationEnabled),
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

function parseLog(value: unknown, index: number): ActivityLog {
  if (!isRecord(value)) {
    throw new Error(`logs[${index}] 형식이 올바르지 않습니다.`);
  }
  const now = new Date().toISOString();
  return {
    id: asString(value.id, `logs[${index}].id`),
    userId: MASTER_USER_ID,
    itemId: asString(value.itemId, `logs[${index}].itemId`),
    performedAt: asString(value.performedAt, `logs[${index}].performedAt`),
    cost: asOptionalNumber(value.cost),
    note: asOptionalString(value.note),
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

function validateDataset(dataset: AppDataset): AppDataset {
  const categoryIds = new Set(dataset.categories.map((c) => c.id));

  for (const item of dataset.items) {
    if (!categoryIds.has(item.categoryId)) {
      throw new Error(
        `항목 "${item.name}"의 categoryId가 categories에 없습니다.`
      );
    }
  }

  const itemIds = new Set(dataset.items.map((i) => i.id));
  for (const log of dataset.logs) {
    if (!itemIds.has(log.itemId)) {
      throw new Error(`기록의 itemId가 items에 없습니다.`);
    }
  }

  return dataset;
}

function parseDatasetPayload(payload: unknown): AppDataset {
  if (!isRecord(payload)) {
    throw new Error("JSON 루트는 객체여야 합니다.");
  }

  const source = Array.isArray(payload.categories)
    ? payload
    : isRecord(payload.data)
      ? payload.data
      : null;

  if (!source) {
    throw new Error(
      "categories, items, logs 배열이 포함된 JSON이 필요합니다."
    );
  }

  if (
    !Array.isArray(source.categories) ||
    !Array.isArray(source.items) ||
    !Array.isArray(source.logs)
  ) {
    throw new Error("categories, items, logs는 모두 배열이어야 합니다.");
  }

  const dataset: AppDataset = {
    categories: source.categories.map(parseCategory),
    items: source.items.map(parseItem),
    logs: source.logs.map(parseLog),
  };

  return validateDataset(dataset);
}

export function buildExportBundle(dataset: AppDataset): DatasetExportBundle {
  return {
    version: DATASET_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    categories: dataset.categories,
    items: dataset.items,
    logs: dataset.logs,
  };
}

export function serializeExportBundle(bundle: DatasetExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function parseImportJson(raw: string): AppDataset {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("JSON 내용이 비어 있습니다.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("JSON 형식이 올바르지 않습니다.");
  }

  return parseDatasetPayload(parsed);
}

export function datasetSummary(dataset: AppDataset): string {
  return `카테고리 ${dataset.categories.length}개 · 항목 ${dataset.items.length}개 · 기록 ${dataset.logs.length}건`;
}

export function downloadExportFile(json: string): void {
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `lifecycle-data-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyExportToClipboard(json: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error("이 브라우저에서는 클립보드 복사를 지원하지 않습니다.");
  }
  await navigator.clipboard.writeText(json);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("파일을 읽을 수 없습니다."));
      }
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsText(file);
  });
}

export async function importDataset(
  dataset: AppDataset,
  target: DataMode
): Promise<void> {
  const normalized = validateDataset(dataset);

  if (target === "cloud") {
    await uploadDatasetToCloud(normalized);
    return;
  }

  writeLocalDataset(normalized);
}

export function getDatasetFromContext(
  categories: Category[],
  items: ManagementItem[],
  archivedItems: ManagementItem[],
  logs: ActivityLog[]
): AppDataset {
  return {
    categories,
    items: [...items, ...archivedItems],
    logs,
  };
}

/**보내기용 — 로컬 저장소 직접 읽기 (컨텍스트와 동일 소스일 때) */
export function readDatasetForExport(
  categories: Category[],
  items: ManagementItem[],
  archivedItems: ManagementItem[],
  logs: ActivityLog[],
  dataMode: DataMode
): AppDataset {
  if (dataMode === "local") {
    return readLocalDataset();
  }
  return getDatasetFromContext(categories, items, archivedItems, logs);
}
