# LifeCycle

**역방향 일정 관리** — 마지막으로 한 날을 기준으로, 반복 루틴이 언제 다시 필요한지 추적하는 웹 앱입니다.

할 일 목록이 아니라 **“마지막 수행일 + 목표 주기”** 로 이발, 주유, 필터 교체 같은 일상을 관리합니다. 자동차 소모품 관리 UX를 일상 전반으로 옮긴 컨셉의 포트폴리오 프로젝트입니다.

**예시 페이지 (라이브 데모):** [https://limgeonhong.com/lifecycle/](https://limgeonhong.com/lifecycle/)

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [사용법](#사용법)
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

- **요약:** 전체 기록 수, 비용 입력 기록 수, 이번 달 비용 합계
- **월별 비용:** `performedAt` 기준 월 합계(최근 12개월), 막대 비율 표시
- **항목별:** 목표 주기, **실제 평균 주기**(로그 2건 이상일 때 인접 수행 간격 평균), 누적 비용

### 이후 예정

- 로그인·마이페이지·멀티 디바이스 동기화
- 푸시 알림·PWA

---

## 기술 스택

| 구분 | 기술 |
| :--- | :--- |
| Framework | [Next.js](https://nextjs.org/) 15 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com/) 3 |
| 상태·데이터 | React Context, **브라우저 localStorage** (Mock API 계층) |
| 배포 | 정적 export → 개인 도메인 서브경로 |

### 개발 스펙 요약

- **Node.js** 18.18 이상 권장 (Next.js 15 요구사항 준수)
- **패키지 매니저:** npm
- **라우트:** `/` (대시보드), `/items` (항목 관리), `/stats` (통계)
- **인증:** 없음 (MVP는 `userId = 1` 고정, 고도화 시 Auth 연동 예정)
- **날짜 계산:** 일(day) 단위, **당일 0시(자정)** 기준
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
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.  
로컬 개발에는 배포용 `basePath`가 적용되지 않습니다.

### 정적 빌드 (배포용)

```bash
npm run build
```

빌드 결과는 **`out/`** 폴더에 생성됩니다. 아래 [배포](#배포-정적-빌드) 절을 참고하세요.

### 기타 스크립트

| 명령 | 설명 |
| :--- | :--- |
| `npm run dev` | 개발 서버 (핫 리로드) |
| `npm run build` | 정적 export 빌드 → `out/` |
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

---

## 프로젝트 구조

```
lifecycle/
├── markdown/                 # 기획·개발 명세 문서
│   ├── LifeCycle_Project_Plan.md
│   ├── LifeCycle_Development_Plan.md
│   ├── LifeCycle_Screen_Plan.md
│   └── LifeCycle_MVP_Checklist.md
├── src/
│   ├── app/                  # Next.js App Router 페이지
│   │   ├── page.tsx          # 대시보드
│   │   ├── items/page.tsx    # 항목 관리
│   │   └── stats/page.tsx    # 통계
│   ├── components/           # UI 컴포넌트·모달
│   ├── contexts/             # DataProvider (전역 데이터)
│   ├── hooks/
│   └── lib/
│       ├── api/              # localStorage Mock API
│       ├── utils/            # 날짜·주기·대시보드·통계 등
│       ├── types.ts
│       └── seed.ts           # 카테고리 시드
├── package.json
└── README.md
```

---

## 데이터 저장

MVP는 **서버·DB 없이** 브라우저 `localStorage`에 저장합니다.

| 키 | 내용 |
| :--- | :--- |
| `lifecycle:categories` | 카테고리 |
| `lifecycle:items` | 관리 항목 |
| `lifecycle:logs` | 수행 기록 |

- 컴포넌트는 `src/lib/api/apiService.ts` 인터페이스만 사용합니다.  
- 고도화 시 Supabase/PostgreSQL 등으로 **API 구현만 교체**하는 구조입니다.
- 브라우저 데이터를 지우면 저장 내용도 초기화됩니다. 시드 카테고리는 다시 생성됩니다.

---

## 배포 (정적 빌드)

정적 HTML을 웹 서버에 올리는 방식입니다. 로컬 개발 URL과 별도로, **배포 빌드**(`npm run build`)에만 아래에서 정한 서브경로가 붙습니다.

### 배포 경로(`basePath`) 변경 방법

`next.config.ts` 상단의 **`DEPLOY_BASE_PATH`** 값을 수정한 뒤 다시 빌드합니다.

```ts
/** 배포 시 URL 서브경로 (로컬 npm run dev에는 미적용) */
const DEPLOY_BASE_PATH = "/lifecycle";
```

| 설정값 | 배포 URL 예시 | 서버 업로드 위치 |
| :--- | :--- | :--- |
| `"/lifecycle"` | `https://도메인/lifecycle/` | 웹 루트 아래 `lifecycle/` 폴더 |
| `""` (빈 문자열) | `https://도메인/` (루트) | 웹 루트 |

- `DEPLOY_BASE_PATH`를 바꾼 후에는 **반드시** `npm run build`를 다시 실행해야 합니다.
- `out/` 안의 JS·CSS·내부 링크가 모두 이 경로 기준으로 생성됩니다.
- 로컬 `npm run dev`는 항상 [http://localhost:3000](http://localhost:3000) (경로 없음).

### 빌드 및 업로드

1. 경로를 확인·수정합니다 (`next.config.ts` → `DEPLOY_BASE_PATH`).

2. 빌드합니다.

   ```bash
   npm run build
   ```

3. **`out/`** 폴더 **안의 모든 파일·폴더**를 서버의 **같은 경로**에 업로드합니다.  
   예: `DEPLOY_BASE_PATH`가 `"/lifecycle"`이면 → 서버 `.../lifecycle/index.html`, `.../lifecycle/_next/`, …

4. 웹 서버에서 해당 경로가 그 디렉터리를 가리키도록 설정합니다 (Apache/Nginx alias 등).

> **참고:** 데이터는 브라우저 **localStorage**에만 저장됩니다. 기기·브라이저마다 다르며, 서버에는 올라가지 않습니다.

---

## 로드맵

| 단계 | 내용 | 상태 |
| :---: | :--- | :---: |
| 1 | MVP — 대시보드·항목·카테고리·로그·localStorage | ✅ |
| 2 | 통계 — 평균 주기, 비용 집계 (`/stats`) | ✅ |
| 3 | 고도화 — Auth, 클라우드 DB, 알림, PWA, 마이페이지 | 예정 |

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
