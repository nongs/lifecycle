import type { CycleUnit } from "@/lib/types";

const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH = 30;
const DAYS_PER_WEEK = 7;

export function cycleToDays(value: number, unit: CycleUnit): number {
  if (value < 0) return 0;
  switch (unit) {
    case "year":
      return value * DAYS_PER_YEAR;
    case "month":
      return value * DAYS_PER_MONTH;
    case "week":
      return value * DAYS_PER_WEEK;
    case "day":
    default:
      return value;
  }
}

export function daysToCycleDisplay(days: number): {
  value: number;
  unit: CycleUnit;
} {
  if (days === 0) return { value: 0, unit: "day" };
  if (days % DAYS_PER_YEAR === 0)
    return { value: days / DAYS_PER_YEAR, unit: "year" };
  if (days % DAYS_PER_MONTH === 0)
    return { value: days / DAYS_PER_MONTH, unit: "month" };
  if (days % DAYS_PER_WEEK === 0)
    return { value: days / DAYS_PER_WEEK, unit: "week" };
  return { value: days, unit: "day" };
}

export const CYCLE_UNIT_LABELS: Record<CycleUnit, string> = {
  day: "일",
  week: "주",
  month: "개월",
  year: "년",
};

export function formatCycleDays(days: number): string {
  const { value, unit } = daysToCycleDisplay(days);
  return `${value}${CYCLE_UNIT_LABELS[unit]}`;
}
