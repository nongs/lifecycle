"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useOnline } from "@/hooks/useOnline";
import { getCloudSession } from "@/lib/supabase/auth";
import { isCloudBackendReady } from "@/lib/variant";

/**
 * PWA·cloud: 온라인 복귀·앱 포그라운드 시 세션·데이터 동기화
 */
export function PwaLifecycle() {
  const online = useOnline();
  const { authReady, isAuthenticated } = useAuth();
  const { refresh } = useData();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;

    if (!isCloudBackendReady()) {
      void refresh();
      return;
    }

    void (async () => {
      await getCloudSession();
      if (authReady) await refresh();
    })();
  }, [online, authReady, refresh]);

  useEffect(() => {
    if (!isCloudBackendReady() || !authReady || !isAuthenticated) return;

    const onVisible = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      void getCloudSession().then(() => refresh());
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [authReady, isAuthenticated, refresh]);

  return null;
}
