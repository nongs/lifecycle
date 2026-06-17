"use client";

import { useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { runReminderCheck } from "@/lib/notifications/runReminderCheck";
import { IS_WEBAPP_SHELL } from "@/lib/variant";

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

/** webapp: 설정 시각 이후 임박·지연 항목 리마인더 */
export function ReminderScheduler() {
  const { ready, items, logs, categories } = useData();

  useEffect(() => {
    if (!IS_WEBAPP_SHELL || !ready) return;

    const run = () => {
      void runReminderCheck({ items, logs, categories });
    };

    run();

    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };

    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(run, CHECK_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [ready, items, logs, categories]);

  return null;
}
