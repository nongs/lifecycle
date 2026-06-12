"use client";

import { useCallback, useState } from "react";
import { AccountCard } from "@/components/settings/AccountCard";
import { DataTransferSection } from "@/components/settings/DataTransferSection";
import { LoginPromptCard } from "@/components/settings/LoginPromptCard";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Switch } from "@/components/ui/Switch";
import { PageLoading } from "@/components/ui/PageLoading";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { readAppSettings, updateAppSettings } from "@/lib/settings";
import {
  APP_VARIANT,
  isCloudBackendReady,
  isWebAppFeaturesEnabled,
} from "@/lib/variant";

export default function SettingsPage() {
  const { authReady, isAuthenticated } = useAuth();
  const { ready, dataMode } = useData();
  const [pushEnabled, setPushEnabled] = useState(
    () => readAppSettings().pushNotificationsEnabled
  );

  const handlePushChange = useCallback((checked: boolean) => {
    setPushEnabled(checked);
    updateAppSettings({ pushNotificationsEnabled: checked });
  }, []);

  if (!ready || (isCloudBackendReady() && !authReady)) {
    return <PageLoading />;
  }

  const showCloudAuth = isCloudBackendReady();
  const pushHint = isWebAppFeaturesEnabled()
    ? "설치형 앱에서 주기 알림을 받을 수 있습니다."
    : "PWA 설치 후 푸시 알림이 제공될 예정입니다. 지금은 설정만 저장됩니다.";

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">설정</h1>
        <p className="page-header-sub">알림·계정·동기화</p>
      </header>

      {showCloudAuth && !isAuthenticated && <LoginPromptCard />}
      {showCloudAuth && isAuthenticated && (
        <AccountCard dataMode={dataMode} />
      )}

      <DataTransferSection dataMode={dataMode} />

      <SettingsSection title="알림">
        <SettingsRow
          label="푸시 알림"
          description={pushHint}
          last
        >
          <Switch
            checked={pushEnabled}
            onCheckedChange={handlePushChange}
            aria-label="푸시 알림"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="앱 정보">
        <SettingsRow
          label="빌드"
          description={
            showCloudAuth
              ? "클라우드 버전 — 로그인 시 동기화"
              : "데모 버전 — 이 기기에만 저장"
          }
          last
        >
          <span className="text-sm text-ink-muted">{APP_VARIANT}</span>
        </SettingsRow>
      </SettingsSection>

      {!showCloudAuth && (
        <p className="px-1 text-xs leading-relaxed text-ink-faint">
          클라우드 동기화는{" "}
          <code className="rounded bg-accent-soft px-1">npm run dev:cloud</code>{" "}
          또는 cloud 빌드에서 이용할 수 있습니다.
        </p>
      )}
    </div>
  );
}
