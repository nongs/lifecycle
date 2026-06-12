import { Card } from "@/components/ui/Card";
import { APP_VARIANT } from "@/lib/variant";

export function CloudSetupNotice() {
  return (
    <div className="flex min-h-dvh flex-col px-4 pt-10 pb-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          LifeCycle · Cloud
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Supabase 설정 필요</h1>
        <p className="page-header-sub mt-2">
          cloud 빌드는 Supabase 환경 변수가 있어야 앱이 실행됩니다.
        </p>
      </header>

      <Card className="space-y-4 p-5 text-sm text-ink-muted">
        <p>
          현재 variant:{" "}
          <strong className="text-ink">{APP_VARIANT}</strong>
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Supabase 프로젝트 생성</li>
          <li>
            SQL Editor에서{" "}
            <code className="rounded bg-accent-soft px-1.5 py-0.5 text-xs">
              supabase/schema.sql
            </code>{" "}
            실행
          </li>
          <li>
            <code className="rounded bg-accent-soft px-1.5 py-0.5 text-xs">
              .env.local
            </code>
            에{" "}
            <code className="rounded bg-accent-soft px-1 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            ·
            <code className="rounded bg-accent-soft px-1 text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            설정 후{" "}
            <code className="rounded bg-accent-soft px-1 text-xs">
              npm run dev:cloud
            </code>{" "}
            재시작
          </li>
        </ol>
        <p className="text-xs text-ink-faint">
          일상 사용·포트폴리오 데모는{" "}
          <strong className="text-ink-muted">demo</strong> 빌드(
          <code className="rounded bg-accent-soft px-1">npm run dev</code> /
          <code className="rounded bg-accent-soft px-1">build:demo</code>)를
          이용하세요.
        </p>
      </Card>
    </div>
  );
}
