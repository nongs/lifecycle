import { MASTER_USER_ID, type Category } from "@/lib/types";

const now = () => new Date().toISOString();

export const SEED_CATEGORIES: Omit<
  Category,
  "id" | "createdAt" | "updatedAt"
>[] = [
  { userId: MASTER_USER_ID, name: "그루밍", icon: "sparkles", sortOrder: 0 },
  { userId: MASTER_USER_ID, name: "모빌리티", icon: "car", sortOrder: 1 },
  { userId: MASTER_USER_ID, name: "리빙", icon: "home", sortOrder: 2 },
  { userId: MASTER_USER_ID, name: "소비", icon: "shopping-bag", sortOrder: 3 },
];

export function createSeedCategory(
  data: (typeof SEED_CATEGORIES)[number],
  id: string
): Category {
  const t = now();
  return { ...data, id, createdAt: t, updatedAt: t };
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
