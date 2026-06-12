/**
 * 빌드·실행 시 2축 분기
 *
 * 1) 데이터 (local / db)  — `@/lib/api` 구현체
 * 2) 셸 (web / webapp)    — PWA·manifest·푸시 등 (UI 코어는 공통)
 *
 * | shell ↓  data → | local (demo)     | db (cloud)        |
 * |-----------------|------------------|-------------------|
 * | web             | 포트폴리오 데모   | 풀스택 브라우저    |
 * | webapp (PWA)    | (선택·오프라인)  | 설치형·알림 목표   |
 */

/** localStorage vs Supabase — 기존 `demo` | `cloud` */
export type DataVariant = "demo" | "cloud";

/** 브라우저 탭 vs PWA(홈 화면·standalone) */
export type ShellVariant = "web" | "webapp";

export const DATA_VARIANT: DataVariant =
  process.env.NEXT_PUBLIC_DATA_VARIANT === "cloud" ||
  process.env.NEXT_PUBLIC_APP_VARIANT === "cloud"
    ? "cloud"
    : "demo";

export const SHELL_VARIANT: ShellVariant =
  process.env.NEXT_PUBLIC_SHELL_VARIANT === "webapp" ? "webapp" : "web";

/** @deprecated DATA_VARIANT 사용 */
export type AppVariant = DataVariant;
export const APP_VARIANT = DATA_VARIANT;

export const IS_CLOUD_VARIANT = DATA_VARIANT === "cloud";
export const IS_WEBAPP_SHELL = SHELL_VARIANT === "webapp";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}

/** cloud + Supabase env 준비 → 본 앱 + DB API */
export function isCloudBackendReady(): boolean {
  return IS_CLOUD_VARIANT && isSupabaseConfigured();
}

/** PWA manifest·SW·푸시 등 webapp 전용 기능 ON */
export function isWebAppFeaturesEnabled(): boolean {
  return IS_WEBAPP_SHELL;
}
