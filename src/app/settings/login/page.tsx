"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageLoading } from "@/components/ui/PageLoading";
import { useAuth } from "@/contexts/AuthContext";
import {
  EMAIL_OTP_DIGIT_LENGTH,
  sendEmailOtp,
  verifyEmailOtp,
} from "@/lib/supabase/emailAuth";
import { isCloudBackendReady, isWebAppFeaturesEnabled } from "@/lib/variant";

export default function SettingsLoginPage() {
  const router = useRouter();
  const { authReady, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
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

  const trimmedEmail = email.trim();
  const showPwaHint = isWebAppFeaturesEnabled();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await sendEmailOtp(trimmedEmail);
      setCodeSent(true);
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      await verifyEmailOtp(trimmedEmail, otp);
      router.replace("/settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      await sendEmailOtp(trimmedEmail);
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
          메일로 받은 {EMAIL_OTP_DIGIT_LENGTH}자리 인증 코드를 입력합니다.
          브라우저·홈 화면 앱 모두 같은 방식입니다.
        </p>
      </header>

      {showPwaHint && (
        <Card className="mb-4 border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-ink-muted">
          홈 화면 앱(iOS·Android)에서는 메일 <strong className="text-ink">링크</strong>
          가 브라우저에서 열릴 수 있어 로그인이 이어지지 않습니다. 메일의{" "}
          <strong className="text-ink">인증 코드</strong>를 아래에 입력해 주세요.
        </Card>
      )}

      {codeSent ? (
        <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
          <Card className="space-y-3 p-5 text-sm text-ink-muted">
            <p className="font-medium text-ink">인증 코드를 입력하세요</p>
            <p>
              <strong className="text-ink">{trimmedEmail}</strong>로{" "}
              {EMAIL_OTP_DIGIT_LENGTH}자리 코드를 보냈습니다. 메일함·스팸함을
              확인해 주세요.
            </p>
          </Card>
          <Input
            label="인증 코드"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={EMAIL_OTP_DIGIT_LENGTH}
            placeholder={"0".repeat(EMAIL_OTP_DIGIT_LENGTH)}
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, EMAIL_OTP_DIGIT_LENGTH)
              )
            }
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button
            type="submit"
            fullWidth
            disabled={verifying || otp.length < EMAIL_OTP_DIGIT_LENGTH}
          >
            {verifying ? "확인 중…" : "로그인"}
          </Button>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              disabled={sending}
              onClick={() => void handleResend()}
            >
              {sending ? "전송 중…" : "코드 다시 받기"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => {
                setCodeSent(false);
                setOtp("");
                setError(null);
              }}
            >
              다른 이메일로 받기
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={(e) => void handleSendCode(e)} className="space-y-4">
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
            {sending ? "전송 중…" : "인증 코드 받기"}
          </Button>
        </form>
      )}
    </div>
  );
}
