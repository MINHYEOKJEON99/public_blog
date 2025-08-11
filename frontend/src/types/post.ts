import { User } from './user'

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
  likesCount: number
  commentsCount: number
  isLiked: boolean
  readingTime: number // in minutes
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface PostSummary {
  id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: string
  published: boolean
  viewCount: number
  author: Pick<User, 'id' | 'username' | 'name' | 'avatar'>
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  readingTime: number
  createdAt: string
  publishedAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  postsCount: number
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  postsCount: number
}

export interface Comment {
  id: string
  content: string
  author: Pick<User, 'id' | 'username' | 'name' | 'avatar'>
  authorId: string
  postId: string
  parentId?: string
  replies?: Comment[]
  repliesCount: number
  createdAt: string
  updatedAt: string
}

export interface Like {
  id: string
  userId: string
  postId: string
  createdAt: string
}

export interface PostStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
}

export type PostSortBy = 'created' | 'updated' | 'published' | 'views' | 'likes' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface PostFilters {
  category?: string
  tag?: string
  author?: string
  published?: boolean
  search?: string
  sortBy?: PostSortBy
  sortOrder?: SortOrder
  dateFrom?: string
  dateTo?: string
}