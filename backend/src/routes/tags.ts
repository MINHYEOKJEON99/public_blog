import { Router, Request, Response } from 'express'
import { TagService } from '@/services/tag'
import { auth, optionalAuth } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/error'
import {
  tagCreateSchema,
  tagUpdateSchema,
} from '@/validators/tag'
import { ApiResponse, AuthenticatedRequest } from '@/types'

const router = Router()

/**
 * Get all tags
 * GET /api/tags
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const includeEmpty = req.query.includeEmpty !== 'false'
    const sortBy = (req.query.sortBy as 'name' | 'postsCount' | 'createdAt') || 'name'
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    
    const result = await TagService.getTags({
      page,
      limit,
      includeEmpty,
      sortBy,
      sortOrder,
    })
    
    res.json({
      success: true,
      data: result.tags,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get popular tags
 * GET /api/tags/popular
 */
router.get(
  '/popular',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20
    const tags = await TagService.getPopularTags(limit)
    
    res.json({
      success: true,
      data: tags,
    } as ApiResponse)
  })
)

/**
 * Get trending tags
 * GET /api/tags/trending
 */
router.get(
  '/trending',
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7
    const limit = parseInt(req.query.limit as string) || 10
    const tags = await TagService.getTrendingTags(days, limit)
    
    res.json({
      success: true,
      data: tags,
    } as ApiResponse)
  })
)

/**
 * Get tag cloud
 * GET /api/tags/cloud
 */
router.get(
  '/cloud',
  asyncHandler(async (req: Request, res: Response) => {
    const minPostCount = parseInt(req.query.minPostCount as string) || 1
    const tagCloud = await TagService.getTagCloud(minPostCount)
    
    res.json({
      success: true,
      data: tagCloud,
    } as ApiResponse)
  })
)

/**
 * Search tags
 * GET /api/tags/search
 */
router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      } as ApiResponse)
    }
    
    const result = await TagService.searchTags(query, { page, limit })
    
    res.json({
      success: true,
      data: result.tags,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get tag statistics
 * GET /api/tags/stats
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await TagService.getTagStatistics()
    
    res.json({
      success: true,
      data: stats,
    } as ApiResponse)
  })
)

/**
 * Create a new tag
 * POST /api/tags
 */
router.post(
  '/',
  auth,
  validate(tagCreateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to create tags (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create tags',
      } as ApiResponse)
    }
    
    const tag = await TagService.createTag(req.body)
    
    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag,
    } as ApiResponse)
  })
)

/**
 * Batch create/update tags from names
 * POST /api/tags/batch
 */
router.post(
  '/batch',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { tagNames } = req.body
    
    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tag names array is required',
      } as ApiResponse)
    }
    
    // Validate each tag name
    for (const name of tagNames) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'All tag names must be non-empty strings',
        } as ApiResponse)
      }
    }
    
    const tags = await TagService.upsertTags(tagNames)
    
    res.json({
      success: true,
      message: 'Tags created/updated successfully',
      data: tags,
    } as ApiResponse)
  })
)

/**
 * Get tag by slug
 * GET /api/tags/slug/:slug
 */
router.get(
  '/slug/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params
    const tag = await TagService.getTagBySlug(slug)
    
    res.json({
      success: true,
      data: tag,
    } as ApiResponse)
  })
)

/**
 * Get tag by ID
 * GET /api/tags/:id
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const tag = await TagService.getTagById(id)
    
    res.json({
      success: true,
      data: tag,
    } as ApiResponse)
  })
)

/**
 * Update tag
 * PUT /api/tags/:id
 */
router.put(
  '/:id',
  auth,
  validate(tagUpdateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to update tags (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update tags',
      } as ApiResponse)
    }
    
    const { id } = req.params
    const tag = await TagService.updateTag(id, req.body)
    
    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: tag,
    } as ApiResponse)
  })
)

/**
 * Delete tag
 * DELETE /api/tags/:id
 */
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to delete tags (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete tags',
      } as ApiResponse)
    }
    
    const { id } = req.params
    await TagService.deleteTag(id)
    
    res.json({
      success: true,
      message: 'Tag deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Get related tags
 * GET /api/tags/:id/related
 */
router.get(
  '/:id/related',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const limit = parseInt(req.query.limit as string) || 10
    
    const tags = await TagService.getRelatedTags(id, limit)
    
    res.json({
      success: true,
      data: tags,
    } as ApiResponse)
  })
)

/**
 * Merge tags
 * POST /api/tags/:id/merge
 */
router.post(
  '/:id/merge',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to merge tags (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can merge tags',
      } as ApiResponse)
    }
    
    const sourceId = req.params.id
    const { targetId } = req.body
    
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Target tag ID is required',
      } as ApiResponse)
    }
    
    const tag = await TagService.mergeTags(sourceId, targetId)
    
    res.json({
      success: true,
      message: 'Tags merged successfully',
      data: tag,
    } as ApiResponse)
  })
)

export default router