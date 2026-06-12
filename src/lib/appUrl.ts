/** Magic Link 등 auth redirect용 앱 절대 URL */
export function getAuthRedirectUrl(): string {
  const base = process.env.NEXT_PUBLIC_DEPLOY_BASE_PATH ?? "";
  const path = `${base}/settings/login`.replace(/\/{2,}/g, "/") || "/settings/login";

  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }

  return path;
}
