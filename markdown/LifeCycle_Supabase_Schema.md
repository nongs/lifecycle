# LifeCycle — Supabase 스키마 (B-1)

## 테이블

| 테이블 | 설명 |
|--------|------|
| `categories` | 항목 분류 (그루밍, 모빌리티 등) |
| `management_items` | 관리 대상 (주기·카테고리·상태) |
| `activity_logs` | 수행 기록 (날짜·비용·메모) |

모든 행은 `user_id uuid` → `auth.users(id)` FK. RLS로 `auth.uid() = user_id`만 접근.

## 적용 방법

1. Supabase Dashboard → **SQL Editor**
2. [`supabase/schema.sql`](../supabase/schema.sql) 내용 붙여넣기 후 실행
3. **Project Settings → API** 에서 URL·anon key 복사 → `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. `npm run dev:cloud` 로 로컬 확인

## 앱 매핑

- DB `user_id` (uuid) ↔ 앱 `userId: number` 는 읽기 시 `MASTER_USER_ID(1)` 로 통일 (B-2 Auth 전 호환)
- ID는 uuid 문자열 그대로 사용

## 데이터 소스 (cloud 빌드)

| 상태 | 저장소 |
|------|--------|
| 미로그인 | 브라우저 `localStorage` (demo와 동일 UX) |
| 로그인 | Supabase (RLS) — **진실** |
| 로그아웃 | 클라우드 → local 스냅샷 후 세션 종료 |

상세: [`LifeCycle_Cloud_Data_Sync.md`](./LifeCycle_Cloud_Data_Sync.md)

## 시드

로그인 후 cloud DB에 카테고리가 없으면 demo와 동일한 `SEED_CATEGORIES` 4개 자동 삽입.

## B-2

- 이메일 magic link 또는 OAuth 로그인
- `/my` — 프로필·로그아웃·(선택) 로컬 → cloud 마이그레이션
