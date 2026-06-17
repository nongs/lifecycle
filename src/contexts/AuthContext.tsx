"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { resetCloudSeedCache } from "@/lib/api/supabaseSeed";
import { snapshotCloudToLocal } from "@/lib/data/cloudLocalSync";
import {
  getCloudSession,
  isAuthenticatedSession,
} from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { isCloudBackendReady } from "@/lib/variant";

interface AuthContextValue {
  authReady: boolean;
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  /** refresh 실패 등으로 세션이 끊긴 경우 (명시적 로그아웃 제외) */
  needsReauth: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cloudAuth = isCloudBackendReady();
  const [authReady, setAuthReady] = useState(!cloudAuth);
  const [session, setSession] = useState<Session | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);
  const explicitSignOutRef = useRef(false);
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (!cloudAuth) return;

    let cancelled = false;

    getCloudSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        if (isAuthenticatedSession(s)) {
          wasAuthenticatedRef.current = true;
        }
        setAuthReady(true);
      }
    });

    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_IN" && isAuthenticatedSession(nextSession)) {
        wasAuthenticatedRef.current = true;
        setNeedsReauth(false);
      }

      if (event === "SIGNED_OUT") {
        if (wasAuthenticatedRef.current && !explicitSignOutRef.current) {
          setNeedsReauth(true);
        }
        if (explicitSignOutRef.current) {
          explicitSignOutRef.current = false;
          wasAuthenticatedRef.current = false;
          setNeedsReauth(false);
        }
      }

      if (event === "TOKEN_REFRESHED" && isAuthenticatedSession(nextSession)) {
        setNeedsReauth(false);
      }

      setSession(nextSession);
      setAuthReady(true);
    });

    const syncSession = () => {
      void getCloudSession().then((s) => {
        if (!cancelled) setSession(s);
      });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") syncSession();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", syncSession);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", syncSession);
    };
  }, [cloudAuth]);

  const signOut = useCallback(async () => {
    if (!cloudAuth) return;

    explicitSignOutRef.current = true;
    const session = await getCloudSession();
    if (isAuthenticatedSession(session)) {
      await snapshotCloudToLocal();
    }

    const { error } = await getSupabase().auth.signOut();
    if (error) throw new Error(error.message);
    resetCloudSeedCache();
  }, [cloudAuth]);

  const value = useMemo(
    () => ({
      authReady,
      session,
      user: session?.user ?? null,
      isAuthenticated: isAuthenticatedSession(session),
      needsReauth,
      signOut,
    }),
    [authReady, session, needsReauth, signOut]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
