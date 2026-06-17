# LifeCycle — 운영·배포 체크리스트

배포 전·풀스택 전환 시 확인할 항목. 코드 구현과 별도로 **Supabase Dashboard / SMTP 콘솔**에서 설정.

---

## Supabase Auth

| 항목 | 상태 | 비고 |
|------|------|------|
| `schema.sql` 실행 | | categories / items / logs + RLS |
| Redirect URLs | | `{origin}{basePath}/settings/login` (로컬·프로덕션 각각) |
| Email provider ON | | 이메일 OTP (8자리, Supabase 기본) |
| **Email template** | | Magic Link 템플릿에 `{{ .Token }}` 포함 (PWA·iOS 필수) |
| **Custom SMTP** | ☐ 나중 | Resend / SendGrid 등. 기본 SMTP는 **시간당 2~4통** 한도 → `email rate limit exceeded` |
| Rate Limits 조정 | ☐ SMTP 후 | Authentication → Rate Limits |
| **Session timebox** | ☐ 끔 권장 | 켜면 최대 로그인 기간 제한 — [Auth Session](./LifeCycle_Auth_Session.md) |
| **Inactivity timeout** | ☐ 끔 권장 | 켜면 미사용 N일 후 만료 — PWA는 로그아웃 전 유지 목표 |
| JWT expiry | 기본 1h | access token; 클라이언트 auto-refresh |

### SMTP 연결 시 (추후)

1. Dashboard → **Authentication → SMTP**
2. 발송 도메인 SPF/DKIM 설정 (Resend 등 가이드 따름)
3. Rate Limits에서 `email` 한도 상향
4. **Authentication → Templates → Magic Link** — 본문에 `{{ .Token }}` (8자리 코드) 포함. iOS PWA는 링크만으로는 로그인 불가.
5. (선택) 템플릿 문구·브랜딩

참고: [Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

---

## OAuth (추후)

| 항목 | 상태 |
|------|------|
| Google / GitHub provider | ☐ B-2 이후 |
| Redirect URLs (OAuth) | ☐ |

---

## 배포

| 빌드 | env 파일 | 경로 예 |
|------|----------|---------|
| `build:demo` | `.env.build.demo` | `/lifecycle` |
| `build:cloud` | `.env.build.cloud` + `.env.build.cloud.secrets.local` | `/lifecycle` |
| `build:webapp:cloud` | `.env.build.webapp.cloud` + secrets.local | `/lifecycle-pwa` |

secrets.local 없으면 cloud 빌드 시 Supabase 키가 비어 있습니다.  
`cp .env.build.cloud.secrets.example .env.build.cloud.secrets.local` 후 값 입력.

---

## 검증 완료 (로컬)

- [x] 이메일 OTP 로그인 (웹·PWA)
- [x] 데이터 가져오기 / 클라우드 업로드
- [ ] SMTP (프로덕션 메일량 필요 시)
- [x] PWA 빌드·SW·manifest (로컬 `build:webapp:cloud` 검증)
- [ ] PWA 설치·오프라인 실기기 QA (`/lifecycle-pwa` 배포 후)
