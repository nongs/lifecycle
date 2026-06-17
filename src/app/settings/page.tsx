"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { AccountCard } from "@/components/settings/AccountCard";
import { DataTransferSection } from "@/components/settings/DataTransferSection";
import { LoginPromptCard } from "@/components/settings/LoginPromptCard";
import { PwaInstallCard } from "@/components/settings/PwaInstallCard";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { PageLoading } from "@/components/ui/PageLoading";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { readAppSettings, updateAppSettings } from "@/lib/settings";
import { isStandalonePwa } from "@/lib/pwa";
import {
  APP_VARIANT,
  isCloudBackendReady,
  isWebAppFeaturesEnabled,
  SHELL_VARIANT,
} from "@/lib/variant";

export default function SettingsPage() {
  const { authReady, isAuthenticated, needsReauth } = useAuth();
  const { ready, dataMode } = useData();
  const [pushEnabled, setPushEnabled] = useState(
    () => readAppSettings().pushNotificationsEnabled
  );
  const [reminderHour, setReminderHour] = useState(
    () => readAppSettings().reminderHour
  );
  const [installedPwa, setInstalledPwa] = useState(false);

  useEffect(() => {
    setInstalledPwa(isStandalonePwa());
  }, []);

  const handlePushChange = useCallback(async (checked: boolean) => {
    if (
      checked &&
      isWebAppFeaturesEnabled() &&
      typeof Notification !== "undefined"
    ) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushEnabled(false);
        updateAppSettings({ pushNotificationsEnabled: false });
        return;
      }
    }
    setPushEnabled(checked);
    updateAppSettings({ pushNotificationsEnabled: checked });
  }, []);

  const handleReminderHourChange = useCallback((hour: number) => {
    setReminderHour(hour);
    updateAppSettings({ reminderHour: hour });
  }, []);

  if (!ready || (isCloudBackendReady() && !authReady)) {
    return <PageLoading />;
  }

  const showCloudAuth = isCloudBackendReady();
  const pushHint = isWebAppFeaturesEnabled()
    ? "항목별 알림 ON + 임박·지연 시 리마인더 (앱 활성·설치형 PWA)"
    : "PWA(webapp) 빌드에서 알림 권한을 요청합니다.";

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">설정</h1>
        <p className="page-header-sub">알림·계정·동기화</p>
      </header>

      {showCloudAuth && needsReauth && (
        <Card className="mb-6 border-warning-border bg-[rgb(var(--status-soon-bg))] p-5">
          <p className="text-sm font-medium text-ink">로그인이 만료되었습니다</p>
          <p className="mt-1.5 text-sm text-ink-muted">
            클라우드 동기화를 이어하려면 다시 로그인해 주세요.
          </p>
          <Link href="/settings/login" className="mt-4 block">
            <Button fullWidth>다시 로그인</Button>
          </Link>
        </Card>
      )}

      {showCloudAuth && !isAuthenticated && !needsReauth && (
        <LoginPromptCard />
      )}
      {showCloudAuth && isAuthenticated && (
        <AccountCard dataMode={dataMode} />
      )}

      <DataTransferSection dataMode={dataMode} />

      <PwaInstallCard />

      <SettingsSection title="알림">
        <SettingsRow
          label="푸시 알림"
          description={pushHint}
          last={!isWebAppFeaturesEnabled() || !pushEnabled}
        >
          <Switch
            checked={pushEnabled}
            onCheckedChange={(checked) => void handlePushChange(checked)}
            aria-label="푸시 알림"
          />
        </SettingsRow>
        {isWebAppFeaturesEnabled() && pushEnabled && (
          <SettingsRow
            label="리마인더 시각"
            description="이 시각 이후 앱이 켜져 있으면 하루 1회 확인합니다."
            last
          >
            <select
              value={reminderHour}
              onChange={(e) =>
                handleReminderHourChange(Number(e.target.value))
              }
              className="select-field text-sm"
              aria-label="리마인더 시각"
            >
              {Array.from({ length: 24 }, (_, hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </SettingsRow>
        )}
      </SettingsSection>

      <SettingsSection title="앱 정보">
        <SettingsRow
          label="데이터"
          description={
            showCloudAuth
              ? "클라우드 — 로그인 시 동기화"
              : "데모 — 이 기기에만 저장"
          }
        >
          <span className="text-sm text-ink-muted">{APP_VARIANT}</span>
        </SettingsRow>
        <SettingsRow
          label="셸"
          description={
            isWebAppFeaturesEnabled()
              ? installedPwa
                ? "홈 화면에 설치됨"
                : "PWA — 브라우저 메뉴에서 설치"
              : "브라우저 탭"
          }
          last
        >
          <span className="text-sm text-ink-muted">{SHELL_VARIANT}</span>
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
