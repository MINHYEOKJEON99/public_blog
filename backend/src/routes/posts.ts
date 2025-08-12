import { Router, Request, Response } from 'express'
import { PostService } from '@/services/post'
import { auth, optionalAuth } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/error'
import { generalRateLimit } from '@/middleware/security'
import {
  postCreateSchema,
  postUpdateSchema,
  postSearchSchema,
} from '@/validators/post'
import { ApiResponse, AuthenticatedRequest, PostSearchParams } from '@/types'

const router = Router()

/**
 * Get all posts with filtering and pagination
 * GET /api/posts
 */
router.get(
  '/',
  optionalAuth,
  validate(postSearchSchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const searchParams: PostSearchParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      category: req.query.category as string,
      tag: req.query.tag as string,
      author: req.query.author as string,
      status: req.query.status as any,
      featured: req.query.featured ? req.query.featured === 'true' : undefined,
      sortBy: req.query.sortBy as any || 'createdAt',
      sortOrder: req.query.sortOrder as any || 'desc',
    }

    const result = await PostService.getPosts(searchParams)
    
    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get featured posts
 * GET /api/posts/featured
 */
router.get(
  '/featured',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5
    const posts = await PostService.getFeaturedPosts(limit)
    
    res.json({
      success: true,
      data: posts,
    } as ApiResponse)
  })
)

/**
 * Get trending posts
 * GET /api/posts/trending
 */
router.get(
  '/trending',
  asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7
    const limit = parseInt(req.query.limit as string) || 10
    const posts = await PostService.getTrendingPosts(days, limit)
    
    res.json({
      success: true,
      data: posts,
    } as ApiResponse)
  })
)

/**
 * Search posts
 * GET /api/posts/search
 */
router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      } as ApiResponse)
    }
    
    const result = await PostService.searchPosts(query, { page, limit })
    
    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Create a new post
 * POST /api/posts
 */
router.post(
  '/',
  auth,
  generalRateLimit,
  validate(postCreateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const post = await PostService.createPost(req.user!.id, req.body)
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    } as ApiResponse)
  })
)

/**
 * Get post by slug
 * GET /api/posts/slug/:slug
 */
router.get(
  '/slug/:slug',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { slug } = req.params
    const userId = req.user?.id
    
    const post = await PostService.getPostBySlug(slug, userId)
    
    res.json({
      success: true,
      data: post,
    } as ApiResponse)
  })
)

/**
 * Get post by ID
 * GET /api/posts/:id
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const authorId = req.user?.id
    
    const post = await PostService.getPostById(id, authorId)
    
    res.json({
      success: true,
      data: post,
    } as ApiResponse)
  })
)

/**
 * Update post
 * PUT /api/posts/:id
 */
router.put(
  '/:id',
  auth,
  validate(postUpdateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const post = await PostService.updatePost(id, req.user!.id, req.body)
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    } as ApiResponse)
  })
)

/**
 * Delete post
 * DELETE /api/posts/:id
 */
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    await PostService.deletePost(id, req.user!.id)
    
    res.json({
      success: true,
      message: 'Post deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Toggle post like
 * POST /api/posts/:id/like
 */
router.post(
  '/:id/like',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const result = await PostService.toggleLike(id, req.user!.id)
    
    res.json({
      success: true,
      message: result.liked ? 'Post liked' : 'Post unliked',
      data: result,
    } as ApiResponse)
  })
)

/**
 * Get related posts
 * GET /api/posts/:id/related
 */
router.get(
  '/:id/related',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const limit = parseInt(req.query.limit as string) || 4
    
    const posts = await PostService.getRelatedPosts(id, limit)
    
    res.json({
      success: true,
      data: posts,
    } as ApiResponse)
  })
)

/**
 * Get post statistics
 * GET /api/posts/:id/stats
 */
router.get(
  '/:id/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const stats = await PostService.getPostStatistics(id)
    
    res.json({
      success: true,
      data: stats,
    } as ApiResponse)
  })
)

/**
 * Get posts by author
 * GET /api/posts/author/:username
 */
router.get(
  '/author/:username',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    const searchParams: PostSearchParams = {
      page,
      limit,
      author: username,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }
    
    const result = await PostService.getPosts(searchParams)
    
    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get posts by category
 * GET /api/posts/category/:slug
 */
router.get(
  '/category/:slug',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    const searchParams: PostSearchParams = {
      page,
      limit,
      category: slug,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }
    
    const result = await PostService.getPosts(searchParams)
    
    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get posts by tag
 * GET /api/posts/tag/:slug
 */
router.get(
  '/tag/:slug',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    const searchParams: PostSearchParams = {
      page,
      limit,
      tag: slug,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }
    
    const result = await PostService.getPosts(searchParams)
    
    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Duplicate post (create draft copy)
 * POST /api/posts/:id/duplicate
 */
router.post(
  '/:id/duplicate',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    
    // Get the original post
    const originalPost = await PostService.getPostById(id, req.user!.id)
    
    // Create a duplicate with DRAFT status
    const duplicateData = {
      title: `${originalPost.title} (Copy)`,
      content: originalPost.content,
      excerpt: originalPost.excerpt,
      coverImage: originalPost.coverImage,
      categories: originalPost.categories.map(c => c.name),
      tags: originalPost.tags.map(t => t.name),
      seoTitle: originalPost.seoTitle,
      seoDescription: originalPost.seoDescription,
      status: 'DRAFT' as const,
    }
    
    const duplicatedPost = await PostService.createPost(req.user!.id, duplicateData)
    
    res.status(201).json({
      success: true,
      message: 'Post duplicated successfully',
      data: duplicatedPost,
    } as ApiResponse)
  })
)

/**
 * Publish draft post
 * POST /api/posts/:id/publish
 */
router.post(
  '/:id/publish',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    
    const post = await PostService.updatePost(id, req.user!.id, {
      status: 'PUBLISHED',
    })
    
    res.json({
      success: true,
      message: 'Post published successfully',
      data: post,
    } as ApiResponse)
  })
)

/**
 * Unpublish post (make it draft)
 * POST /api/posts/:id/unpublish
 */
router.post(
  '/:id/unpublish',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    
    const post = await PostService.updatePost(id, req.user!.id, {
      status: 'DRAFT',
    })
    
    res.json({
      success: true,
      message: 'Post unpublished successfully',
      data: post,
    } as ApiResponse)
  })
)

export default router