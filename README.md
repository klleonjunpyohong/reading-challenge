# 📚 독서 기록 서비스

100일 33권 독서 챌린지 트래커. AI 독서 코치와 함께 지적 성장을 기록하세요.

## 🛠 기술 스택

| Category | Stack |
|----------|-------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth & DB | Supabase (Auth, PostgreSQL, RLS) |
| State | Zustand |
| AI | Groq Llama 3.3 |
| Calendar | Google Calendar API |
| Animation | Framer Motion, canvas-confetti |
| Deployment | Vercel |

## 📁 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── page.tsx          # 메인 대시보드
│   ├── login/            # 로그인/회원가입
│   ├── start/            # 온보딩
│   ├── archive/          # 지난 챌린지
│   ├── user/[id]/        # 공개 프로필
│   └── api/ai/           # AI 분석 API
├── components/
│   ├── ui/               # 공통 UI (Modal, Toast)
│   ├── books/            # 도서 관련 컴포넌트
│   ├── modals/           # 모달 컴포넌트
│   └── GoogleAnalytics   # 분석 스크립트
├── hooks/                # 커스텀 훅
├── store/                # Zustand 전역 상태
├── types/                # TypeScript 타입
├── utils/                # 상수, 유틸리티
└── lib/                  # Supabase, Auth, Calendar
```

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 🔐 환경 변수

`.env.local` 파일 생성:

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI (선택 - 없으면 시뮬레이션)
GROQ_API_KEY=your-groq-key

# Analytics (선택)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Site URL (배포 시)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## 🌿 Git 브랜치 전략

| Branch | 용도 |
|--------|------|
| `main` | 프로덕션 배포 |
| `develop` | 개발 통합 |
| `feature/*` | 기능 개발 |
| `fix/*` | 버그 수정 |
| `hotfix/*` | 긴급 수정 |

## 📝 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 X)
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드, 설정 변경
```

## 📊 주요 기능

- 🔐 Supabase Auth (이메일/구글 로그인)
- 📚 도서 CRUD (등록/수정/삭제/완독)
- 🎉 완독 축하 (별점, 키워드, confetti)
- 📅 구글 캘린더 연동
- 🤖 AI 독서 코치 (Llama 3.3)
- 🌙 다크 모드
- 🔥 독서 스트릭
- 📊 카테고리 분석 (버블 차트)
- 🏆 33권 컬렉션 맵
- 📈 타임라인 (간트 차트)
- 🌳 지식의 나무 성장
- 🏅 365일 PRO 챌린지 전환
