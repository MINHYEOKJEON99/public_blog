import { z } from 'zod'

export const tagCreateSchema = z.object({
  name: z.string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters')
    .trim(),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .trim()
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
})

// Legacy alias
export const createTagSchema = z.object({
  body: tagCreateSchema,
})

export const tagUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .trim()
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .nullable()
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// Legacy alias
export const updateTagSchema = z.object({
  body: tagUpdateSchema,
  params: z.object({
    id: z.string()
      .min(1, 'Tag ID is required'),
  }),
})

export const getTagsSchema = z.object({
  query: z.object({
    search: z.string()
      .max(50, 'Search query must be less than 50 characters')
      .optional(),
    page: z.string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 50, 'Limit must be between 1 and 50')
      .default('10'),
    sortBy: z.enum(['name', 'created', 'updated', 'posts'])
      .default('name'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('asc'),
  }),
})

export const getTagSchema = z.object({
  params: z.object({
    slug: z.string()
      .min(1, 'Tag slug is required')
      .max(100, 'Slug must be less than 100 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  }),
})

export const deleteTagSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid tag ID format'),
  }),
})

export const getPopularTagsSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 20, 'Limit must be between 1 and 20')
      .default('10'),
  }),
})

export const searchTagsSchema = z.object({
  query: z.object({
    q: z.string()
      .min(1, 'Search query is required')
      .max(50, 'Search query must be less than 50 characters'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 20, 'Limit must be between 1 and 20')
      .default('10'),
  }),
})

export type CreateTagRequest = z.infer<typeof createTagSchema>['body']
export type UpdateTagRequest = z.infer<typeof updateTagSchema>['body']
export type GetTagsQuery = z.infer<typeof getTagsSchema>['query']
export type GetTagParams = z.infer<typeof getTagSchema>['params']
export type SearchTagsQuery = z.infer<typeof searchTagsSchema>['query']