export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function todayISO(): string {
  return formatDateISO(new Date());
}

export function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDaysSince(lastDate: string): number {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(lastDate + "T00:00:00"));
  const diff = today.getTime() - target.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

export function endOfMonthISO(ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return formatDateISO(d);
}

export function hasLogInMonth(
  logs: { performedAt: string }[],
  year: number,
  month: number
): boolean {
  return logs.some((log) => {
    const d = new Date(log.performedAt + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  });
}
