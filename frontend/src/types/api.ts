// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// User Types
export interface User {
  id: string
  email: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  name?: string
  bio?: string
  avatar?: string
}

// Post Types
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  viewCount: number
  author: User
  authorId: string
  category?: Category
  categoryId?: string
  tags: Tag[]
  comments?: Comment[]
  likes?: Like[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  published?: boolean
  categoryId?: string
  tags?: string[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  excerpt?: string
  coverImage?: string
  published?: boolean
  categoryId?: string
  tags?: string[]
}

export interface PostFilters {
  category?: string
  tag?: string
  author?: string
  published?: boolean
  search?: string
  sortBy?: 'created' | 'updated' | 'published' | 'views' | 'likes'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  postsCount: number
  createdAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
}

// Tag Types
export interface Tag {
  id: string
  name: string
  slug: string
  postsCount: number
}

// Comment Types
export interface Comment {
  id: string
  content: string
  post: Post
  postId: string
  author: User
  authorId: string
  parent?: Comment
  parentId?: string
  replies?: Comment[]
  repliesCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCommentRequest {
  content: string
  parentId?: string
}

export interface UpdateCommentRequest {
  content: string
}

// Like Types
export interface Like {
  id: string
  user: User
  userId: string
  post: Post
  postId: string
  createdAt: string
}

// Upload Types
export interface UploadResponse {
  url: string
  publicId: string
  filename: string
  size: number
  mimeType: string
}

// Error Types
export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

// Query Parameters
export interface BaseQueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PostQueryParams extends BaseQueryParams {
  category?: string
  tag?: string
  author?: string
  published?: boolean
  search?: string
}

export interface CommentQueryParams extends BaseQueryParams {
  postId: string
}