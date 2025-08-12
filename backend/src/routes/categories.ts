import { Router, Request, Response } from 'express'
import { CategoryService } from '@/services/category'
import { auth, optionalAuth } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/error'
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from '@/validators/category'
import { ApiResponse, AuthenticatedRequest } from '@/types'

const router = Router()

/**
 * Get all categories
 * GET /api/categories
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const includeEmpty = req.query.includeEmpty !== 'false'
    const sortBy = (req.query.sortBy as 'name' | 'postsCount' | 'createdAt') || 'name'
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    
    const result = await CategoryService.getCategories({
      page,
      limit,
      includeEmpty,
      sortBy,
      sortOrder,
    })
    
    res.json({
      success: true,
      data: result.categories,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get popular categories
 * GET /api/categories/popular
 */
router.get(
  '/popular',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10
    const categories = await CategoryService.getPopularCategories(limit)
    
    res.json({
      success: true,
      data: categories,
    } as ApiResponse)
  })
)

/**
 * Search categories
 * GET /api/categories/search
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
    
    const result = await CategoryService.searchCategories(query, { page, limit })
    
    res.json({
      success: true,
      data: result.categories,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get category statistics
 * GET /api/categories/stats
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await CategoryService.getCategoryStatistics()
    
    res.json({
      success: true,
      data: stats,
    } as ApiResponse)
  })
)

/**
 * Create a new category
 * POST /api/categories
 */
router.post(
  '/',
  auth,
  validate(categoryCreateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to create categories (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create categories',
      } as ApiResponse)
    }
    
    const category = await CategoryService.createCategory(req.body)
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    } as ApiResponse)
  })
)

/**
 * Get category by slug
 * GET /api/categories/slug/:slug
 */
router.get(
  '/slug/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params
    const category = await CategoryService.getCategoryBySlug(slug)
    
    res.json({
      success: true,
      data: category,
    } as ApiResponse)
  })
)

/**
 * Get category by ID
 * GET /api/categories/:id
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const category = await CategoryService.getCategoryById(id)
    
    res.json({
      success: true,
      data: category,
    } as ApiResponse)
  })
)

/**
 * Update category
 * PUT /api/categories/:id
 */
router.put(
  '/:id',
  auth,
  validate(categoryUpdateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to update categories (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update categories',
      } as ApiResponse)
    }
    
    const { id } = req.params
    const category = await CategoryService.updateCategory(id, req.body)
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    } as ApiResponse)
  })
)

/**
 * Delete category
 * DELETE /api/categories/:id
 */
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to delete categories (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete categories',
      } as ApiResponse)
    }
    
    const { id } = req.params
    await CategoryService.deleteCategory(id)
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Merge categories
 * POST /api/categories/:id/merge
 */
router.post(
  '/:id/merge',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check if user has permission to merge categories (admin only)
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can merge categories',
      } as ApiResponse)
    }
    
    const sourceId = req.params.id
    const { targetId } = req.body
    
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Target category ID is required',
      } as ApiResponse)
    }
    
    const category = await CategoryService.mergeCategories(sourceId, targetId)
    
    res.json({
      success: true,
      message: 'Categories merged successfully',
      data: category,
    } as ApiResponse)
  })
)

export default router