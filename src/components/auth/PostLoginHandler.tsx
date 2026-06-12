"use client";

import { useEffect, useRef, useState } from "react";
import { MigrationModal } from "@/components/settings/MigrationModal";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import {
  evaluatePostLogin,
  type UserDataPresence,
} from "@/lib/data/cloudLocalSync";
import { isCloudBackendReady } from "@/lib/variant";

/** 로그인 직후 마이그레이션 제안 (계정당 1회) */
export function PostLoginHandler() {
  const { authReady, isAuthenticated, user } = useAuth();
  const { refresh } = useData();
  const promptedUserId = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [localPresence, setLocalPresence] = useState<UserDataPresence | null>(
    null
  );

  useEffect(() => {
    if (!isCloudBackendReady() || !authReady || !isAuthenticated || !user?.id) {
      if (!isAuthenticated) {
        promptedUserId.current = null;
      }
      return;
    }

    if (promptedUserId.current === user.id) return;

    let cancelled = false;

    evaluatePostLogin()
      .then((action) => {
        if (cancelled) return;
        promptedUserId.current = user.id;
        if (action.type === "offer_migration") {
          setLocalPresence(action.local);
          setOpen(true);
        }
      })
      .catch(() => {
        if (!cancelled) promptedUserId.current = user.id;
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, isAuthenticated, user?.id]);

  const handleComplete = async () => {
    setOpen(false);
    await refresh();
  };

  const handleSkip = () => {
    setOpen(false);
    void refresh();
  };

  if (!localPresence) return null;

  return (
    <MigrationModal
      open={open}
      local={localPresence}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
