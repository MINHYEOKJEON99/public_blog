# Public Blog API 명세서

## 📋 목차
1. [인증 (Authentication)](#인증-authentication)
2. [포스트 (Posts)](#포스트-posts)
3. [댓글 (Comments)](#댓글-comments)
4. [카테고리 (Categories)](#카테고리-categories)
5. [태그 (Tags)](#태그-tags)
6. [사용자 (Users)](#사용자-users)
7. [업로드 (Upload)](#업로드-upload)
8. [관리자 (Admin)](#관리자-admin)
9. [기타 (Others)](#기타-others)

---

## 🌐 서버 정보
- **Base URL**: `http://localhost:8000/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token

---

## 🔐 인증 (Authentication)

### 회원가입
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clm123456",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "USER",
      "verified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 로그인
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** 회원가입과 동일한 형식

### 토큰 갱신
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 비밀번호 재설정 요청
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### 비밀번호 재설정
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePassword123!"
}
```

### 이메일 인증
```http
POST /api/auth/verify-email
```

**Request Body:**
```json
{
  "token": "verification-token"
}
```

### 로그아웃
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 📝 포스트 (Posts)

### 포스트 목록 조회
```http
GET /api/posts?page=1&limit=10&search=keyword&category=tech&tag=javascript
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10, 최대: 50)
- `search`: 검색 키워드
- `category`: 카테고리 슬러그
- `tag`: 태그 슬러그
- `author`: 작성자 사용자명
- `status`: DRAFT | PUBLISHED (기본값: PUBLISHED)
- `sortBy`: createdAt | updatedAt | views | likes (기본값: createdAt)
- `sortOrder`: asc | desc (기본값: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clm123456",
      "title": "Sample Post",
      "slug": "sample-post",
      "content": "Post content...",
      "excerpt": "Post excerpt...",
      "coverImage": "/uploads/covers/image.jpg",
      "published": true,
      "status": "PUBLISHED",
      "viewCount": 150,
      "likesCount": 25,
      "commentsCount": 10,
      "isLiked": false,
      "author": {
        "id": "clm789012",
        "username": "johndoe",
        "name": "John Doe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "category": {
        "id": "clm345678",
        "name": "Technology",
        "slug": "technology",
        "color": "#3b82f6"
      },
      "tags": [
        {
          "id": "clm901234",
          "name": "JavaScript",
          "slug": "javascript"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 특정 포스트 조회
```http
GET /api/posts/{slug}
```

**Response:** 포스트 목록의 단일 포스트 형식

### 포스트 생성
```http
POST /api/posts
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "New Post Title",
  "content": "Post content in markdown...",
  "excerpt": "Short description",
  "coverImage": "/uploads/covers/image.jpg",
  "status": "DRAFT",
  "categoryId": "clm345678",
  "categories": ["category-slug"],
  "tags": ["javascript", "tutorial"],
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "metaKeywords": "javascript,tutorial,blog"
}
```

### 포스트 수정
```http
PUT /api/posts/{slug}
Authorization: Bearer {token}
```

**Request Body:** 포스트 생성과 동일 (모든 필드 선택적)

### 포스트 삭제
```http
DELETE /api/posts/{slug}
Authorization: Bearer {token}
```

### 포스트 좋아요
```http
POST /api/posts/{slug}/like
Authorization: Bearer {token}
```

### 포스트 좋아요 취소
```http
DELETE /api/posts/{slug}/like
Authorization: Bearer {token}
```

### 인기 포스트
```http
GET /api/posts/popular?period=week&limit=10
```

### 관련 포스트
```http
GET /api/posts/{slug}/related?limit=5
```

---

## 💬 댓글 (Comments)

### 댓글 목록 조회
```http
GET /api/comments?postId={postId}&page=1&limit=10
```

**Query Parameters:**
- `postId`: 포스트 ID (필수)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clm123456",
      "content": "Great post!",
      "postId": "clm789012",
      "author": {
        "id": "clm345678",
        "username": "johndoe",
        "name": "John Doe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "parentId": null,
      "replies": [],
      "repliesCount": 0,
      "likesCount": 5,
      "isLiked": false,
      "approved": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 댓글 생성
```http
POST /api/comments
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "postId": "clm789012",
  "content": "This is a comment",
  "parentId": null
}
```

### 댓글 수정
```http
PUT /api/comments/{commentId}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

### 댓글 삭제
```http
DELETE /api/comments/{commentId}
Authorization: Bearer {token}
```

### 댓글 좋아요
```http
POST /api/comments/{commentId}/like
Authorization: Bearer {token}
```

---

## 📁 카테고리 (Categories)

### 카테고리 목록
```http
GET /api/categories?page=1&limit=10&sortBy=name
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clm123456",
      "name": "Technology",
      "slug": "technology",
      "description": "Tech related posts",
      "color": "#3b82f6",
      "icon": "💻",
      "postsCount": 25,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 특정 카테고리 조회
```http
GET /api/categories/{slug}
```

### 카테고리 생성 (관리자만)
```http
POST /api/categories
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "color": "#ef4444",
  "icon": "🔥"
}
```

### 인기 카테고리
```http
GET /api/categories/popular?limit=10
```

---

## 🏷️ 태그 (Tags)

### 태그 목록
```http
GET /api/tags?page=1&limit=10&search=java
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clm123456",
      "name": "JavaScript",
      "slug": "javascript",
      "description": "JavaScript programming language",
      "color": "#f7df1e",
      "postsCount": 15,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 특정 태그 조회
```http
GET /api/tags/{slug}
```

### 태그 생성 (관리자만)
```http
POST /api/tags
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "name": "New Tag",
  "description": "Tag description",
  "color": "#10b981"
}
```

### 인기 태그
```http
GET /api/tags/popular?limit=10
```

### 태그 검색
```http
GET /api/tags/search?q=react&limit=10
```

---

## 👤 사용자 (Users)

### 프로필 조회
```http
GET /api/users/profile
Authorization: Bearer {token}
```

### 프로필 수정
```http
PUT /api/users/profile
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "avatar": "/uploads/avatars/new-avatar.jpg"
}
```

### 비밀번호 변경
```http
PUT /api/users/change-password
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!"
}
```

### 공개 프로필 조회
```http
GET /api/users/{username}
```

### 사용자의 포스트 목록
```http
GET /api/users/{username}/posts?page=1&limit=10
```

---

## 📤 업로드 (Upload)

### 단일 파일 업로드
```http
POST /api/upload/file
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: 업로드할 파일 (jpg, jpeg, png, gif, webp)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/general/filename_123456789.jpg",
    "filename": "filename_123456789.jpg",
    "originalName": "original-filename.jpg",
    "size": 245760,
    "mimeType": "image/jpeg"
  }
}
```

### 아바타 업로드
```http
POST /api/upload/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### 포스트 이미지 업로드
```http
POST /api/upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### 커버 이미지 업로드
```http
POST /api/upload/cover
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### 다중 파일 업로드
```http
POST /api/upload/multiple
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `files`: 여러 파일 (최대 10개)

---

## 👨‍💼 관리자 (Admin)

### 대시보드 통계
```http
GET /api/admin/stats
Authorization: Bearer {admin-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "verified": 980,
      "unverified": 270,
      "admins": 5
    },
    "posts": {
      "total": 450,
      "published": 380,
      "drafts": 70,
      "thisMonth": 35
    },
    "comments": {
      "total": 2340,
      "approved": 2280,
      "pending": 60,
      "thisMonth": 180
    },
    "categories": {
      "total": 12
    },
    "tags": {
      "total": 85
    }
  }
}
```

### 사용자 관리
```http
GET /api/admin/users?page=1&limit=20&role=USER&verified=true
```

### 사용자 역할 변경
```http
PUT /api/admin/users/{userId}/role
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### 댓글 승인/거부
```http
PUT /api/admin/comments/{commentId}/approve
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "approved": true
}
```

---

## 🔍 기타 (Others)

### 헬스 체크
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 86400,
  "database": "connected",
  "memory": {
    "used": 52428800,
    "total": 134217728
  },
  "version": "1.0.0"
}
```

### API 정보
```http
GET /api
```

**Response:**
```json
{
  "name": "Public Blog API",
  "version": "v1",
  "description": "RESTful API for Public Blog platform",
  "documentation": "/api/docs",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "posts": "/api/posts",
    "comments": "/api/comments",
    "categories": "/api/categories",
    "tags": "/api/tags",
    "upload": "/api/upload",
    "admin": "/api/admin",
    "health": "/api/health"
  }
}
```

---

## 📊 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { /* 데이터 */ },
  "message": "Optional success message",
  "pagination": { /* 페이지네이션 정보 (목록 조회시) */ }
}
```

### 오류 응답
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### 페이지네이션
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔒 인증 헤더

모든 보호된 엔드포인트에는 다음 헤더가 필요합니다:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## ⚡ Rate Limiting

- **일반 API**: 15분당 100회
- **인증 API**: 15분당 10회
- **업로드 API**: 1분당 10회
- **관리자 API**: 15분당 5회

---

## 🚫 오류 코드

- `400`: Bad Request - 잘못된 요청
- `401`: Unauthorized - 인증 필요
- `403`: Forbidden - 권한 없음
- `404`: Not Found - 리소스 없음
- `409`: Conflict - 중복 데이터
- `429`: Too Many Requests - 요청 제한 초과
- `500`: Internal Server Error - 서버 오류