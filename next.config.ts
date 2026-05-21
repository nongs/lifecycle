import type { NextConfig } from "next";

/**
 * 배포 시 사용할 URL 서브경로 (로컬 `npm run dev`에는 적용되지 않음).
 * - 서브경로 배포: "/lifecycle" → https://example.com/lifecycle/
 * - 도메인 루트 배포: "" (빈 문자열)
 */
const DEPLOY_BASE_PATH = "/lifecycle";

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? DEPLOY_BASE_PATH : "";

const nextConfig: NextConfig = {
  output: "export",
  ...(isProd && { trailingSlash: true }),
  ...(basePath
    ? { basePath, assetPrefix: `${basePath}/` }
    : {}),
};

export default nextConfig;
