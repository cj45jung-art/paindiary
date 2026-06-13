# TODO: 통증 다이어리 MVP 개발 마일스톤

- task: "프로젝트 초기 설정 및 환경 구성"
  category: setup
  priority: P0
  status: "완료"
  dependency: "없음"
  criteria: "Next.js 프로젝트 생성, TailwindCSS 설정, Vercel CI/CD 파이프라인 연결 완료"
  details: "Next.js 16, TypeScript, TailwindCSS 4 초기 세팅 완료 및 tsconfig.json 오류 수정, package.json 스크립트 보완 완료"

- task: "Supabase DB 및 Auth 연동"
  category: data
  priority: P0
  status: "진행 중 (로컬 Mock 대체)"
  dependency: "프로젝트 초기 설정 및 환경 구성"
  criteria: "Users 테이블 생성, RLS 정책 적용, 소셜 로그인(구글/카카오) 테스트 성공"
  details: "Supabase Auth/DB 연동 전까지 LocalStorage Mock DB(src/lib/supabase.ts)를 사용해 세션 관리 및 CRUD가 원활히 동작하도록 대체 구현"

- task: "대시보드 UI/UX 구현 (기록 화면)"
  category: ui
  priority: P0
  status: "완료"
  dependency: "없음"
  criteria: "인체 부위 선택 인터페이스, 1-10 슬라이더, 생활습관 체크리스트 퍼블리싱 완료"
  details: "BodyMap 컴포넌트를 통한 통증 부위 선택 및 통증/수면/자세 강도 슬라이더 폼 구현 완료"

- task: "통증 기록 CRUD API 연결"
  category: api
  priority: P0
  status: "완료 (로컬 Mock)"
  dependency: "Supabase DB 및 Auth 연동, 대시보드 UI/UX 구현"
  criteria: "클라이언트에서 입력한 데이터가 PainRecords 테이블에 정상적으로 Insert 및 Fetch 되는지 확인"
  details: "LocalStorage API를 연동하여 통증 기록의 추가/조회/삭제 및 대시보드 즉각 갱신 완료"

- task: "AI 기반 리포트 생성 로직 구현"
  category: core
  priority: P1
  status: "완료 (로컬 룰베이스)"
  dependency: "통증 기록 CRUD API 연결"
  criteria: "특정 유저의 7일치 데이터를 OpenAI API 프롬프트에 주입하여 JSON 형태의 분석 결과를 반환받음"
  details: "OpenAI 연동 전까지 7일간의 수면/자세/부위별 통증 데이터 상관관계를 분석하는 고품질 로컬 AI 분석 엔진(reportGenerator.ts) 구현 완료"

- task: "맞춤형 커머스 추천 모듈 연결"
  category: core
  priority: P1
  status: "완료 (로컬 매핑)"
  dependency: "AI 기반 리포트 생성 로직 구현"
  criteria: "AI 분석 결과(주요 증상)와 Products 테이블의 매핑을 통해 리포트 하단에 상품 3개 이상 노출"
  details: "AI 진단 부위에 맞는 버티컬 마우스, 경추베개 등 최저가 추천 상품 큐레이션 완료"

- task: "PWA 매니페스트 및 서비스 워커 설정"
  category: deploy
  priority: P2
  status: "완료"
  dependency: "대시보드 UI/UX 구현"
  criteria: "모바일 브라우저에서 '홈 화면에 추가' 프롬프트 정상 노출 및 오프라인 접속 시 캐시 페이지 렌더링"
  details: "manifest.json 및 sw.js 구축, layout.tsx 내 서비스 워커 등록 완료"

- task: "네비게이션 탭 에러 해결 및 추가 페이지 구현"
  category: ui
  priority: P1
  status: "진행 중"
  dependency: "대시보드 UI/UX 구현"
  criteria: "네비게이션의 /commerce 및 /settings 페이지 클릭 시 404가 발생하지 않고 페이지 정상 작동"
  details: "전체 맞춤 상품을 조회할 수 있는 쇼핑관(/commerce) 및 사용자 프로필 수정/데이터 초기화를 지원하는 설정(/settings) 구현 진행 중"