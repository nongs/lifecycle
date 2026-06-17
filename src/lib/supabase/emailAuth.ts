"use client";

import { getSupabase } from "@/lib/supabase/client";

/** Supabase 이메일 OTP 자릿수 (프로젝트·템플릿 설정에 따름, 기본 8) */
export const EMAIL_OTP_DIGIT_LENGTH = 8;

function normalizeEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("이메일을 입력해 주세요.");
  }
  return trimmed;
}

function normalizeOtp(token: string): string {
  const digits = token.replace(/\D/g, "");
  if (digits.length !== EMAIL_OTP_DIGIT_LENGTH) {
    throw new Error(
      `인증 코드 ${EMAIL_OTP_DIGIT_LENGTH}자리를 입력해 주세요.`
    );
  }
  return digits;
}

/**
 * 이메일 OTP 발송 (emailRedirectTo 없음 → Magic Link 대신 숫자 코드).
 * iOS PWA 등에서 메일 링크가 Safari로 열리는 문제를 피하기 위해 사용.
 */
export async function sendEmailOtp(email: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<void> {
  const { error } = await getSupabase().auth.verifyOtp({
    email: normalizeEmail(email),
    token: normalizeOtp(token),
    type: "email",
  });

  if (error) {
    throw new Error(error.message);
  }
}
