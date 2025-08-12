import { Router, Request, Response } from 'express'
import { CommentService } from '@/services/comment'
import { auth, optionalAuth } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/error'
import { authRateLimit } from '@/middleware/security'
import {
  commentCreateSchema,
  commentUpdateSchema,
} from '@/validators/comment'
import { ApiResponse, AuthenticatedRequest } from '@/types'

const router = Router()

/**
 * Get comments for a post
 * GET /api/comments/post/:postId
 */
router.get(
  '/post/:postId',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const sortBy = (req.query.sortBy as 'createdAt' | 'likes') || 'createdAt'
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    
    const result = await CommentService.getPostComments(postId, {
      page,
      limit,
      sortBy,
      sortOrder,
    })
    
    res.json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get replies for a comment
 * GET /api/comments/:commentId/replies
 */
router.get(
  '/:commentId/replies',
  asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    const result = await CommentService.getCommentReplies(commentId, {
      page,
      limit,
    })
    
    res.json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get a single comment
 * GET /api/comments/:id
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id
    
    const comment = await CommentService.getCommentById(id, userId)
    
    res.json({
      success: true,
      data: comment,
    } as ApiResponse)
  })
)

/**
 * Create a new comment
 * POST /api/comments
 */
router.post(
  '/',
  auth,
  authRateLimit,
  validate(commentCreateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const comment = await CommentService.createComment(req.user!.id, req.body)
    
    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    } as ApiResponse)
  })
)

/**
 * Update a comment
 * PUT /api/comments/:id
 */
router.put(
  '/:id',
  auth,
  validate(commentUpdateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const comment = await CommentService.updateComment(id, req.user!.id, req.body)
    
    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    } as ApiResponse)
  })
)

/**
 * Delete a comment
 * DELETE /api/comments/:id
 */
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    await CommentService.deleteComment(id, req.user!.id)
    
    res.json({
      success: true,
      message: 'Comment deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Toggle comment like
 * POST /api/comments/:id/like
 */
router.post(
  '/:id/like',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const result = await CommentService.toggleLike(id, req.user!.id)
    
    res.json({
      success: true,
      message: result.liked ? 'Comment liked' : 'Comment unliked',
      data: result,
    } as ApiResponse)
  })
)

/**
 * Get user's comments
 * GET /api/comments/user/:userId
 */
router.get(
  '/user/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    const result = await CommentService.getUserComments(userId, {
      page,
      limit,
    })
    
    res.json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get current user's comments
 * GET /api/comments/me
 */
router.get(
  '/me',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    const result = await CommentService.getUserComments(req.user!.id, {
      page,
      limit,
    })
    
    res.json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get recent comments (for admin dashboard)
 * GET /api/comments/recent
 */
router.get(
  '/recent',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10
    const comments = await CommentService.getRecentComments(limit)
    
    res.json({
      success: true,
      data: comments,
    } as ApiResponse)
  })
)

/**
 * Get comment statistics
 * GET /api/comments/:id/stats
 */
router.get(
  '/:id/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const stats = await CommentService.getCommentStatistics(id)
    
    res.json({
      success: true,
      data: stats,
    } as ApiResponse)
  })
)

/**
 * Report a comment
 * POST /api/comments/:id/report
 */
router.post(
  '/:id/report',
  auth,
  authRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { reason } = req.body
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Report reason must be at least 10 characters long',
      } as ApiResponse)
    }
    
    await CommentService.reportComment(id, req.user!.id, reason)
    
    res.json({
      success: true,
      message: 'Comment reported successfully',
    } as ApiResponse)
  })
)

export default router