"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isIosDevice, isStandalonePwa } from "@/lib/pwa";
import { IS_WEBAPP_SHELL } from "@/lib/variant";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type PwaInstallState = "installed" | "available" | "ios" | "manual";

export function usePwaInstall() {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installState, setInstallState] = useState<PwaInstallState>("manual");
  const [iosHelpOpen, setIosHelpOpen] = useState(false);

  useEffect(() => {
    if (!IS_WEBAPP_SHELL) return;

    const syncInstalled = () => {
      const next = isStandalonePwa();
      setInstalled(next);
      if (next) {
        deferredRef.current = null;
        setInstallState("installed");
      }
    };

    syncInstalled();

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setInstallState("available");
    };

    const onAppInstalled = () => {
      deferredRef.current = null;
      setInstalled(true);
      setInstallState("installed");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    if (!isStandalonePwa() && isIosDevice()) {
      setInstallState("ios");
    }

    const media = window.matchMedia("(display-mode: standalone)");
    const onDisplayMode = () => syncInstalled();
    media.addEventListener("change", onDisplayMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      media.removeEventListener("change", onDisplayMode);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = deferredRef.current;
    if (!prompt) return false;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    deferredRef.current = null;

    if (outcome === "accepted") {
      setInstalled(true);
      setInstallState("installed");
      return true;
    }

    setInstallState("manual");
    return false;
  }, []);

  const openIosHelp = useCallback(() => {
    setIosHelpOpen(true);
  }, []);

  return {
    enabled: IS_WEBAPP_SHELL,
    installed,
    installState,
    iosHelpOpen,
    openIosHelp,
    closeIosHelp: () => setIosHelpOpen(false),
    install,
    canPromptInstall: installState === "available",
  };
}
