import { Router, Request, Response } from 'express'
import { AuthService } from '@/services/auth'
import { PostService } from '@/services/post'
import { CommentService } from '@/services/comment'
import { CategoryService } from '@/services/category'
import { TagService } from '@/services/tag'
import { auth } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/error'
import { strictRateLimit } from '@/middleware/security'
import { ApiResponse, AuthenticatedRequest } from '@/types'
import { db } from '@/utils/database'
import { Role } from '@prisma/client'

const router = Router()

// Admin middleware - check if user is admin
const adminOnly = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    } as ApiResponse)
  }
  next()
}

// Apply auth and admin check to all admin routes
router.use(auth)
router.use(adminOnly)

/**
 * Get admin dashboard statistics
 * GET /api/admin/stats
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalCategories,
      totalTags,
      publishedPosts,
      draftPosts,
      verifiedUsers,
      recentUsers,
      recentPosts,
      recentComments,
    ] = await Promise.all([
      db.user.count(),
      db.post.count(),
      db.comment.count(),
      db.category.count(),
      db.tag.count(),
      db.post.count({ where: { status: 'PUBLISHED' } }),
      db.post.count({ where: { status: 'DRAFT' } }),
      db.user.count({ where: { verified: true } }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          verified: true,
          role: true,
          createdAt: true,
        },
      }),
      db.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      }),
      db.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              username: true,
              name: true,
            },
          },
          post: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      }),
    ])

    const stats = {
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        totalCategories,
        totalTags,
        publishedPosts,
        draftPosts,
        verifiedUsers,
      },
      recent: {
        users: recentUsers,
        posts: recentPosts,
        comments: recentComments,
      },
    }
    
    res.json({
      success: true,
      data: stats,
    } as ApiResponse)
  })
)

/**
 * Get all users (admin view)
 * GET /api/admin/users
 */
router.get(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const role = req.query.role as Role
    const verified = req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (verified !== undefined) {
      where.verified = verified
    }
    
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          verified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    } as ApiResponse)
  })
)

/**
 * Update user role or verification status
 * PUT /api/admin/users/:id
 */
router.put(
  '/users/:id',
  strictRateLimit,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { role, verified } = req.body
    
    const updateData: any = {}
    
    if (role && Object.values(Role).includes(role)) {
      updateData.role = role
    }
    
    if (typeof verified === 'boolean') {
      updateData.verified = verified
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      } as ApiResponse)
    }
    
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        verified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    } as ApiResponse)
  })
)

/**
 * Delete user account (admin)
 * DELETE /api/admin/users/:id
 */
router.delete(
  '/users/:id',
  strictRateLimit,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    
    await db.user.delete({
      where: { id },
    })
    
    res.json({
      success: true,
      message: 'User deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Get all posts (admin view)
 * GET /api/admin/posts
 */
router.get(
  '/posts',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const status = req.query.status as any
    const authorId = req.query.authorId as string
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (authorId) {
      where.authorId = authorId
    }
    
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      db.post.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    } as ApiResponse)
  })
)

/**
 * Update post status or featured priority
 * PUT /api/admin/posts/:id
 */
router.put(
  '/posts/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, featuredPostPriority } = req.body
    
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date()
      } else if (status === 'DRAFT') {
        updateData.publishedAt = null
      }
    }
    
    if (typeof featuredPostPriority === 'number') {
      updateData.featuredPostPriority = featuredPostPriority
    }
    
    const post = await PostService.getPostById(id)
    const updatedPost = await PostService.updatePost(id, post.author.id, updateData)
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    } as ApiResponse)
  })
)

/**
 * Delete post (admin)
 * DELETE /api/admin/posts/:id
 */
router.delete(
  '/posts/:id',
  strictRateLimit,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    
    await db.post.delete({
      where: { id },
    })
    
    res.json({
      success: true,
      message: 'Post deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Get all comments (admin view)
 * GET /api/admin/comments
 */
router.get(
  '/comments',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const postId = req.query.postId as string
    const authorId = req.query.authorId as string
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (search) {
      where.content = { contains: search, mode: 'insensitive' }
    }
    
    if (postId) {
      where.postId = postId
    }
    
    if (authorId) {
      where.authorId = authorId
    }
    
    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      }),
      db.comment.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    } as ApiResponse)
  })
)

/**
 * Moderate comment (approve/hide/delete)
 * PUT /api/admin/comments/:id/moderate
 */
router.put(
  '/comments/:id/moderate',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { action } = req.body
    
    if (!['approve', 'hide', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation action',
      } as ApiResponse)
    }
    
    await CommentService.moderateComment(id, action)
    
    res.json({
      success: true,
      message: `Comment ${action}d successfully`,
    } as ApiResponse)
  })
)

/**
 * Clean up expired tokens
 * POST /api/admin/cleanup/tokens
 */
router.post(
  '/cleanup/tokens',
  asyncHandler(async (req: Request, res: Response) => {
    await AuthService.cleanupExpiredTokens()
    
    res.json({
      success: true,
      message: 'Token cleanup completed',
    } as ApiResponse)
  })
)

/**
 * Get system information
 * GET /api/admin/system
 */
router.get(
  '/system',
  asyncHandler(async (req: Request, res: Response) => {
    const systemInfo = {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        cpu: process.cpuUsage(),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString(),
      },
    }
    
    res.json({
      success: true,
      data: systemInfo,
    } as ApiResponse)
  })
)

/**
 * Get content statistics for dashboard
 * GET /api/admin/content-stats
 */
router.get(
  '/content-stats',
  asyncHandler(async (req: Request, res: Response) => {
    const [
      categoryStats,
      tagStats,
      postStats,
      commentStats,
    ] = await Promise.all([
      CategoryService.getCategoryStatistics(),
      TagService.getTagStatistics(),
      db.post.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      db.comment.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ])
    
    const stats = {
      categories: categoryStats,
      tags: tagStats,
      posts: {
        byStatus: postStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status
          return acc
        }, {} as any),
      },
      comments: {
        last30Days: commentStats.length,
      },
    }
    
    res.json({
      success: true,
      data: stats,
    } as ApiResponse)
  })
)

export default router