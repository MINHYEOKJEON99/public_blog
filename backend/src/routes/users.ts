import { Router, Request, Response } from 'express'
import { AuthService } from '@/services/auth'
import { PostService } from '@/services/post'
import { CommentService } from '@/services/comment'
import { auth, optionalAuth } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/error'
import { uploadAvatar } from '@/middleware/upload'
import { authRateLimit } from '@/middleware/security'
import { updateUserSchema } from '@/validators/auth'
import { ApiResponse, AuthenticatedRequest, PostSearchParams } from '@/types'
import { db } from '@/utils/database'

const router = Router()

/**
 * Get all users (public profiles)
 * GET /api/users
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const sortBy = (req.query.sortBy as 'username' | 'name' | 'createdAt') || 'username'
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {
      verified: true, // Only show verified users in public listing
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          username: true,
          name: true,
          bio: true,
          avatar: true,
          verified: true,
          createdAt: true,
          _count: {
            select: {
              posts: {
                where: { status: 'PUBLISHED' },
              },
              comments: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      verified: user.verified,
      createdAt: user.createdAt,
      postsCount: user._count.posts,
      commentsCount: user._count.comments,
    }))
    
    res.json({
      success: true,
      data: formattedUsers,
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
 * Get user by username (public profile)
 * GET /api/users/username/:username
 */
router.get(
  '/username/:username',
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params
    
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
            comments: true,
            likes: true,
          },
        },
      },
    })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      } as ApiResponse)
    }
    
    const userProfile = {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      verified: user.verified,
      createdAt: user.createdAt,
      postsCount: user._count.posts,
      commentsCount: user._count.comments,
      likesCount: user._count.likes,
    }
    
    res.json({
      success: true,
      data: userProfile,
    } as ApiResponse)
  })
)

/**
 * Get user by ID (public profile)
 * GET /api/users/:id
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
            comments: true,
            likes: true,
          },
        },
      },
    })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      } as ApiResponse)
    }
    
    const userProfile = {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      verified: user.verified,
      createdAt: user.createdAt,
      postsCount: user._count.posts,
      commentsCount: user._count.comments,
      likesCount: user._count.likes,
    }
    
    res.json({
      success: true,
      data: userProfile,
    } as ApiResponse)
  })
)

/**
 * Get user's posts
 * GET /api/users/:id/posts
 */
router.get(
  '/:id/posts',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as any
    
    // Check if requesting own posts or public posts
    const isOwnProfile = req.user?.id === id
    
    const searchParams: PostSearchParams = {
      page,
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }
    
    // If viewing own profile, can see all posts including drafts
    if (isOwnProfile && status) {
      searchParams.status = status
    } else {
      // Public view - only published posts
      searchParams.status = 'PUBLISHED'
    }
    
    // Get user to verify they exist
    const user = await db.user.findUnique({
      where: { id },
      select: { username: true },
    })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      } as ApiResponse)
    }
    
    searchParams.author = user.username
    
    const result = await PostService.getPosts(searchParams)
    
    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    } as ApiResponse)
  })
)

/**
 * Get user's comments
 * GET /api/users/:id/comments
 */
router.get(
  '/:id/comments',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    
    const result = await CommentService.getUserComments(id, {
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
 * Update user profile
 * PUT /api/users/profile
 */
router.put(
  '/profile',
  auth,
  validate(updateUserSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const updatedUser = await AuthService.updateProfile(req.user!.id, req.body)
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    } as ApiResponse)
  })
)

/**
 * Upload user avatar
 * POST /api/users/avatar
 */
router.post(
  '/avatar',
  auth,
  uploadAvatar,
  authRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file uploaded',
      } as ApiResponse)
    }
    
    // Generate avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    
    // Update user's avatar
    const updatedUser = await AuthService.updateProfile(req.user!.id, {
      avatar: avatarUrl,
    })
    
    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: avatarUrl,
        user: updatedUser,
      },
    } as ApiResponse)
  })
)

/**
 * Remove user avatar
 * DELETE /api/users/avatar
 */
router.delete(
  '/avatar',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const updatedUser = await AuthService.updateProfile(req.user!.id, {
      avatar: null,
    })
    
    res.json({
      success: true,
      message: 'Avatar removed successfully',
      data: updatedUser,
    } as ApiResponse)
  })
)

/**
 * Follow a user
 * POST /api/users/:id/follow
 */
router.post(
  '/:id/follow',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const followerId = req.user!.id
    
    if (id === followerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      } as ApiResponse)
    }
    
    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true },
    })
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      } as ApiResponse)
    }
    
    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    })
    
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user',
      } as ApiResponse)
    }
    
    // Create follow relationship
    await db.follow.create({
      data: {
        followerId,
        followingId: id,
      },
    })
    
    res.json({
      success: true,
      message: 'User followed successfully',
    } as ApiResponse)
  })
)

/**
 * Unfollow a user
 * DELETE /api/users/:id/follow
 */
router.delete(
  '/:id/follow',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const followerId = req.user!.id
    
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    })
    
    if (!existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user',
      } as ApiResponse)
    }
    
    await db.follow.delete({
      where: { id: existingFollow.id },
    })
    
    res.json({
      success: true,
      message: 'User unfollowed successfully',
    } as ApiResponse)
  })
)

/**
 * Get user's followers
 * GET /api/users/:id/followers
 */
router.get(
  '/:id/followers',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    
    const [followers, total] = await Promise.all([
      db.follow.findMany({
        where: { followingId: id },
        skip,
        take: limit,
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.follow.count({ where: { followingId: id } }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const formattedFollowers = followers.map(follow => follow.follower)
    
    res.json({
      success: true,
      data: formattedFollowers,
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
 * Get user's following
 * GET /api/users/:id/following
 */
router.get(
  '/:id/following',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    
    const [following, total] = await Promise.all([
      db.follow.findMany({
        where: { followerId: id },
        skip,
        take: limit,
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.follow.count({ where: { followerId: id } }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    const formattedFollowing = following.map(follow => follow.following)
    
    res.json({
      success: true,
      data: formattedFollowing,
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
 * Check if current user follows target user
 * GET /api/users/:id/follow-status
 */
router.get(
  '/:id/follow-status',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const followerId = req.user!.id
    
    const isFollowing = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    })
    
    res.json({
      success: true,
      data: {
        isFollowing: !!isFollowing,
      },
    } as ApiResponse)
  })
)

export default router