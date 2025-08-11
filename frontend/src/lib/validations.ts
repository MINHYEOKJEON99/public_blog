import { z } from 'zod'

// User Validation Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('유효한 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('유효한 이메일 주소를 입력해주세요'),
  username: z
    .string()
    .min(1, '사용자명을 입력해주세요')
    .min(3, '사용자명은 최소 3자 이상이어야 합니다')
    .max(20, '사용자명은 최대 20자까지 가능합니다')
    .regex(/^[a-zA-Z0-9_]+$/, '사용자명은 영문, 숫자, 밑줄(_)만 사용 가능합니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대소문자, 숫자를 포함해야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  name: z
    .string()
    .max(50, '이름은 최대 50자까지 가능합니다')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

export const updateProfileSchema = z.object({
  name: z
    .string()
    .max(50, '이름은 최대 50자까지 가능합니다')
    .optional(),
  bio: z
    .string()
    .max(500, '소개는 최대 500자까지 가능합니다')
    .optional(),
  avatar: z
    .string()
    .url('유효한 URL을 입력해주세요')
    .optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: z
    .string()
    .min(1, '새 비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대소문자, 숫자를 포함해야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

// Post Validation Schemas
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 최대 200자까지 가능합니다'),
  content: z
    .string()
    .min(1, '내용을 입력해주세요')
    .min(10, '내용은 최소 10자 이상 입력해주세요'),
  excerpt: z
    .string()
    .max(300, '요약은 최대 300자까지 가능합니다')
    .optional(),
  coverImage: z
    .string()
    .url('유효한 이미지 URL을 입력해주세요')
    .optional(),
  published: z.boolean().default(false),
  categoryId: z
    .string()
    .optional(),
  tags: z
    .array(z.string())
    .max(5, '태그는 최대 5개까지 추가할 수 있습니다')
    .optional()
    .default([]),
})

export const updatePostSchema = createPostSchema.partial()

// Comment Validation Schemas
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, '댓글 내용을 입력해주세요')
    .min(2, '댓글은 최소 2자 이상 입력해주세요')
    .max(1000, '댓글은 최대 1000자까지 입력할 수 있습니다'),
  parentId: z
    .string()
    .optional(),
})

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, '댓글 내용을 입력해주세요')
    .min(2, '댓글은 최소 2자 이상 입력해주세요')
    .max(1000, '댓글은 최대 1000자까지 입력할 수 있습니다'),
})

// Category Validation Schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, '카테고리 이름을 입력해주세요')
    .max(50, '카테고리 이름은 최대 50자까지 가능합니다'),
  description: z
    .string()
    .max(200, '카테고리 설명은 최대 200자까지 가능합니다')
    .optional(),
})

// Search Validation Schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, '검색어를 입력해주세요')
    .max(100, '검색어는 최대 100자까지 입력 가능합니다'),
  category: z.string().optional(),
  tag: z.string().optional(),
  sortBy: z.enum(['created', 'updated', 'published', 'views', 'likes', 'title']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// File Upload Validation
export const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, '파일 크기는 5MB 이하여야 합니다')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      '지원하는 이미지 형식: JPEG, PNG, WebP'
    ),
})

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type CreatePostFormData = z.infer<typeof createPostSchema>
export type UpdatePostFormData = z.infer<typeof updatePostSchema>
export type CreateCommentFormData = z.infer<typeof createCommentSchema>
export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type UploadFormData = z.infer<typeof uploadSchema>