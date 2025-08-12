import { z } from 'zod'

export const postCreateSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be less than 50,000 characters'),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  coverImage: z.string()
    .max(255, 'Cover image URL must be less than 255 characters')
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED'])
    .default('DRAFT'),
  categories: z.array(z.string()
    .min(1, 'Category name cannot be empty')
    .max(50, 'Category name must be less than 50 characters')
    .trim())
    .max(5, 'Maximum 5 categories allowed')
    .optional(),
  tags: z.array(z.string()
    .min(1, 'Tag name cannot be empty')
    .max(50, 'Tag name must be less than 50 characters')
    .trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  seoTitle: z.string()
    .max(60, 'SEO title must be less than 60 characters')
    .optional(),
  seoDescription: z.string()
    .max(160, 'SEO description must be less than 160 characters')
    .optional(),
  featuredPostPriority: z.number()
    .min(0)
    .max(100)
    .default(0),
})

// Legacy alias
export const createPostSchema = z.object({ body: postCreateSchema })

export const postUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be less than 50,000 characters')
    .optional(),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  coverImage: z.string()
    .max(255, 'Cover image URL must be less than 255 characters')
    .nullable()
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED'])
    .optional(),
  categories: z.array(z.string()
    .min(1, 'Category name cannot be empty')
    .max(50, 'Category name must be less than 50 characters')
    .trim())
    .max(5, 'Maximum 5 categories allowed')
    .optional(),
  tags: z.array(z.string()
    .min(1, 'Tag name cannot be empty')
    .max(50, 'Tag name must be less than 50 characters')
    .trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  seoTitle: z.string()
    .max(60, 'SEO title must be less than 60 characters')
    .optional(),
  seoDescription: z.string()
    .max(160, 'SEO description must be less than 160 characters')
    .optional(),
  featuredPostPriority: z.number()
    .min(0)
    .max(100)
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// Legacy alias
export const updatePostSchema = z.object({ 
  body: postUpdateSchema,
  params: z.object({
    id: z.string().min(1, 'Post ID is required'),
  }),
})

export const getPostsSchema = z.object({
  query: z.object({
    category: z.string()
      .max(100, 'Category must be less than 100 characters')
      .optional(),
    tag: z.string()
      .max(50, 'Tag must be less than 50 characters')
      .optional(),
    author: z.string()
      .max(50, 'Author must be less than 50 characters')
      .optional(),
    published: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
    search: z.string()
      .max(100, 'Search query must be less than 100 characters')
      .optional(),
    sortBy: z.enum(['created', 'updated', 'published', 'views', 'likes'])
      .default('created'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
    page: z.string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .default('10'),
  }),
})

export const getPostSchema = z.object({
  params: z.object({
    slug: z.string()
      .min(1, 'Post slug is required')
      .max(200, 'Slug must be less than 200 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  }),
})

export const deletePostSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid post ID format'),
  }),
})

export const likePostSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid post ID format'),
  }),
})

export const incrementViewSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid post ID format'),
  }),
})

export const searchPostsSchema = z.object({
  query: z.object({
    search: z.string()
      .min(1, 'Search query is required')
      .max(100, 'Search query must be less than 100 characters'),
    category: z.string()
      .max(100, 'Category must be less than 100 characters')
      .optional(),
    tag: z.string()
      .max(50, 'Tag must be less than 50 characters')
      .optional(),
    author: z.string()
      .max(50, 'Author must be less than 50 characters')
      .optional(),
    sortBy: z.enum(['created', 'updated', 'published', 'views', 'likes'])
      .default('created'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
    page: z.string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .default('10'),
  }),
})

export const getRelatedPostsSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid post ID format'),
  }),
})

export const getPopularPostsSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 20, 'Limit must be between 1 and 20')
      .default('10'),
  }),
})

export const getRecentPostsSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 20, 'Limit must be between 1 and 20')
      .default('10'),
  }),
})

// Search schema for route compatibility
export const postSearchSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .transform(Number)
    .refine(val => val > 0, 'Page must be greater than 0')
    .default('1')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .transform(Number)
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default('10')
    .optional(),
  search: z.string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
  category: z.string()
    .max(100, 'Category must be less than 100 characters')
    .optional(),
  tag: z.string()
    .max(50, 'Tag must be less than 50 characters')
    .optional(),
  author: z.string()
    .max(50, 'Author must be less than 50 characters')
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED'])
    .optional(),
  featured: z.string()
    .transform(val => val === 'true')
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'views', 'likes', 'comments'])
    .default('createdAt')
    .optional(),
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc')
    .optional(),
})

export type CreatePostRequest = z.infer<typeof createPostSchema>['body']
export type UpdatePostRequest = z.infer<typeof updatePostSchema>['body']
export type GetPostsQuery = z.infer<typeof getPostsSchema>['query']
export type GetPostParams = z.infer<typeof getPostSchema>['params']
export type SearchPostsQuery = z.infer<typeof searchPostsSchema>['query']
export type PostSearchQuery = z.infer<typeof postSearchSchema>