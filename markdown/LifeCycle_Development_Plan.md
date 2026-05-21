# [기술 명세서] 일상 사이클 관리 서비스 (LifeCycle) - 개발 아키텍처

## 1. 기술 스택 및 개발 환경 (Tech Stack)
* Frontend: Next.js 14+ (App Router), TypeScript
* Styling: Tailwind CSS
* State Management: React Context API 또는 Zustand
* Deployment/Hosting: 정적 export, `next.config.ts`의 `DEPLOY_BASE_PATH`로 배포 서브경로 설정
* i18n (추후): next-intl 등 — MVP부터 문구·단위 분리 구조 권장
* a11y: 시맨틱 HTML, ARIA, 신호등 상태의 비색상 보조 표시(아이콘·텍스트)

---

## 2. 데이터 저장소 전략 (Storage Strategy)
빠른 MVP 개발과 유저 검증을 위해 데이터 레이어를 2단계로 분리하여 접근합니다.

* 1단계 (MVP): 로컬 저장 버전 (LocalStorage)
  - 브라우저의 localStorage를 메인 데이터베이스로 활용합니다.
  - 백엔드 구축 비용 없이 클라이언트단에서 독립적으로 동작합니다.
  - **인증 전:** `userId`는 상수 `MASTER_USER_ID = 1` 로 모든 레코드에 설정합니다.
* 2단계 (고도화): DB 저장 버전 (Cloud DB)
  - Supabase 또는 PostgreSQL 기반 클라우드 DB 연동으로 전환합니다.
  - Auth·User 테이블 추가, `userId` 기준 데이터 격리, 멀티 디바이스 동기화 및 알림(크론·푸시) 확장 시 이관합니다.

---

## 3. 데이터 모델링 (Data Modeling / TypeScript)

### 공통 상수
```
/** 인증 도입 전 테스트·마스터 계정 식별자 */
export const MASTER_USER_ID = 1;

export type ItemStatus = 'active' | 'archived';
```

### ① Category (카테고리)
항목 생성·수정 시 참조하는 별도 엔티티입니다.

```
export interface Category {
  id: string;
  userId: number;        // MVP: MASTER_USER_ID(1). 고도화 후 실제 사용자 ID
  name: string;          // 예: 그루밍, 모빌리티
  icon?: string;         // 아이콘 키 또는 URL
  sortOrder: number;     // 항목 관리 필터 chip·카테고리 편집 표시 순서
  createdAt: string;     // ISO 8601
  updatedAt: string;
}
```

### ② ManagementItem (관리 항목)
```
export interface ManagementItem {
  id: string;
  userId: number;              // MVP: MASTER_USER_ID(1)
  name: string;                // 항목명 (예: 이발, 엔진오일 교체)
  targetCycleDays: number;     // 목표 주기 — 내부 저장·계산은 항상 일 단위
  categoryId: string;          // Category.id
  status: ItemStatus;          // 'active' | 'archived'
  notificationEnabled: boolean; // 알림 발송은 고도화(크론·푸시) 시 구현. MVP는 필드만 저장
  // 고도화 시 ManagementItem에 추가 예정 (MVP 스키마에는 미포함):
  // notificationTime?: string;  // 'HH:mm' — 크론 발송 기준 시각
  createdAt: string;
  updatedAt: string;
}
```

**주기 입력·표시 (UI):** 사용자에게는 년 / 개월 / 주 / 일 중 선택·표시. 저장 시 `targetCycleDays`로 환산(예: 4주 → 28). **개월·년 환산 규칙은 `cycleToDays` 유틸에서 일원화**하며, 달력 월/윤년 등 세부 규칙은 구현 시 명세에 고정한다.

### ③ ActivityLog (수행 기록)
```
export interface ActivityLog {
  id: string;
  userId: number;              // MVP: MASTER_USER_ID(1)
  itemId: string;              // ManagementItem.id
  performedAt: string;         // YYYY-MM-DD (일 단위, 0시 기준 비교)
  cost?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 대시보드 기준일 규칙
* 항목별 **가장 최신 `performedAt`** (동일 날짜면 `createdAt` 등 보조 정렬)을 마지막 수행일로 사용합니다.
* 로그가 없으면 경과일·신호등·진행바 대신 **empty-state** UI(화면 기획 참고).
* `targetCycleDays === 0` 이거나 당일 수행(경과 0일)인 경우 **"오늘 수행함"** 등 별도 UI(화면 기획 참고). `getStatusColor` 등 비율 계산 시 0으로 나누지 않도록 분기합니다.

---

## 4. 가상 REST API 및 인터페이스 설계 (Mock API Service)
컴포넌트가 localStorage를 직접 제어하지 않고, 추후 백엔드 API로 교체하기 쉽도록 서비스 계층으로 추상화합니다.

**`userId` 필터링 (필수):** MVP에서는 `userId === MASTER_USER_ID(1)` 로만 조회·생성·수정한다. 고도화 후 Auth 세션의 사용자 ID로 교체하며, **다른 사용자의 항목·로그·카테고리가 조회·변경되지 않도록** 모든 API에 동일 규칙을 적용한다. User 테이블은 고도화 기획·구현 시 추가한다.

### Category API
* `GET /api/categories` → `getCategories(): Promise<Category[]>`
* `POST /api/categories` → `createCategory(...): Promise<Category>`
* `PATCH /api/categories/:id` → `updateCategory(id, partial): Promise<Category>`
* `PATCH /api/categories/reorder` → `reorderCategories(orderedIds: string[]): Promise<Category[]>` — `sortOrder` 일괄 갱신

### ManagementItem API
* `GET /api/items` → `getItems(includeArchived?: boolean): Promise<ManagementItem[]>` — 기본은 `status === 'active'` 만
* `POST /api/items` → `createItem(...)`: `userId`, `createdAt`, `updatedAt`, `status: 'active'` 자동 설정
* `PATCH /api/items/:id` → `updateItem(id, partial): Promise<ManagementItem>` — 항목 수정
* `PATCH /api/items/:id/archive` → `archiveItem(id): Promise<ManagementItem>` — `status: 'archived'`
* `PATCH /api/items/:id/restore` → `restoreItem(id): Promise<ManagementItem>` — `status: 'active'`
* `DELETE /api/items/:id` → `deleteItem(id): Promise<void>` — 항목 및 연관 로그 삭제(필요 시)

### ActivityLog API
* `GET /api/logs/:itemId` → `getLogsByItem(itemId): Promise<ActivityLog[]>` — `performedAt` 내림차순 권장
* `GET /api/logs/:itemId/latest` → `getLatestLogByItem(itemId): Promise<ActivityLog | null>`
* `POST /api/logs` → `addLog(...)`: 대시보드 갱신은 **추가된 로그가 최신인 경우** 반영
* `PATCH /api/logs/:id` → `updateLog(id, partial): Promise<ActivityLog>` — 소급 수정·메모
* `DELETE /api/logs/:id` → `deleteLog(id): Promise<void>`

---

## 5. 핵심 비즈니스 로직 및 유틸리티 (Core Logic)

### 날짜·주기
* 모든 일(day) 차이는 **당일 0시(자정) 기준**으로만 계산합니다.
* UI 주기 단위 ↔ 일 환산은 `cycleToDays` / `daysToCycleDisplay` 등 단일 모듈에서 처리합니다.

```
/**
 * 마지막 기록일로부터 오늘까지 며칠이 지났는지 계산 (0시 기준).
 */
export const getDaysSince = (lastDate: string): number => {
  const today = new Date();
  const targetDate = new Date(lastDate);
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - targetDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 항목의 최신 로그 performedAt 반환. 없으면 null.
 */
export const getLastPerformedAt = (
  logs: ActivityLog[]
): string | null => {
  if (logs.length === 0) return null;
  return [...logs].sort(
    (a, b) => b.performedAt.localeCompare(a.performedAt)
  )[0].performedAt;
};

/**
 * 목표 주기(일)와 경과일로 상태 색상 반환.
 * targetCycleDays === 0 또는 로그 없음은 호출 전 UI 분기.
 */
export const getStatusColor = (
  elapsedDays: number,
  targetCycleDays: number
): string => {
  if (targetCycleDays <= 0) {
    return 'text-green-600 bg-green-50 border-green-200'; // 당일 주기 — UI에서 별도 카피 처리
  }
  const ratio = elapsedDays / targetCycleDays;
  if (ratio >= 1.0) return 'text-red-500 bg-red-50 border-red-200';
  if (ratio >= 0.8) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-200';
};
```

---

## 6. localStorage 키 구조 (안)
```
lifecycle:categories
lifecycle:items
lifecycle:logs
```
각 배열 요소는 위 인터페이스를 따릅니다. 초기 시드 시 Category 프리셋(그루밍·모빌리티 등)을 `userId: 1` 로 넣어 항목 생성 UX를 지원합니다.

---

## 7. 고도화 전환 로드맵 (Migration Plan)
1. **UI 독립성:** 컴포넌트는 Mock API Service 인터페이스만 사용합니다.
2. **저장소 스위칭:** `apiService.ts` 내부 구현만 Supabase/REST로 교체. `userId` 필터는 Auth 세션 ID로 변경.
3. **User / Auth:** User 테이블·Next.js Auth는 고도화 기획 문서와 함께 추가(본 문서 범위 외).
4. **알림:** DB·크론 기반 스케줄러가 정해진 시각에 `notificationEnabled === true` 인 항목을 조회해 푸시. `notificationTime` 등 추가 필드는 고도화 스키마 마이그레이션 시 반영.

---

## 8. 후속 산출물 (본 문서 범위 외)
* **MVP 구현 체크리스트:** 화면 기획 문서 확정 후 별도 작성.
* **README:** 기본 개발(MVP) 완료 후 서비스 개요·실행 방법·사용법과 함께 작성.
* **User·Auth·멀티 디바이스:** 고도화 착수 전 별도 기획 문서에서 User 테이블·Next.js Auth 설계.
