import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LoginPromptCard() {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-ink">클라우드 동기화</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
        로그인하면 다른 기기에서도 같은 항목·기록을 볼 수 있습니다. 메일로 받은
        8자리 인증 코드를 입력합니다 (웹·PWA 동일).
      </p>
      <Link href="/settings/login" className="mt-4 block">
        <Button fullWidth>인증 코드로 로그인</Button>
      </Link>
    </Card>
  );
}
