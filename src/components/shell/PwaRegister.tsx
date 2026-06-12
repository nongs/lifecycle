"use client";

import { useEffect } from "react";
import { IS_WEBAPP_SHELL } from "@/lib/variant";

function serviceWorkerPath(): string {
  const base = process.env.NEXT_PUBLIC_DEPLOY_BASE_PATH ?? "";
  return `${base}/sw.js`.replace(/\/{2,}/g, "/");
}

function serviceWorkerScope(): string {
  const base = process.env.NEXT_PUBLIC_DEPLOY_BASE_PATH ?? "";
  if (!base) return "/";
  return `${base}/`.replace(/\/{2,}/g, "/");
}

/** webapp 셸: Service Worker 등록 (PWA 설치 조건) */
export function PwaRegister() {
  useEffect(() => {
    if (!IS_WEBAPP_SHELL) return;
    if (!("serviceWorker" in navigator)) return;

    const path = serviceWorkerPath();
    const scope = serviceWorkerScope();

    navigator.serviceWorker.register(path, { scope }).catch(() => {
      /* 로컬 dev·미지원 환경은 무시 */
    });
  }, []);

  return null;
}
