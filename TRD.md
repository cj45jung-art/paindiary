# TRD: 통증 다이어리 시스템 아키텍처 및 설계

## 1. 아키텍처[cite: 2]
초기 MVP의 빠른 검증과 프론트엔드 중심의 개발 편의성을 위해 서버리스 아키텍처를 채택합니다.
* **Client**: PWA (Progressive Web App) 환경으로 홈 화면 추가 및 오프라인 캐싱 지원.
* **Frontend Hosting**: Vercel (빠른 배포 및 글로벌 CDN).
* **Backend/BaaS**: Supabase (인증, 데이터베이스, 스토리지 통합 제공).
* **AI 연동**: OpenAI API (GPT-4o-mini)를 활용한 비동기 리포트 생성 백그라운드 작업.

## 2. 데이터 모델 (ERD 개념)[cite: 2]
* **Users**: `id`, `email`, `nickname`, `created_at`
* **PainRecords**: `id`, `user_id`, `pain_level`(1-10), `body_part`, `sleep_hours`, `posture_rating`, `recorded_at`
* **Reports**: `id`, `user_id`, `report_type`(weekly/monthly), `ai_summary`, `recommended_dept`, `created_at`
* **Products (Commerce)**: `id`, `target_symptom`, `product_name`, `affiliate_url`, `image_url`

## 3. 기술 스택[cite: 2]
* **Language/Framework**: TypeScript, Next.js (App Router 기반). SEO 최적화 및 PWA 구성에 유리함.
* **UI/Styling**: Tailwind CSS, shadcn/ui, Framer Motion (부드러운 스와이프 인터랙션 구현용).
* **Database**: PostgreSQL (Supabase 제공). 관계형 데이터를 통한 통계 쿼리에 적합.
* **State Management**: Zustand (가벼운 클라이언트 상태 관리).

## 4. 보안[cite: 2]
* **인증**: Supabase Auth를 활용한 소셜 로그인 (Kakao, Google) 및 JWT 기반 세션 관리.
* **데이터 보호**: Supabase Row Level Security (RLS) 정책을 적용하여, 사용자는 오직 본인의 건강 데이터(`user_id` 일치)만 조회/수정 가능하도록 원천 차단.