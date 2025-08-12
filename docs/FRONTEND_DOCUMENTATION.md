# Public Blog Frontend 개발 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [폴더 구조](#폴더-구조)
4. [페이지 구조](#페이지-구조)
5. [컴포넌트 시스템](#컴포넌트-시스템)
6. [상태 관리](#상태-관리)
7. [API 연동](#api-연동)
8. [스타일링 시스템](#스타일링-시스템)
9. [개발 가이드](#개발-가이드)

---

## 🚀 프로젝트 개요

**Public Blog Frontend**는 현대적이고 사용자 친화적인 블로그 플랫폼의 프론트엔드 애플리케이션입니다.

**주요 특징:**
- 📱 완전 반응형 디자인 (모바일 우선)
- 🎨 다크/라이트 테마 지원
- ⚡ 고성능 & SEO 최적화
- 🌍 국제화 지원 (한국어)
- 🎭 풍부한 애니메이션 및 인터랙션
- 🔒 사용자 인증 및 권한 관리

---

## 🛠 기술 스택

### **Core Framework**
- **Next.js 15** - App Router 기반의 React 프레임워크
- **React 19** - 최신 React Concurrent 기능 활용
- **TypeScript** - 타입 안전성 및 개발자 경험

### **스타일링**
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **class-variance-authority (CVA)** - 컴포넌트 variant 관리
- **Framer Motion** - 고급 애니메이션 라이브러리

### **UI 컴포넌트**
- **Radix UI** - 접근성 우선 헤드리스 UI 컴포넌트
- **Lucide React** - 아이콘 시스템
- **커스텀 디자인 시스템** - 일관된 UI/UX

### **상태 관리**
- **Zustand** - 경량 상태 관리 라이브러리
- **React Query/SWR** - 서버 상태 관리 (계획)

### **개발 도구**
- **ESLint** - 코드 품질 검사
- **Prettier** - 코드 포맷팅
- **PostCSS** - CSS 후처리

---

## 📁 폴더 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트 그룹
│   │   ├── login/         # 로그인 페이지
│   │   └── register/      # 회원가입 페이지
│   ├── (blog)/            # 블로그 관련 라우트 그룹
│   │   ├── categories/    # 카테고리 페이지
│   │   └── posts/         # 포스트 관련 페이지
│   ├── dashboard/         # 대시보드 (관리자/사용자)
│   │   ├── analytics/     # 분석 페이지
│   │   ├── posts/         # 포스트 관리
│   │   └── settings/      # 설정 페이지
│   ├── posts/             # 포스트 상세/목록 페이지
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 홈페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   │   ├── Header.tsx     # 네비게이션 헤더
│   │   ├── Footer.tsx     # 푸터
│   │   ├── Layout.tsx     # 페이지 레이아웃
│   │   └── Providers.tsx  # 전역 프로바이더
│   ├── post/              # 포스트 관련 컴포넌트
│   ├── comment/           # 댓글 시스템 컴포넌트
│   └── ui/                # 기본 UI 컴포넌트
├── hooks/                 # 커스텀 React 훅
├── lib/                   # 유틸리티 및 설정
│   ├── api/               # API 클라이언트
│   ├── utils/             # 유틸리티 함수
│   └── validations/       # 폼 검증 스키마
├── stores/                # 상태 관리 스토어
└── types/                 # TypeScript 타입 정의
```

---

## 📄 페이지 구조

### **1. 메인 페이지 (`/`)**
**파일**: `src/app/page.tsx`

**기능:**
- 🎯 히어로 섹션 with 애니메이션
- 📊 실시간 통계 (사용자, 포스트, 조회수)
- 🔥 트렌딩 포스트 섹션
- 📂 카테고리 쇼케이스
- 🔍 통합 검색 기능
- 🌟 커뮤니티 CTA 섹션

**주요 컴포넌트:**
- 애니메이션 카운터
- 그리드/리스트 뷰 토글
- 반응형 포스트 카드
- 카테고리 필터링

### **2. 인증 페이지**
**라우트 그룹**: `src/app/(auth)/`

#### **로그인 페이지** (`/login`)
**파일**: `src/app/(auth)/login/page.tsx`

**기능:**
- 📧 이메일/비밀번호 로그인
- 🔗 소셜 로그인 (준비)
- 🔄 자동 리다이렉트
- 🚫 에러 핸들링

#### **회원가입 페이지** (`/register`)
**파일**: `src/app/(auth)/register/page.tsx`

**기능:**
- 📝 사용자 정보 입력
- ✅ 실시간 유효성 검사
- 📧 이메일 인증
- 🎭 프로필 설정

### **3. 포스트 관련 페이지**
**경로**: `src/app/posts/`

#### **포스트 목록** (`/posts`)
**파일**: `src/app/posts/page.tsx`

**기능:**
- 📋 무한 스크롤 포스트 목록
- 🏷️ 카테고리/태그 필터링
- 🔍 검색 및 정렬
- 📱 반응형 그리드 레이아웃

#### **포스트 상세** (`/posts/[slug]`)
**파일**: `src/app/posts/[slug]/page.tsx`

**기능:**
- 📖 마크다운 렌더링
- 💬 댓글 시스템
- 👍 좋아요/북마크
- 📤 소셜 공유
- 📊 조회수 추적

### **4. 대시보드** (계획)
**경로**: `src/app/dashboard/`

**기능:**
- 📊 개인 분석 대시보드
- ✏️ 포스트 작성/편집
- ⚙️ 계정 설정
- 📈 성과 지표

---

## 🧩 컴포넌트 시스템

### **공통 컴포넌트** (`components/common/`)

#### **Layout.tsx**
**역할**: 기본 페이지 레이아웃 구조
```tsx
interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

#### **Header.tsx**
**기능:**
- 🧭 네비게이션 메뉴
- 🔍 통합 검색
- 👤 사용자 프로필 드롭다운
- 🌓 테마 토글
- 📱 모바일 반응형 메뉴

#### **Footer.tsx**
**기능:**
- 📞 연락처 정보
- 🔗 소셜 미디어 링크
- 📄 법적 고지
- 🌐 언어 선택

#### **Providers.tsx**
**역할**: 전역 컨텍스트 및 프로바이더 설정
- 테마 프로바이더
- 인증 컨텍스트
- 쿼리 클라이언트

### **UI 컴포넌트** (`components/ui/`)

#### **Button.tsx**
**특징:**
- 🎨 9가지 variant (default, destructive, outline, secondary, ghost, link, success)
- 📏 5가지 size (sm, default, lg, xl, icon)
- ✨ Framer Motion 애니메이션
- ♿ 완전한 접근성 지원

```tsx
<Button variant="default" size="lg" className="group">
  <Icon className="w-5 h-5 mr-2 group-hover:rotate-12" />
  클릭하기
</Button>
```

#### **Card.tsx**
**구성:**
- Card - 메인 컨테이너
- CardHeader - 헤더 영역
- CardTitle - 제목
- CardDescription - 설명
- CardContent - 내용
- CardFooter - 푸터

#### **Badge.tsx**
**variant:**
- default, secondary, destructive, outline, success, warning
- 애니메이션 지원 (pulse, bounce)
- 크기 옵션 (sm, default, lg)

#### **Input.tsx**
**기능:**
- 🎯 7가지 variant
- 📐 다양한 크기 옵션
- 🚨 에러 상태 표시
- 🔍 아이콘 지원

#### **그 외 UI 컴포넌트:**
- **Avatar**: 사용자 아바타 with 상태 표시기
- **Progress**: 애니메이션 프로그레스 바
- **Tabs**: 탭 인터페이스
- **Modal**: 모달 다이얼로그
- **Toast**: 알림 메시지
- **Tooltip**: 도구 설명
- **Select**: 드롭다운 선택기
- **Textarea**: 멀티라인 텍스트 입력

---

## 🗃 상태 관리

### **Zustand 스토어**

#### **authStore.ts**
**기능:**
- 👤 사용자 인증 상태
- 🔐 로그인/로그아웃 관리
- 💾 토큰 저장/관리

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}
```

#### **themeStore.ts**
**기능:**
- 🌓 다크/라이트 테마 토글
- 💾 로컬 스토리지 동기화
- 🔄 시스템 테마 감지

#### **uiStore.ts**
**기능:**
- 📱 모바일 메뉴 상태
- 🔍 검색 오버레이 상태
- 🎨 UI 인터랙션 상태

---

## 🔌 API 연동

### **API 클라이언트** (`lib/api/`)

#### **client.ts**
**기능:**
- 🌐 Axios 기반 HTTP 클라이언트
- 🔐 자동 토큰 첨부
- 🔄 토큰 갱신 로직
- 🚨 에러 인터셉터

#### **API 모듈:**
- **auth.ts**: 인증 관련 API
- **posts.ts**: 포스트 CRUD API
- **comments.ts**: 댓글 시스템 API
- **categories.ts**: 카테고리 관리 API
- **users.ts**: 사용자 프로필 API

### **커스텀 훅** (`hooks/`)

#### **useAuth.ts**
```typescript
export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN'
  }
}
```

#### **usePosts.ts**
- 포스트 목록 조회
- 무한 스크롤 구현
- 캐싱 및 최적화

#### **useComments.ts**
- 댓글 CRUD 작업
- 실시간 업데이트
- 대댓글 관리

#### **기타 유틸리티 훅:**
- **useDebounce**: 검색 입력 디바운싱
- **useLocalStorage**: 로컬 스토리지 동기화
- **useClipboard**: 클립보드 복사 기능

---

## 🎨 스타일링 시스템

### **디자인 토큰**
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a'
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    }
  }
}
```

### **컴포넌트 Variants (CVA)**
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border-2 border-gray-300 hover:bg-gray-50"
      },
      size: {
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base"
      }
    }
  }
)
```

### **애니메이션 시스템**
**Framer Motion 기반:**
- 페이지 트랜지션
- 컴포넌트 진입/퇴장
- 호버 및 클릭 애니메이션
- 스크롤 기반 애니메이션

---

## 📚 유틸리티 시스템

### **유틸리티 함수** (`lib/utils/`)

#### **utils.ts**
```typescript
// Tailwind 클래스 병합
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('ko-KR').format(new Date(date))
}

// 텍스트 절단
export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str
}
```

### **검증 스키마** (`lib/validations/`)
**Zod 기반 타입 안전 검증:**
```typescript
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다')
})
```

---

## 🎯 주요 기능별 구현 상태

### ✅ **완료된 기능**

#### **🏠 홈페이지**
- ✅ 반응형 히어로 섹션
- ✅ 애니메이션 통계 카운터
- ✅ 트렌딩 포스트 그리드
- ✅ 카테고리 쇼케이스
- ✅ 검색 기능
- ✅ CTA 섹션

#### **🎨 UI 컴포넌트 시스템**
- ✅ Button (9 variants, 5 sizes)
- ✅ Card 컴포넌트 패밀리
- ✅ Input/Textarea (7 variants)
- ✅ Badge (6 variants, 애니메이션)
- ✅ Avatar (상태 표시기 포함)
- ✅ Progress (애니메이션)
- ✅ Tabs 시스템
- ✅ Modal/Toast/Tooltip

#### **🔧 개발 인프라**
- ✅ Next.js 15 App Router 설정
- ✅ TypeScript 완전 설정
- ✅ Tailwind CSS + CVA
- ✅ Framer Motion 애니메이션
- ✅ ESLint/Prettier 설정

#### **🗃 상태 관리**
- ✅ Zustand 스토어 구조
- ✅ 인증 상태 관리
- ✅ 테마 관리
- ✅ UI 상태 관리

### 🚧 **진행 중인 기능**

#### **🔐 인증 시스템**
- 🚧 로그인/회원가입 페이지 (UI 완료, 로직 연동 필요)
- 🚧 사용자 프로필 관리
- 🚧 권한 기반 라우팅

#### **📝 포스트 시스템**
- 🚧 포스트 목록/상세 페이지 (기본 구조 완료)
- 🚧 마크다운 렌더링
- 🚧 검색 및 필터링

### 📋 **계획된 기능**

#### **💬 댓글 시스템**
- 📋 댓글/대댓글 컴포넌트
- 📋 실시간 업데이트
- 📋 좋아요 기능

#### **📊 대시보드**
- 📋 사용자 대시보드
- 📋 포스트 작성/편집기
- 📋 관리자 패널

#### **🔍 고급 기능**
- 📋 무한 스크롤
- 📋 PWA 지원
- 📋 오프라인 모드
- 📋 푸시 알림

---

## 🚀 개발 가이드

### **시작하기**
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

### **개발 규칙**

#### **컴포넌트 작성**
1. **함수형 컴포넌트** 사용
2. **TypeScript 인터페이스** 정의
3. **forwardRef** 필요시 사용
4. **Framer Motion** 애니메이션 활용

```tsx
interface ComponentProps {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'lg'
  children: React.ReactNode
}

export const Component = React.forwardRef<
  HTMLDivElement,
  ComponentProps
>(({ variant = 'default', size = 'sm', children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(componentVariants({ variant, size }))}
      whileHover={{ scale: 1.02 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})
```

#### **스타일링 규칙**
1. **Tailwind** 유틸리티 우선 사용
2. **CVA**로 variant 관리
3. **cn()** 함수로 클래스 병합
4. **반응형** 모바일 우선 디자인

#### **상태 관리**
1. **로컬 상태**: useState, useReducer
2. **전역 상태**: Zustand 스토어
3. **서버 상태**: React Query (계획)
4. **URL 상태**: Next.js router

#### **API 연동**
1. **타입 안전성** 보장
2. **에러 핸들링** 필수
3. **로딩 상태** 관리
4. **캐싱** 전략 수립

### **성능 최적화**

#### **이미지 최적화**
- Next.js Image 컴포넌트 사용
- 적절한 크기 및 포맷 선택
- 지연 로딩 적용

#### **코드 분할**
- 동적 import 활용
- 페이지별 번들 분리
- 컴포넌트 지연 로딩

#### **SEO 최적화**
- 메타데이터 설정
- 구조화된 데이터
- 시맨틱 HTML

---

## 🔮 향후 계획

### **단기 목표 (1-2개월)**
- ✅ 인증 시스템 완성
- ✅ 포스트 CRUD 구현
- ✅ 댓글 시스템 구축
- ✅ 백엔드 API 연동

### **중기 목표 (3-6개월)**
- 📊 고급 대시보드 구현
- 🔍 전문 검색 엔진
- 📱 PWA 변환
- 🌐 다국어 지원 확대

### **장기 목표 (6개월+)**
- 🤖 AI 기반 추천 시스템
- 📈 고급 분석 도구
- 🎨 테마 커스터마이제이션
- 🔔 실시간 알림 시스템

---

## 📞 개발팀 연락처

**Frontend Team**
- 🎨 UI/UX: 디자인 시스템 및 사용자 경험
- ⚡ Performance: 최적화 및 성능 관리  
- 🧪 Testing: 품질 보증 및 테스트 자동화

**협업 도구**
- 💬 Slack: 실시간 커뮤니케이션
- 📋 Notion: 프로젝트 문서화
- 🐙 GitHub: 코드 리뷰 및 버전 관리

---

*이 문서는 지속적으로 업데이트되며, 프로젝트 진행에 따라 내용이 추가/수정될 수 있습니다.*