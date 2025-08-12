import { z } from 'zod'

export const commentCreateSchema = z.object({
  content: z.string()
    .min(1, 'Comment content is required')
    .max(2000, 'Comment must be less than 2000 characters')
    .trim(),
  postId: z.string()
    .min(1, 'Post ID is required'),
  parentId: z.string()
    .optional(),
})

// Legacy alias
export const createCommentSchema = z.object({
  body: commentCreateSchema,
  params: z.object({
    postId: z.string()
      .min(1, 'Post ID is required'),
  }),
})

export const commentUpdateSchema = z.object({
  content: z.string()
    .min(1, 'Comment content is required')
    .max(2000, 'Comment must be less than 2000 characters')
    .trim(),
})

// Legacy alias
export const updateCommentSchema = z.object({
  body: commentUpdateSchema,
  params: z.object({
    id: z.string()
      .min(1, 'Comment ID is required'),
  }),
})

export const getCommentsSchema = z.object({
  query: z.object({
    postId: z.string()
      .cuid('Invalid post ID format'),
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
    sortBy: z.enum(['created', 'updated'])
      .default('created'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
    approved: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
  }),
})

export const getCommentSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid comment ID format'),
  }),
})

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid comment ID format'),
  }),
})

export const getRepliesSchema = z.object({
  params: z.object({
    commentId: z.string()
      .cuid('Invalid comment ID format'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine(val => val > 0 && val <= 20, 'Limit must be between 1 and 20')
      .default('10'),
  }),
})

export const replyToCommentSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Reply content is required')
      .max(2000, 'Reply must be less than 2000 characters')
      .trim(),
  }),
  params: z.object({
    parentId: z.string()
      .cuid('Invalid parent comment ID format'),
  }),
})

export const getMyCommentsSchema = z.object({
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
    sortBy: z.enum(['created', 'updated'])
      .default('created'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
})

export const reportCommentSchema = z.object({
  body: z.object({
    reason: z.string()
      .min(1, 'Report reason is required')
      .max(500, 'Reason must be less than 500 characters')
      .trim(),
  }),
  params: z.object({
    id: z.string()
      .cuid('Invalid comment ID format'),
  }),
})

export const approveCommentSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid comment ID format'),
  }),
})

export const rejectCommentSchema = z.object({
  params: z.object({
    id: z.string()
      .cuid('Invalid comment ID format'),
  }),
})

export type CreateCommentRequest = z.infer<typeof createCommentSchema>['body']
export type UpdateCommentRequest = z.infer<typeof updateCommentSchema>['body']
export type GetCommentsQuery = z.infer<typeof getCommentsSchema>['query']
export type GetRepliesQuery = z.infer<typeof getRepliesSchema>['query']
export type ReplyToCommentRequest = z.infer<typeof replyToCommentSchema>['body']
export type GetMyCommentsQuery = z.infer<typeof getMyCommentsSchema>['query']
export type ReportCommentRequest = z.infer<typeof reportCommentSchema>['body']