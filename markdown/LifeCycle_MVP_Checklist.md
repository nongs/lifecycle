# LifeCycle MVP 구현 체크리스트

> 기준: `LifeCycle_Screen_Plan.md`, `LifeCycle_Development_Plan.md`

---

## A. 인프라·데이터 계층

- [x] Next.js 14+ App Router, TypeScript, Tailwind 프로젝트 초기화
- [x] 타입: `Category`, `ManagementItem`, `ActivityLog`, `ItemStatus`
- [x] `MASTER_USER_ID`, localStorage 키 (`lifecycle:categories|items|logs`)
- [x] Mock API: Category / Item / Log CRUD + `reorderCategories`
- [x] 카테고리 시드 (그루밍·모빌리티·리빙·소비)
- [x] 유틸: `getDaysSince`, `getLastPerformedAt`, `cycleToDays`, 상태(지연/임박/여유)
- [x] 유틸: `sortDashboardItems`, `countMonthlyPending`
- [x] 데이터 Provider (클라이언트 hydration + refresh)

---

## B. 공통 UI

- [x] 앱 레이아웃 + 하단 네비 (대시보드 / 항목 관리 / 통계)
- [x] 모달 / 풀모달 래퍼 (ESC 닫기)
- [x] 확인 모달 L-06
- [x] 신호등 + 진행바 + 상태 텍스트 (색상만 의존 X)

---

## C. S-01 대시보드 (`/`)

- [x] 요약 패널: 이번 달 미처리 N건
- [x] 활성 항목 1단 목록, 정렬 지연 → 임박 → 여유
- [x] 카드: 이름, 카테고리 라벨, 진행바, 경과/잔여, [완료]
- [x] 로그 없음 / 오늘 수행 / 지연 UI 분기
- [x] L-01 완료(로그) 모달 — 날짜·메모·비용 체크박스
- [x] Empty: 항목 0개 → 항목 관리 링크
- [x] 항목 추가·카테고리 편집 진입점 없음

---

## D. S-02 항목 관리 (`/items`)

- [x] 헤더 + [＋ 항목]
- [x] 카테고리 chip 필터 + [카테고리 편집]
- [x] 정렬: 생성일 (최신순 기본)
- [x] 항목 행: [상세] [⋮] — L-02, L-03, 아카이브, 삭제
- [x] L-02 항목 추가·수정 풀모달
- [x] L-03 항목 상세·로그 풀모달
- [x] L-04 카테고리 편집 (순서 ↑↓, CRUD)
- [x] L-05 카테고리 추가·수정
- [x] 아카이브 섹션: 복구·영구 삭제
- [x] L-01 로그 추가 (상세·메뉴에서)

---

## E. 비기능

- [x] `userId: 1` 모든 레코드
- [x] `notificationEnabled` 저장 (발송 없음)
- [x] 빌드·린트 통과
- [x] README — MVP 완료 후 (정적 배포 `/lifecycle` 안내 포함)

---

## F. MVP 제외 → 일부 반영

- [x] `/stats` 통계 (2단계 기본 구현)
- [ ] `/my` 마이페이지·Auth
- [x] PWA (C-1) · 클라이언트 리마인더 (C-2)
- [ ] Web Push (서버)

---

## G. 통계 2단계 (`/stats`)

- [x] 통계 페이지·집계 유틸 (`src/lib/utils/stats.ts`)
- [x] 요약·월별 비용·항목별 실제 평균 주기·누적 비용
- [x] `markdown/LifeCycle_Stats_Plan.md`
