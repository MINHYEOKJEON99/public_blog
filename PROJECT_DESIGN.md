# 📝 Public Blog 프로젝트 설계 문서

## 🎯 프로젝트 개요

### 프로젝트명
Public Blog - 모던 블로그 플랫폼

### 목표
사용자 친화적이고 성능이 우수한 블로그 플랫폼 구축

### 주요 특징
- 반응형 디자인
- 다크 모드 지원
- SEO 최적화
- 마크다운 에디터
- 실시간 댓글
- 소셜 공유 기능

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   Pages  │ │Component │ │  Stores  │            │
│  │(App Router)│ │   (UI)   │ │(Zustand) │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────────────────────────────┐               │
│  │     TanStack Query (캐싱)        │               │
│  └──────────────────────────────────┘               │
│  ┌──────────────────────────────────┐               │
│  │        Axios (HTTP Client)        │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│               Backend (Node.js/Express)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   Auth   │ │   API    │ │WebSocket │            │
│  │   (JWT)  │ │  Routes  │ │(Socket.io)│            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────────────────────────────┐               │
│  │         Prisma ORM                │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                  Database & Storage                  │
│  ┌──────────────┐        ┌──────────────┐          │
│  │  PostgreSQL  │        │     Redis    │          │
│  │  (Main DB)   │        │   (Cache)    │          │
│  └──────────────┘        └──────────────┘          │
│  ┌──────────────────────────────────┐               │
│  │     AWS S3 (이미지 저장)          │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

## 💻 기술 스택

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Editor**: MDX Editor / Tiptap
- **Icons**: Lucide React
- **Animation**: Framer Motion

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT + Refresh Token
- **File Storage**: AWS S3 / Cloudinary
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **API Documentation**: Swagger

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)
- **Monitoring**: Sentry
- **Analytics**: Google Analytics / Vercel Analytics

## 📁 프로젝트 구조

### Frontend 구조
```
public_blog/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (blog)/
│   │   │   │   ├── posts/
│   │   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── categories/
│   │   │   ├── dashboard/
│   │   │   │   ├── posts/
│   │   │   │   ├── settings/
│   │   │   │   └── analytics/
│   │   │   ├── api/                # API Routes (if needed)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── post/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostDetail.tsx
│   │   │   │   └── PostEditor.tsx
│   │   │   └── comment/
│   │   │       ├── CommentList.tsx
│   │   │       └── CommentForm.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePosts.ts
│   │   │   └── useDebounce.ts
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts       # Axios instance
│   │   │   │   ├── posts.ts
│   │   │   │   └── auth.ts
│   │   │   └── utils/
│   │   │       ├── format.ts
│   │   │       └── validation.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── themeStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/
│   │   │   ├── post.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
```

### Backend 구조
```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── postController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── models/
│   │   │   └── prisma/
│   │   │       └── schema.prisma
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── postRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── postService.ts
│   │   │   └── emailService.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── bcrypt.ts
│   │   │   └── logger.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── tests/
│   ├── .env
│   └── tsconfig.json
```

## 📊 데이터베이스 스키마

### 주요 모델

```prisma
// User 모델
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  password      String
  name          String?
  bio           String?
  avatar        String?
  role          Role      @default(USER)
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  refreshToken  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Post 모델
model Post {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String    @db.Text
  excerpt       String?
  coverImage    String?
  published     Boolean   @default(false)
  viewCount     Int       @default(0)
  author        User      @relation(fields: [authorId], references: [id])
  authorId      String
  category      Category? @relation(fields: [categoryId], references: [id])
  categoryId    String?
  tags          Tag[]
  comments      Comment[]
  likes         Like[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  publishedAt   DateTime?
}

// Category 모델
model Category {
  id            String    @id @default(cuid())
  name          String    @unique
  slug          String    @unique
  description   String?
  posts         Post[]
  createdAt     DateTime  @default(now())
}

// Comment 모델
model Comment {
  id            String    @id @default(cuid())
  content       String    @db.Text
  post          Post      @relation(fields: [postId], references: [id])
  postId        String
  author        User      @relation(fields: [authorId], references: [id])
  authorId      String
  parent        Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId      String?
  replies       Comment[] @relation("CommentReplies")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## 🔌 API 엔드포인트

### Authentication
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 현재 사용자 정보

### Posts
- `GET /api/posts` - 포스트 목록
- `GET /api/posts/:slug` - 포스트 상세
- `POST /api/posts` - 포스트 생성
- `PUT /api/posts/:id` - 포스트 수정
- `DELETE /api/posts/:id` - 포스트 삭제
- `POST /api/posts/:id/like` - 좋아요
- `DELETE /api/posts/:id/like` - 좋아요 취소

### Comments
- `GET /api/posts/:postId/comments` - 댓글 목록
- `POST /api/posts/:postId/comments` - 댓글 작성
- `PUT /api/comments/:id` - 댓글 수정
- `DELETE /api/comments/:id` - 댓글 삭제

### Categories & Tags
- `GET /api/categories` - 카테고리 목록
- `GET /api/tags` - 태그 목록
- `GET /api/tags/popular` - 인기 태그

### Users
- `GET /api/users/:username` - 사용자 프로필
- `PUT /api/users/profile` - 프로필 수정
- `POST /api/users/avatar` - 아바타 업로드

## 🎨 주요 기능

### 1. 인증 시스템
- JWT + Refresh Token 기반 인증
- 소셜 로그인 (Google, GitHub)
- 이메일 인증
- 비밀번호 재설정

### 2. 포스트 관리
- 마크다운 에디터
- 이미지 업로드 (드래그 앤 드롭)
- 자동 저장
- 임시 저장
- 예약 발행
- SEO 메타데이터 설정

### 3. 댓글 시스템
- 실시간 댓글 (Socket.io)
- 대댓글 지원
- 댓글 알림
- 스팸 필터링

### 4. 검색 & 필터
- 전문 검색
- 카테고리/태그 필터
- 정렬 옵션 (최신, 인기, 조회수)

### 5. 사용자 대시보드
- 통계 대시보드
- 포스트 관리
- 댓글 관리
- 프로필 설정

### 6. 성능 최적화
- 이미지 최적화 (Next.js Image)
- 무한 스크롤
- 페이지네이션
- 캐싱 전략
- SSG/ISR 활용

## 🚀 개발 로드맵

### Phase 1: 기초 설정 (1주)
- [x] 프로젝트 초기 설정
- [ ] 개발 환경 구성
- [ ] 데이터베이스 설계
- [ ] API 스펙 정의

### Phase 2: 백엔드 개발 (2주)
- [ ] Express 서버 설정
- [ ] Prisma 설정 및 마이그레이션
- [ ] 인증 시스템 구현
- [ ] CRUD API 구현
- [ ] 파일 업로드 구현

### Phase 3: 프론트엔드 개발 (3주)
- [ ] Next.js 프로젝트 설정
- [ ] 공통 컴포넌트 개발
- [ ] 인증 페이지 구현
- [ ] 포스트 목록/상세 페이지
- [ ] 에디터 구현
- [ ] 대시보드 구현

### Phase 4: 통합 및 최적화 (1주)
- [ ] API 연동
- [ ] 상태 관리 구현
- [ ] 실시간 기능 구현
- [ ] 성능 최적화
- [ ] 반응형 디자인 완성

### Phase 5: 테스트 및 배포 (1주)
- [ ] 단위 테스트 작성
- [ ] E2E 테스트
- [ ] 보안 점검
- [ ] 배포 환경 설정
- [ ] 모니터링 설정

## 🔒 보안 고려사항

- XSS 방지 (입력 검증, 출력 이스케이핑)
- CSRF 토큰
- SQL Injection 방지 (Prisma ORM)
- Rate Limiting
- HTTPS 적용
- 환경 변수 관리
- 파일 업로드 검증
- JWT Secret 관리

## 📈 성능 목표

- Lighthouse 점수 90+ 
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- 이미지 Lazy Loading
- Code Splitting
- Bundle Size 최적화

## 🧪 테스트 전략

- Unit Tests: 비즈니스 로직
- Integration Tests: API 엔드포인트
- E2E Tests: 주요 사용자 시나리오
- Performance Tests: 부하 테스트
- Security Tests: 취약점 스캔

## 📝 개발 규칙

### 코드 스타일
- ESLint + Prettier 설정 준수
- TypeScript strict mode
- 함수형 컴포넌트 사용
- Custom Hooks 활용
- 절대 경로 import

### Git 컨벤션
- Conventional Commits
- Feature Branch 전략
- PR Template 사용
- Code Review 필수

### 명명 규칙
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 파일명: kebab-case (라우트), PascalCase (컴포넌트)

## 🎯 성공 지표

- 월간 활성 사용자 (MAU) 1,000명
- 평균 세션 시간 5분 이상
- 페이지 로드 시간 2초 이내
- 모바일 사용자 비율 50% 이상
- SEO 트래픽 30% 이상

## 📚 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*