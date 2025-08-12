import { z } from 'zod'

export const categoryCreateSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .trim(),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .trim()
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
  icon: z.string()
    .max(50, 'Icon must be less than 50 characters')
    .optional(),
})

// Legacy alias
export const createCategorySchema = z.object({
  body: categoryCreateSchema,
})

export const categoryUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
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
  icon: z.string()
    .max(50, 'Icon must be less than 50 characters')
    .nullable()
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// Legacy alias
export const updateCategorySchema = z.object({
  body: categoryUpdateSchema,
  params: z.object({
    id: z.string()
      .min(1, 'Category ID is required'),
  }),
})

export const getCategoriesSchema = z.object({
  query: z.object({
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

export const getCategorySchema = z.object({
  params: z.object({
    slug: z.string()
      .min(1, 'Category slug is required')
      .max(100, 'Slug must be less than 100 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  }),
})

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid category ID format'),
  }),
})

export const getPopularCategoriesSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 20, 'Limit must be between 1 and 20')
      .default('10'),
  }),
})

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>['body']
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>['body']
export type GetCategoriesQuery = z.infer<typeof getCategoriesSchema>['query']
export type GetCategoryParams = z.infer<typeof getCategorySchema>['params']