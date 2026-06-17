# LifeCycle — 로그인 세션 유지 정책

## 원칙

**로그아웃을 누르기 전까지 로그인은 유지되는 것이 맞다.**

- 웹·PWA 모두 동일: 사용자가 명시적으로 로그아웃하지 않으면 클라우드 동기화 계정이 풀리면 안 됨
- 로그인은 **이메일 OTP(8자리)** — 앱 안에서 코드 입력 (iOS PWA는 Safari와 storage 분리로 메일 링크 불가)
- OTP·링크 만료(약 1시간) ≠ 로그인 세션 만료

---

## 현재 구현 (B-2)

| 항목 | 상태 |
|------|------|
| 세션 저장 | Supabase JS 기본 → **localStorage** (`persistSession`) |
| 토큰 갱신 | **autoRefreshToken** (access JWT 만료 전 자동 refresh) |
| 앱 재실행 | 같은 브라우저/PWA면 세션 복원 |
| 로그아웃 | 설정 → 스냅샷 후 `signOut()` 만 세션 종료 |
| 코드 위치 | `src/lib/supabase/client.ts`, `AuthContext.tsx` |

앱 코드에 **별도 세션 타임아웃은 없음**. Supabase 프로젝트 설정이 상한을 정함.

---

## Supabase Dashboard (운영 시 확인)

| 설정 | 권장 (LifeCycle) | 비고 |
|------|------------------|------|
| JWT expiry | 기본 **3600초(1h)** 유지 | access token; SDK가 자동 갱신 |
| Session timebox | **끔** 또는 매우 길게 | 켜면 최대 로그인 기간 제한 |
| Inactivity timeout | **끔** | 켜면 N일 미사용 시 만료 |
| Single session per user | **끔** (기본) | 켜면 다른 기기 로그인 시 기존 세션 끊김 |

→ [LifeCycle_Ops_Checklist.md](./LifeCycle_Ops_Checklist.md) 에 체크 항목 추가

---

## PWA(webapp) — 보완 체크리스트 (C-1 반영)

### 높은 우선순위

- [x] **앱 복귀 시 세션 재확인** — `visibilitychange` / `focus`, `PwaLifecycle`
- [x] **TOKEN_REFRESHED 실패 처리** — `needsReauth` + `SessionRecoveryBanner` / 설정 카드
- [x] **오프라인 후 재접속** — `PwaLifecycle` + `OfflineBanner`
- [x] **iOS PWA 로그인** — Magic Link 대신 이메일 OTP (`emailAuth.ts`)
- [ ] **iOS PWA localStorage** — 장기 미사용 시 OS가 storage 정리할 수 있음 → 재로그인 UX 필요 (플랫폼 한계)

### 중간 우선순위

- [ ] `storageKey` 고정 (`lifecycle-auth`) — 도메인·basePath 변경 시에도 동일 키 (필요 시)
- [ ] 다중 탭: `onAuthStateChange` 로 로그아웃 동기화 (Supabase 기본 동작, QA만)
- [ ] `getSession()` vs `getUser()` — 민감 API 전 `getUser()` 검증 (서버 없는 static export 에서는 제한적)

### 낮은 우선순위 / 선택

- [ ] Session timebox를 Supabase에서 **의도적으로** 켤지 (보안 vs 편의 트레이드오프)
- [ ] 생체 인증·앱 잠금 (네이티브 래핑 시)
- [ ] Refresh token rotation 실패 시 재로그인 모달

---

## 의도적으로 하지 않는 것

- N일 무활동 **자동 로그아웃** (앱 코드) — 정책상 로그아웃은 사용자만
- 세션 만료 시 **조용히 local 모드** — 풀리면 설정에서 로그인 유도가 낫음

---

## 관련 문서

- [LifeCycle_Cloud_Data_Sync.md](./LifeCycle_Cloud_Data_Sync.md) — 로그아웃 시 스냅샷
- [LifeCycle_Ops_Checklist.md](./LifeCycle_Ops_Checklist.md) — SMTP·세션 Dashboard 설정
