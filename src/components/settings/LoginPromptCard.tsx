import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LoginPromptCard() {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-ink">클라우드 동기화</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
        로그인하면 다른 기기에서도 같은 항목·기록을 볼 수 있습니다. 로그인
        전에는 이 기기에만 데이터가 저장됩니다.
      </p>
      <Link href="/settings/login" className="mt-4 block">
        <Button fullWidth>이메일로 로그인</Button>
      </Link>
    </Card>
  );
}
