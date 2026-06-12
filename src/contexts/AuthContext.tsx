"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cloudAuth = isCloudBackendReady();
  const [authReady, setAuthReady] = useState(!cloudAuth);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!cloudAuth) return;

    let cancelled = false;

    getCloudSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setAuthReady(true);
      }
    });

    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [cloudAuth]);

  const signOut = useCallback(async () => {
    if (!cloudAuth) return;

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
      signOut,
    }),
    [authReady, session, signOut]
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
