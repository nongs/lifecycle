import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const isWebApp = process.env.NEXT_PUBLIC_SHELL_VARIANT === "webapp";

export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_DEPLOY_BASE_PATH ?? "";
  const prefix = base ? `${base}/` : "/";

  if (!isWebApp) {
    return {
      name: "LifeCycle",
      short_name: "LifeCycle",
      start_url: prefix,
      display: "browser",
    };
  }

  return {
    name: "LifeCycle",
    short_name: "LifeCycle",
    description: "일상 사이클 관리",
    start_url: prefix,
    scope: prefix,
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf8f5",
    theme_color: "#c4704a",
    lang: "ko",
    icons: [
      {
        src: `${prefix}icons/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `${prefix}icons/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
