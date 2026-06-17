"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function PwaInstallCard() {
  const {
    enabled,
    installed,
    installState,
    iosHelpOpen,
    openIosHelp,
    closeIosHelp,
    install,
    canPromptInstall,
  } = usePwaInstall();

  if (!enabled || installed) return null;

  const showIosSteps = installState === "ios" && iosHelpOpen;

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-ink">홈 화면에 추가</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
        설치하면 앱처럼 실행되고 알림·오프라인 화면을 이용할 수 있습니다.
      </p>

      {canPromptInstall && (
        <Button
          fullWidth
          className="mt-4"
          onClick={() => void install()}
        >
          홈 화면에 추가
        </Button>
      )}

      {installState === "ios" && !iosHelpOpen && (
        <Button fullWidth className="mt-4" onClick={openIosHelp}>
          홈 화면에 추가 방법 보기
        </Button>
      )}

      {showIosSteps && (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
          <li>Safari 하단 또는 상단의 <strong className="font-medium text-ink">공유</strong> 버튼을 누릅니다.</li>
          <li>
            <strong className="font-medium text-ink">홈 화면에 추가</strong>를
            선택합니다.
          </li>
          <li>이름을 확인한 뒤 <strong className="font-medium text-ink">추가</strong>를 누릅니다.</li>
        </ol>
      )}

      {installState === "manual" && (
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          브라우저 주소창 옆 메뉴에서 「앱 설치」 또는 「홈 화면에 추가」를
          선택해 주세요.
        </p>
      )}

      {showIosSteps && (
        <Button
          variant="ghost"
          fullWidth
          className="mt-3"
          onClick={closeIosHelp}
        >
          닫기
        </Button>
      )}
    </Card>
  );
}
