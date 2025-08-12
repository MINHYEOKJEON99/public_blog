import { Request } from 'express'
import { User, Role } from '@prisma/client'

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: User
}

// API Response Types
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
  user: UserResponse
  token: string
  refreshToken: string
}

export interface UserResponse {
  id: string
  email: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  role: Role
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UpdateUserRequest {
  name?: string
  bio?: string
  avatar?: string
}

// Post Types
export interface PostResponse {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  status: 'DRAFT' | 'PUBLISHED'
  viewCount: number
  author: UserResponse
  authorId: string
  category?: CategoryResponse
  categoryId?: string
  tags: TagResponse[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  // SEO fields
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
}

export interface PostRequest {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  status?: 'DRAFT' | 'PUBLISHED'
  categoryId?: string
  categories?: string[]
  tags?: string[]
  // SEO fields
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
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
export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  postsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  color?: string
  icon?: string
}

// Tag Types
export interface TagResponse {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  postsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateTagRequest {
  name: string
  description?: string
  color?: string
}

export interface UpdateTagRequest {
  name?: string
  description?: string
  color?: string
}

// Comment Types
export interface CommentResponse {
  id: string
  content: string
  postId: string
  author: UserResponse
  authorId: string
  parent?: CommentResponse
  parentId?: string
  replies?: CommentResponse[]
  repliesCount: number
  likesCount: number
  isLiked: boolean
  approved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CommentRequest {
  postId: string
  content: string
  parentId?: string
}

export interface CreateCommentRequest {
  content: string
  parentId?: string
}

export interface UpdateCommentRequest {
  content: string
}

// Upload Types
export interface UploadResponse {
  url: string
  filename: string
  originalName: string
  size: number
  mimeType: string
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
  postId?: string
  approved?: boolean
}

// JWT Payload
export interface JwtPayload {
  userId: string
  email: string
  role: Role
}

// Error Types
export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

// Email Types
export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

// File Upload Types
export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
  uploadDir: string
}

// Admin Types
export interface AdminStatsResponse {
  users: {
    total: number
    verified: number
    unverified: number
    admins: number
  }
  posts: {
    total: number
    published: number
    drafts: number
    thisMonth: number
  }
  comments: {
    total: number
    approved: number
    pending: number
    thisMonth: number
  }
  categories: {
    total: number
  }
  tags: {
    total: number
  }
}

export interface AdminUserResponse extends UserResponse {
  emailVerifiedAt?: Date
  lastLoginAt?: Date
  loginCount: number
}

// Like Types
export interface LikeResponse {
  id: string
  userId: string
  postId?: string
  commentId?: string
  createdAt: Date
}

// Analytics Types
export interface PopularPostsResponse {
  posts: PostResponse[]
  period: 'day' | 'week' | 'month' | 'year'
}

// Search Types
export interface SearchResponse<T> {
  results: T[]
  total: number
  query: string
  suggestions?: string[]
}

// Notification Types
export interface NotificationResponse {
  id: string
  userId: string
  type: 'COMMENT' | 'LIKE' | 'REPLY' | 'MENTION' | 'SYSTEM'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: Date
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: Date
  uptime: number
  database: 'connected' | 'disconnected'
  redis?: 'connected' | 'disconnected'
  memory: {
    used: number
    total: number
  }
  version: string
}