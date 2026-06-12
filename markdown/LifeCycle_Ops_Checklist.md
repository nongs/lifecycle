# LifeCycle — 운영·배포 체크리스트

배포 전·풀스택 전환 시 확인할 항목. 코드 구현과 별도로 **Supabase Dashboard / SMTP 콘솔**에서 설정.

---

## Supabase Auth

| 항목 | 상태 | 비고 |
|------|------|------|
| `schema.sql` 실행 | | categories / items / logs + RLS |
| Redirect URLs | | `{origin}{basePath}/settings/login` (로컬·프로덕션 각각) |
| Email provider ON | | Magic Link |
| **Custom SMTP** | ☐ 나중 | Resend / SendGrid 등. 기본 SMTP는 **시간당 2~4통** 한도 → `email rate limit exceeded` |
| Rate Limits 조정 | ☐ SMTP 후 | Authentication → Rate Limits |

### SMTP 연결 시 (추후)

1. Dashboard → **Authentication → SMTP**
2. 발송 도메인 SPF/DKIM 설정 (Resend 등 가이드 따름)
3. Rate Limits에서 `email` 한도 상향
4. (선택) **Authentication → Templates** — Magic Link 메일 문구·브랜딩

참고: [Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

---

## OAuth (추후)

| 항목 | 상태 |
|------|------|
| Google / GitHub provider | ☐ B-2 이후 |
| Redirect URLs (OAuth) | ☐ |

---

## 배포

| 빌드 | 경로 예 | 용도 |
|------|---------|------|
| `build:demo` | `/lifecycle` | 포트폴리오 데모 |
| `build:cloud` | `/lifecycle-app` | 풀스택 브라우저 |
| `build:webapp:cloud` | `/lifecycle-pwa` | PWA (C-1) |

---

## 검증 완료 (로컬)

- [x] Magic Link 로그인
- [x] 데이터 가져오기 / 클라우드 업로드
- [ ] SMTP (프로덕션 메일량 필요 시)
- [ ] PWA 설치·오프라인 (C-1)
