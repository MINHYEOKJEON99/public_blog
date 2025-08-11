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
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  posts?: Post[]
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  posts?: Post[]
  createdAt: string
}

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
  createdAt: string
  updatedAt: string
}

export interface Like {
  id: string
  user: User
  userId: string
  post: Post
  postId: string
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
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

// Post Form Types
export interface PostFormData {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  categoryId?: string
  tags: string[]
}

// Comment Form Types
export interface CommentFormData {
  content: string
  parentId?: string
}