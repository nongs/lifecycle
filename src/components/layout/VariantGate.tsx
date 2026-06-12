"use client";

import { CloudSetupNotice } from "@/components/layout/CloudSetupNotice";
import { IS_CLOUD_VARIANT, isCloudBackendReady } from "@/lib/variant";

/** cloud 빌드에서 Supabase env가 없으면 설정 안내만 표시 */
export function VariantGate({ children }: { children: React.ReactNode }) {
  if (IS_CLOUD_VARIANT && !isCloudBackendReady()) {
    return <CloudSetupNotice />;
  }
  return <>{children}</>;
}
