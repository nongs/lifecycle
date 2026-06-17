# LifeCycle

**역방향 일정 관리** — 마지막으로 한 날을 기준으로, 반복 루틴이 언제 다시 필요한지 추적하는 웹 앱입니다.

할 일 목록이 아니라 **“마지막 수행일 + 목표 주기”** 로 이발, 주유, 필터 교체 같은 일상을 관리합니다. 자동차 소모품 관리 UX를 일상 전반으로 옮긴 컨셉의 포트폴리오 프로젝트입니다.

| 빌드 | 설명 | 예시 URL |
| :--- | :--- | :--- |
| **demo** | localStorage, 포트폴리오 데모 | [limgeonhong.com/lifecycle/](https://limgeonhong.com/lifecycle/) |
| **cloud** (web) | Supabase·이메일 OTP 로그인 | [limgeonhong.com/lifecycle/](https://limgeonhong.com/lifecycle/) |
| **webapp:cloud** (PWA) | cloud + 설치형 앱·오프라인·리마인더 | [limgeonhong.com/lifecycle-pwa/](https://limgeonhong.com/lifecycle-pwa/) |

동일 UI·코드베이스, **빌드 시점 env**로 데이터·셸만 분기합니다.

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [사용법](#사용법)
- [클라우드 로그인](#클라우드-로그인)
- [프로젝트 구조](#프로젝트-구조)
- [데이터 저장](#데이터-저장)
- [배포 (정적 빌드)](#배포-정적-빌드)
- [로드맵](#로드맵)
- [관련 문서](#관련-문서)
- [라이선스](#라이선스)

---

## 주요 기능

### 대시보드 (`/`)

- **이번 달 일정** 요약 — 아직 이번 달에 처리하지 않은 항목 수
- 활성 항목을 **지연 → 임박 → 여유** 순으로 1단 목록 표시
- 신호등(지연/임박/여유) + 진행바 + 경과·잔여 일수
- 카테고리는 **라벨**로만 표시 (항목명 위)
- **[완료]** 로 수행 로그 추가 (날짜·메모·선택적 비용)

### 항목 관리 (`/items`)

- 항목 추가·수정·아카이브·영구 삭제
- 카테고리별 필터 (가로 스크롤 chip)
- 카테고리 편집 (추가·수정·삭제·순서 변경)
- 항목 상세 — 로그 목록·수정·삭제
- 필터된 카테고리에 항목이 없을 때 **전용 empty UI** + 전체 보기

### 통계 (`/stats`)

- **비용:** 요약, 월별 비용(최근 12개월), 항목별 누적·실제 평균 주기
- **활동:** 수행 기록 기준 월간 활동 캘린더

### 설정 (`/settings`) · cloud

- **이메일 OTP 로그인** (8자리, 웹·PWA 동일) — 계정·로그아웃
- 로그인 직후 로컬 → 클라우드 **1회 마이그레이션** 제안
- 데이터 JSON **보내기/가져오기**
- (webapp) 푸시 알림·리마인더 시각·홈 화면 추가

### PWA (`build:webapp:cloud` → `/lifecycle-pwa`)

- manifest·Service Worker·오프라인 셸
- 세션 복구·오프라인 배너
- 임박·지연 항목 **브라우저 리마인더** (앱 활성 시)

### 이후 예정

- Web Push (서버·백그라운드 발송)

---

## 기술 스택

| 구분 | 기술 |
| :--- | :--- |
| Framework | [Next.js](https://nextjs.org/) 15 (App Router), **정적 export** |
| Language | TypeScript 5 |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com/) 3 |
| 데이터 (demo) | React Context, `localStorage` |
| 데이터 (cloud) | [Supabase](https://supabase.com/) (PostgreSQL + RLS, 브라우저 SDK) |
| 인증 (cloud) | Supabase Auth — **이메일 OTP** (Resend SMTP) |
| PWA | manifest, Service Worker, Notification API |
| 배포 | 정적 `out/` → 개인 도메인 서브경로 |

### 개발 스펙 요약

- **Node.js** 18.18 이상 권장
- **패키지 매니저:** npm
- **라우트:** `/`, `/items`, `/stats`, `/settings`, `/settings/login`
- **인증:** cloud 빌드만 — 미로그인 시 localStorage, 로그인 시 Supabase
- **날짜 계산:** 일(day) 단위, 당일 0시(자정) 기준
- **주기 저장:** 내부 `targetCycleDays`(일), UI는 년/개월/주/일 입력

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm

### 설치

```bash
git clone <repository-url>
cd lifecycle
npm install
```

### 개발 서버

```bash
npm run dev                 # demo — localStorage
npm run dev:cloud           # cloud — Supabase (.env.local 필요)
npm run dev:webapp:cloud    # PWA cloud — 동일 OTP 로그인 + manifest/SW
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.  
로컬 개발에는 배포용 `basePath`가 적용되지 않습니다.

cloud / webapp:cloud 개발 시 `.env.local` 예시:

```bash
NEXT_PUBLIC_APP_VARIANT=cloud
NEXT_PUBLIC_SHELL_VARIANT=webapp   # dev:webapp:cloud 만
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 정적 빌드 (배포용)

```bash
npm run build:demo           # → /lifecycle (데모)
npm run build:cloud          # → /lifecycle (클라우드 웹)
npm run build:webapp:cloud   # → /lifecycle-pwa (PWA)
```

`npm run build`는 `build:demo`와 동일합니다. 결과는 **`out/`** 에 생성됩니다.

### 환경 변수 (dev / build)

| 용도 | 파일 | 커밋 |
| :--- | :--- | :---: |
| 로컬 개발 | `.env.local` | ✗ |
| demo 빌드 | `.env.build.demo` | ✓ |
| cloud 빌드 | `.env.build.cloud` + `.env.build.cloud.secrets.local` | ✓ / ✗ |
| PWA 빌드 | `.env.build.webapp.cloud` + secrets.local (공유) | ✓ / ✗ |

cloud 빌드 secrets 최초 설정:

```bash
cp .env.build.cloud.secrets.example .env.build.cloud.secrets.local
# .env.local 과 동일한 Supabase URL·anon key 입력
```

빌드 스크립트는 `dotenv-cli`로 위 파일을 읽습니다. variant·`DEPLOY_BASE_PATH`는 각 `.env.build.*`에, Supabase 키는 secrets.local에만 둡니다.

### 빌드 variant (2축)

| 축 | 값 | 역할 |
| :--- | :--- | :--- |
| **데이터** | `demo` / `cloud` | localStorage vs Supabase (`NEXT_PUBLIC_DATA_VARIANT` 또는 `APP_VARIANT`) |
| **셸** | `web` / `webapp` | 브라우저 vs PWA (`NEXT_PUBLIC_SHELL_VARIANT`, C단계) |

현재 스크립트: **demo / cloud / webapp:cloud** 3종.

| 스크립트 | 데이터 | 셸 | `DEPLOY_BASE_PATH` |
| :--- | :--- | :--- | :--- |
| `build:demo` | demo | web | `/lifecycle` |
| `build:cloud` | cloud | web | `/lifecycle` |
| `build:webapp:cloud` | cloud | webapp | `/lifecycle-pwa` |

상세: [로드맵](./markdown/LifeCycle_Design_And_Fullstack_Roadmap.md)

### 기타 스크립트

| 명령 | 설명 |
| :--- | :--- |
| `npm run dev` | demo 개발 서버 |
| `npm run dev:cloud` | cloud 개발 서버 |
| `npm run dev:webapp:cloud` | PWA cloud 개발 서버 |
| `npm run build:demo` | demo 정적 export → `out/` |
| `npm run build:cloud` | cloud 정적 export → `out/` |
| `npm run build:webapp:cloud` | PWA cloud export → `out/` |
| `npm run lint` | ESLint 검사 |

---

## 사용법

### 처음 사용할 때

1. **항목 관리** 탭으로 이동합니다.
2. **[+ 항목 추가]** 로 관리할 항목(예: 이발, 주유)을 등록합니다.  
   - 카테고리: 그루밍·모빌리티·리빙·소비 등 (최초 실행 시 시드 데이터 제공)  
   - 목표 주기: 예) 4주, 3개월
3. **대시보드**로 돌아가 항목별 **[완료]** 로 수행을 기록합니다.

### 대시보드

- 상단 **이번 달 일정 N건** — 이번 달에 아직 기록하지 않은, 처리가 필요한 항목 수입니다.
- **[완료]** — 수행일(기본 오늘), 메모, 필요 시 **비용 입력** 체크 후 금액을 넣을 수 있습니다.
- 항목이 없으면 **항목 관리로 이동** 안내가 표시됩니다.

### 항목 관리

- **카테고리 편집** (우측 상단): 카테고리 CRUD 및 표시 순서(▲▼) 변경.
- **카테고리 chip**: `전체` 또는 특정 카테고리만 목록 필터.
- **정렬**: 생성일 최신순 (고정).
- **[상세]**: 로그 타임라인, 기록 추가·수정·삭제, 항목 수정·아카이브.
- **⋮ 메뉴**: 수정, 기록 추가, 아카이브.
- **아카이브** 섹션: 복구 또는 영구 삭제.

### 통계

- 하단 **통계** 탭에서 월별·항목별 비용과 실제 평균 주기를 확인합니다.
- **실제 평균 주기**는 같은 항목에 수행 기록이 **2건 이상**일 때만 계산됩니다.
- 비용은 완료(로그) 입력 시 **비용 입력**을 켠 기록만 집계됩니다.

### 상태 표시 (신호등)

| 상태 | 의미 |
| :--- | :--- |
| **여유** (녹색) | 목표 주기의 80% 미만 경과 |
| **임박** (황색) | 80% 이상 ~ 100% 미만 |
| **지연** (적색) | 목표 주기 초과 |
| **기록 없음** | 아직 수행 로그 없음 |
| **오늘 수행함** | 당일 기록 완료 |

색상만으로 정보를 전달하지 않도록 텍스트 라벨을 함께 표시합니다.

### 설정 · cloud (`/settings`)

- **미로그인:** 클라우드 동기화 안내 → [인증 코드로 로그인](/settings/login)
- **로그인 후:** 계정 이메일, 데이터 모드(로컬 캐시/클라우드), 로그아웃
- **데이터 I/O:** JSON 보내기·가져오기 (백업·이전)
- **PWA(webapp):** 홈 화면 추가, 푸시·리마인더 설정

---

## 클라우드 로그인

**웹(`/lifecycle`)과 PWA(`/lifecycle-pwa`) 모두 동일한 이메일 OTP** 를 사용합니다.

1. **설정** → **인증 코드로 로그인**
2. 이메일 입력 → **인증 코드 받기**
3. 메일의 **8자리 코드** 입력 → 로그인

### 왜 OTP인가?

- iOS 홈 화면 앱은 Safari와 **storage가 분리**되어, 메일 **링크**(Magic Link)로는 PWA에 세션이 전달되지 않습니다.
- OTP는 앱·브라우저 안에서 코드만 입력하면 되므로 **웹·PWA 공통**으로 사용합니다.

### Supabase·메일 설정 (운영)

| 항목 | 내용 |
| :--- | :--- |
| DB | `supabase/schema.sql` 실행 |
| SMTP | Resend 등 Custom SMTP (템플릿 편집에 필요) |
| Email template | Magic Link 템플릿에 `{{ .Token }}` 포함 |
| Redirect URLs | OTP만 쓸 경우 필수 아님 (OAuth·링크 대비 시 등록) |

체크리스트: [LifeCycle_Ops_Checklist.md](./markdown/LifeCycle_Ops_Checklist.md)  
세션 정책: [LifeCycle_Auth_Session.md](./markdown/LifeCycle_Auth_Session.md)

---

## 프로젝트 구조

```
lifecycle/
├── markdown/                 # 기획·로드맵·운영 체크리스트
├── supabase/
│   └── schema.sql            # cloud DB + RLS
├── public/
│   ├── sw.js                 # PWA Service Worker
│   └── icons/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 대시보드
│   │   ├── items/            # 항목 관리
│   │   ├── stats/            # 통계·활동 캘린더
│   │   ├── settings/         # 설정·로그인
│   │   └── manifest.ts       # PWA manifest (webapp 빌드)
│   ├── components/
│   │   ├── shell/            # PWA·오프라인·리마인더
│   │   └── settings/
│   ├── contexts/             # Auth, Data
│   └── lib/
│       ├── api/              # IDataService · demo/cloud 분기
│       ├── supabase/         # client, emailAuth (OTP)
│       ├── data/             # 동기화·I/O·마이그레이션
│       └── notifications/    # 리마인더
├── .env.build.*              # 빌드 variant
└── package.json
```

---

## 데이터 저장

### demo 빌드

브라우저 **localStorage**만 사용합니다 (서버·DB 없음).

| 키 | 내용 |
| :--- | :--- |
| `lifecycle:categories` | 카테고리 |
| `lifecycle:items` | 관리 항목 |
| `lifecycle:logs` | 수행 기록 |

### cloud 빌드

| 상태 | 저장소 |
| :--- | :--- |
| **미로그인** | localStorage (이 기기만) |
| **로그인** | Supabase (RLS) + 오프라인용 local 캐시 |
| **로그아웃** | 클라우드 스냅샷 → local 후 세션 종료 |

- 컴포넌트는 `@/lib/api`만 import — 구현체는 빌드·로그인 상태로 자동 분기
- 브라우저 데이터 삭제 시 local 내용 초기화 (cloud는 재로그인 후 동기화)

---

## 배포 (정적 빌드)

정적 HTML을 웹 서버에 올리는 방식입니다. 로컬 개발 URL과 별도로, **배포 빌드**(`npm run build`)에만 아래에서 정한 서브경로가 붙습니다.

### 배포 경로(`basePath`) 변경 방법

빌드 스크립트의 **`DEPLOY_BASE_PATH`** 또는 `next.config.ts` 기본값을 수정합니다.

| 빌드 명령 | variant | 기본 경로 | 업로드 예 |
| :--- | :--- | :--- | :--- |
| `npm run build:demo` | demo | `/lifecycle` | `.../lifecycle/` |
| `npm run build:cloud` | cloud | `/lifecycle` | `.../lifecycle/` |
| `npm run build:webapp:cloud` | cloud + PWA | `/lifecycle-pwa` | `.../lifecycle-pwa/` |

커스텀 예:

```bash
DEPLOY_BASE_PATH=/my-path npm run build:demo
```

| 설정값 | 배포 URL 예시 | 서버 업로드 위치 |
| :--- | :--- | :--- |
| `"/lifecycle"` | `https://도메인/lifecycle/` | `lifecycle/` |
| `"/lifecycle"` | `https://도메인/lifecycle/` | `lifecycle/` |
| `""` | `https://도메인/` | 웹 루트 |

### 빌드 및 업로드

1. 용도에 맞게 `build:demo` / `build:cloud` / `build:webapp:cloud` 실행

2. **`out/`** 내용을 서버 **동일 경로**에 업로드.

3. 웹 서버에서 해당 경로로 정적 파일 서빙

cloud·PWA는 빌드 전 `.env.build.cloud.secrets.local`에 Supabase 키가 있어야 합니다.

> **demo:** localStorage만. **cloud:** 로그인 후 Supabase 저장.

---

## 로드맵

| 단계 | 내용 | 상태 |
| :---: | :--- | :---: |
| 1 | MVP — 대시보드·항목·카테고리·로그·localStorage | ✅ |
| 2 | 통계 — 평균 주기, 비용 집계 (`/stats`) | ✅ |
| A-1 | 디자인 마무리 (토큰·UI·Empty·모바일 QA) | ✅ |
| A-2 | **demo/cloud** 데이터 분기 | ✅ |
| B | Auth·Supabase·설정·동기화 | ✅ |
| C | **web / webapp** PWA·리마인더·OTP 로그인 | ✅ (Web Push 후순위) |
| — | OAuth, Realtime 동기화 | 예정 |

상세 단계·체크리스트: [LifeCycle_Design_And_Fullstack_Roadmap.md](./markdown/LifeCycle_Design_And_Fullstack_Roadmap.md)

---

## 관련 문서

저장소 내 `markdown/` 폴더에서 상세 기획·명세를 확인할 수 있습니다.

| 문서 | 설명 |
| :--- | :--- |
| [LifeCycle_Project_Plan.md](./markdown/LifeCycle_Project_Plan.md) | 서비스 기획·요구사항·DB 설계 |
| [LifeCycle_Development_Plan.md](./markdown/LifeCycle_Development_Plan.md) | 기술 스택·타입·Mock API·유틸 |
| [LifeCycle_Screen_Plan.md](./markdown/LifeCycle_Screen_Plan.md) | 화면·플로우·IA |
| [LifeCycle_MVP_Checklist.md](./markdown/LifeCycle_MVP_Checklist.md) | MVP 구현 체크리스트 |
| [LifeCycle_Stats_Plan.md](./markdown/LifeCycle_Stats_Plan.md) | 통계 화면·집계 규칙 |
| [LifeCycle_Design_And_Fullstack_Roadmap.md](./markdown/LifeCycle_Design_And_Fullstack_Roadmap.md) | 디자인 · demo/cloud · PWA 로드맵 |
| [LifeCycle_Ops_Checklist.md](./markdown/LifeCycle_Ops_Checklist.md) | Supabase SMTP·배포·검증 체크리스트 |
| [LifeCycle_Auth_Session.md](./markdown/LifeCycle_Auth_Session.md) | 로그인 세션·PWA 정책 |
| [LifeCycle_Cloud_Data_Sync.md](./markdown/LifeCycle_Cloud_Data_Sync.md) | 로컬↔클라우드 동기화 |

### 참고·영감

- **역방향 일정 관리:** 캘린더/할 일 앱과 달리 “다음 예정일”이 아닌 “마지막 수행일 + 주기” 중심 UX
- **자동차 정비·소모품 주기 관리** 앱에서 확장한 컨셉

---

## 라이선스

본 프로젝트는 포트폴리오용 **개인 프로젝트**입니다.  
저장소 공개 시 라이선스는 저장소 설정에 따릅니다. 별도 명시가 없으면 무단 상업적 재배포를 금합니다.

---

## 문의

이슈·개선 제안은 GitHub Issues 또는 저장소 관리자에게 연락해 주세요.
