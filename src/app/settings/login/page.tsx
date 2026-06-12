"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageLoading } from "@/components/ui/PageLoading";
import { useAuth } from "@/contexts/AuthContext";
import { sendMagicLink } from "@/lib/supabase/magicLink";
import { getAuthRedirectUrl } from "@/lib/appUrl";
import { isCloudBackendReady } from "@/lib/variant";

export default function SettingsLoginPage() {
  const router = useRouter();
  const { authReady, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    router.replace("/settings");
  }, [authReady, isAuthenticated, router]);

  if (!isCloudBackendReady()) {
    return (
      <div className="px-4 pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-ink">로그인</h1>
        </header>
        <Card className="p-5 text-sm text-ink-muted">
          클라우드 로그인은 cloud 빌드와 Supabase 설정이 필요합니다.
        </Card>
        <Link href="/settings" className="mt-4 inline-block text-sm text-primary">
          설정으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!authReady || isAuthenticated) {
    return <PageLoading />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <Link
          href="/settings"
          className="text-sm text-ink-faint transition-colors hover:text-ink-muted"
        >
          ← 설정
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-ink">이메일 로그인</h1>
        <p className="page-header-sub">
          Magic Link로 비밀번호 없이 로그인합니다.
        </p>
      </header>

      {sent ? (
        <Card className="space-y-3 p-5 text-sm text-ink-muted">
          <p className="font-medium text-ink">메일을 확인해 주세요</p>
          <p>
            <strong className="text-ink">{email.trim()}</strong>로 로그인
            링크를 보냈습니다. 메일의 링크를 누르면 이 앱으로 돌아옵니다.
          </p>
          <p className="text-xs text-ink-faint">
            링크가 동작하지 않으면 Supabase 대시보드 Redirect URLs에{" "}
            <code className="break-all rounded bg-accent-soft px-1">
              {getAuthRedirectUrl()}
            </code>
            가 등록되어 있는지 확인하세요.
          </p>
          <Button
            variant="secondary"
            fullWidth
            className="mt-2"
            onClick={() => setSent(false)}
          >
            다른 이메일로 받기
          </Button>
        </Card>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" fullWidth disabled={sending}>
            {sending ? "전송 중…" : "로그인 링크 받기"}
          </Button>
        </form>
      )}
    </div>
  );
}
