# [기술 명세서] 일상 사이클 관리 서비스 (LifeCycle) - 개발 아키텍처

## 1. 기술 스택 및 개발 환경 (Tech Stack)
* Frontend: Next.js 14+ (App Router), TypeScript
* Styling: Tailwind CSS
* State Management: React Context API 또는 Zustand
* Deployment/Hosting: Vercel (PWA 지원 환경 고려)

---

## 2. 데이터 저장소 전략 (Storage Strategy)
빠른 MVP 개발과 유저 검증을 위해 데이터 레이어를 2단계로 분리하여 접근합니다.

* 1단계 (MVP): 로컬 저장 버전 (LocalStorage)
  - 브라우저의 localStorage를 메인 데이터베이스로 활용합니다.
  - 백엔드 구축 비용 없이 클라이언트단에서 독립적으로 동작합니다.
* 2단계 (고도화): DB 저장 버전 (Cloud DB)
  - Supabase 또는 PostgreSQL 기반 클라우드 DB 연동으로 전환합니다.
  - 멀티 디바이스 동기화 및 푸시 알림 기능을 확장할 때 이관합니다.

---

## 3. 데이터 모델링 (Data Modeling / TypeScript)

### ① ManagementItem (관리 항목 인터페이스)
사용자가 등록하는 주기 관리 대상의 타입 정의입니다.

```
export interface ManagementItem {
  id: string;            // 고유 ID (UUID 또는 Timestamp 기반 스트링)
  name: string;          // 항목명 (예: 이발, 엔진오일 교체, 주유)
  targetCycle: number;   // 목표 주기 (일 단위, 예: 28)
  categoryId: string;    // 카테고리 ID (그루밍, 모빌리티, 리빙 등)
  createdAt: string;     // 생성일자 (ISO String)
}
```

### ② ActivityLog (수행 기록 로그 인터페이스)
사용자가 완료 버튼을 누를 때마다 누적되는 히스토리 타입 정의입니다.

```
export interface ActivityLog {
  id: string;            // 로그 고유 ID
  itemId: string;        // 연결된 관리 항목의 ID (ManagementItem.id)
  performedAt: string;   // 실제 수행 날짜 (YYYY-MM-DD)
  cost?: number;         // 지출 비용 (선택 사항)
  note?: string;         // 메모 (선택 사항)
}
```

---

## 4. 가상 REST API 및 인터페이스 설계 (Mock API Service)
컴포넌트가 로컬스토리지를 직접 제어하지 않고, 추후 백엔드 API (fetch, axios)로 교체하기 쉽도록 서비스 계층(Service Layer)으로 추상화합니다.

### API 서비스 인터페이스 명세
* GET /api/items
  - 함수명: getItems(): Promise<ManagementItem[]>
  - 로직: 로컬스토리에서 items 데이터를 파싱하여 반환합니다.
* POST /api/items
  - 함수명: createItem(item: Omit<ManagementItem, 'createdAt' 'id' |>): Promise<ManagementItem>
  - 로직: 새 항목 생성 후 기존 배열에 추가 및 로컬스토리지 동기화를 수행합니다.
* DELETE /api/items/:id
  - 함수명: deleteItem(id: string): Promise<void>
  - 로직: 해당 ID를 가진 항목 및 연관된 모든 로그를 삭제합니다.
* GET /api/logs/:itemId
  - 함수명: getLogsByItem(itemId: string): Promise<ActivityLog[]>
  - 로직: 특정 항목에 쌓인 모든 수행 기록 히스토리를 필터링하여 반환합니다.
* POST /api/logs
  - 함수명: addLog(itemId: string, log: Omit<ActivityLog, 'id'>): Promise<ActivityLog>
  - 로직: 특정 항목의 수행 로그를 추가하고, 최신 로그를 기반으로 대시보드 상태를 갱신합니다.

---

## 5. 핵심 비즈니스 로직 및 유틸리티 (Core Logic)
앱 내에서 경과일 및 상태 신호등을 연산하기 위한 공통 함수 로직입니다.

```
/**
 * 마지막 기록일로부터 오늘까지 며칠이 지났는지 계산합니다.
 */
export const getDaysSince = (lastDate: string): number => {
  const today = new Date();
  const targetDate = new Date(lastDate);
  
  // 시, 분, 초 초기화하여 날짜 차이만 정확히 계산
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - targetDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 목표 주기와 현재 경과일을 비교하여 상태 색상(테일윈드 클래스)을 반환합니다.
 * - 안전 (녹색) : 주기 80% 미만 경과
 * - 주의 (황색) : 주기 80% 이상 ~ 100% 미만 경과
 * - 지연 (적색) : 목표 주기 도달 및 초과
 */
export const getStatusColor = (elapsedDays: number, targetCycle: number): string => {
  const ratio = elapsedDays / targetCycle;
  if (ratio >= 1.0) return 'text-red-500 bg-red-50 border-red-200';
  if (ratio >= 0.8) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-200';
};
```

---

## 6. 고도화 전환 로드맵 (Migration Plan)
1. UI 독립성 보장: 프론트엔드 컴포넌트는 오직 Mock API Service 인터페이스 계층만 바라보고 데이터를 호출 및 갱신합니다.
2. 저장소 레이어 스위칭: 로컬스토리지 기반 검증이 완료되면, 컴포넌트 코드는 한 줄도 건드리지 않고 apiService.ts 내부의 가상 API 호출 로직만 Supabase Client 코드나 실제 백엔드 Axios 호출 코드로 교체합니다.