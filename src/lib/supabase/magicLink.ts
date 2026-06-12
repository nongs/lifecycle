"use client";

import { getAuthRedirectUrl } from "@/lib/appUrl";
import { getSupabase } from "@/lib/supabase/client";

export async function sendMagicLink(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("이메일을 입력해 주세요.");
  }

  const { error } = await getSupabase().auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
