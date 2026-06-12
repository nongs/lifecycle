import type { NextConfig } from "next";

const variant =
  process.env.NEXT_PUBLIC_APP_VARIANT === "cloud" ? "cloud" : "demo";

const shellVariant =
  process.env.NEXT_PUBLIC_SHELL_VARIANT === "webapp" ? "webapp" : "web";

/**
 * 배포 서브경로. 빌드 스크립트에서 DEPLOY_BASE_PATH 로 덮어쓸 수 있음.
 * - demo: /lifecycle
 * - cloud: /lifecycle-app
 */
const DEPLOY_BASE_PATH =
  process.env.DEPLOY_BASE_PATH ??
  (variant === "cloud" ? "/lifecycle-app" : "/lifecycle");

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? DEPLOY_BASE_PATH : "";

const nextConfig: NextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_APP_VARIANT: variant,
    NEXT_PUBLIC_SHELL_VARIANT: shellVariant,
    NEXT_PUBLIC_DEPLOY_BASE_PATH: basePath,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
  ...(isProd && { trailingSlash: true }),
  ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
};

export default nextConfig;
