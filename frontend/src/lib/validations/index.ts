import { z } from 'zod'

// Auth Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
})

export const registerSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  username: z
    .string()
    .min(3, '사용자명은 최소 3자 이상이어야 합니다')
    .max(20, '사용자명은 최대 20자까지 가능합니다')
    .regex(/^[a-zA-Z0-9_]+$/, '사용자명은 영문, 숫자, 언더스코어만 가능합니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/(?=.*[a-z])/, '비밀번호에는 소문자가 포함되어야 합니다')
    .regex(/(?=.*[A-Z])/, '비밀번호에는 대문자가 포함되어야 합니다')
    .regex(/(?=.*\d)/, '비밀번호에는 숫자가 포함되어야 합니다'),
  confirmPassword: z.string(),
  name: z.string().max(50, '이름은 최대 50자까지 가능합니다').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

// Post Validation Schemas
export const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 최대 200자까지 가능합니다'),
  content: z.string().min(1, '내용을 입력해주세요'),
  excerpt: z.string().max(300, '요약은 최대 300자까지 가능합니다').optional(),
  coverImage: z.string().url('올바른 이미지 URL을 입력해주세요').optional(),
  published: z.boolean().default(false),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

// Comment Validation Schemas
export const commentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000, '댓글은 최대 1000자까지 가능합니다'),
  parentId: z.string().optional(),
})

// Profile Update Schema
export const profileUpdateSchema = z.object({
  name: z.string().max(50, '이름은 최대 50자까지 가능합니다').optional(),
  bio: z.string().max(500, '소개는 최대 500자까지 가능합니다').optional(),
  avatar: z.string().url('올바른 이미지 URL을 입력해주세요').optional(),
})

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요').max(50, '카테고리명은 최대 50자까지 가능합니다'),
  slug: z.string().min(1, '슬러그를 입력해주세요').max(50, '슬러그는 최대 50자까지 가능합니다'),
  description: z.string().max(200, '설명은 최대 200자까지 가능합니다').optional(),
})

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요').max(100, '검색어는 최대 100자까지 가능합니다'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['latest', 'oldest', 'popular', 'views']).default('latest'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
})