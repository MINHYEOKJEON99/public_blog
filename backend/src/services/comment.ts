import { Comment, User, Post } from '@prisma/client'
import { db } from '@/utils/database'
import { AppError } from '@/middleware/error'
import { EmailService } from './email'
import config from '@/utils/config'
import {
  CommentRequest,
  CommentResponse,
  CommentsResponse,
  CommentWithRelations,
  CommentUpdateRequest,
  PaginationOptions,
} from '@/types'

export class CommentService {
  /**
   * Create a new comment
   */
  static async createComment(userId: string, data: CommentRequest): Promise<CommentResponse> {
    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: data.postId },
      include: {
        author: {
          select: { id: true, email: true, name: true, username: true },
        },
      },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    // Check if parent comment exists (for replies)
    if (data.parentId) {
      const parentComment = await db.comment.findFirst({
        where: {
          id: data.parentId,
          postId: data.postId,
        },
      })

      if (!parentComment) {
        throw new AppError('Parent comment not found', 404)
      }
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        authorId: userId,
        parentId: data.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    // Send notification email to post author (if not the same user)
    if (post.author.id !== userId && post.author.email) {
      try {
        const commenter = await db.user.findUnique({
          where: { id: userId },
          select: { name: true, username: true },
        })

        if (commenter) {
          const postUrl = `${config.FRONTEND_URL}/posts/${post.slug}`
          await EmailService.sendCommentNotification(
            post.author.email,
            post.author.name || post.author.username,
            post.title,
            commenter.name || commenter.username,
            data.content,
            postUrl
          )
        }
      } catch (error) {
        console.error('Failed to send comment notification:', error)
      }
    }

    return this.formatCommentResponse(comment as CommentWithRelations)
  }

  /**
   * Get comments for a post
   */
  static async getPostComments(
    postId: string, 
    options: PaginationOptions & { sortBy?: 'createdAt' | 'likes'; sortOrder?: 'asc' | 'desc' } = {}
  ): Promise<CommentsResponse> {
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options

    const skip = (page - 1) * limit

    // Build order by clause
    const orderBy: any = {}
    if (sortBy === 'likes') {
      orderBy.likes = { _count: sortOrder }
    } else {
      orderBy[sortBy] = sortOrder
    }

    const where = {
      postId,
      parentId: null, // Only get top-level comments
    }

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            take: 3, // Limit initial replies
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  replies: true,
                  likes: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      }),
      db.comment.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    
    return {
      comments: comments.map(comment => this.formatCommentResponse(comment as CommentWithRelations)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Get replies for a comment
   */
  static async getCommentReplies(
    commentId: string,
    options: PaginationOptions = {}
  ): Promise<CommentsResponse> {
    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const where = {
      parentId: commentId,
    }

    const [replies, total] = await Promise.all([
      db.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          parent: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      }),
      db.comment.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    
    return {
      comments: replies.map(reply => this.formatCommentResponse(reply as CommentWithRelations)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Get a single comment by ID
   */
  static async getCommentById(id: string, userId?: string): Promise<CommentResponse> {
    const comment = await db.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
        likes: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    const commentResponse = this.formatCommentResponse(comment as CommentWithRelations)
    
    // Add like status if user is provided
    if (userId && 'likes' in comment) {
      commentResponse.isLiked = Array.isArray(comment.likes) && comment.likes.length > 0
    }

    return commentResponse
  }

  /**
   * Update a comment
   */
  static async updateComment(
    id: string, 
    userId: string, 
    data: CommentUpdateRequest
  ): Promise<CommentResponse> {
    const comment = await db.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    if (comment.authorId !== userId) {
      throw new AppError('Access denied', 403)
    }

    const updatedComment = await db.comment.update({
      where: { id },
      data: {
        content: data.content,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    return this.formatCommentResponse(updatedComment as CommentWithRelations)
  }

  /**
   * Delete a comment
   */
  static async deleteComment(id: string, userId: string): Promise<void> {
    const comment = await db.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    if (comment.authorId !== userId) {
      throw new AppError('Access denied', 403)
    }

    // Delete the comment and all its replies (cascade)
    await db.comment.delete({
      where: { id },
    })
  }

  /**
   * Toggle comment like
   */
  static async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    const existingLike = await db.like.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    })

    let liked: boolean

    if (existingLike) {
      // Remove like
      await db.like.delete({
        where: { id: existingLike.id },
      })
      liked = false
    } else {
      // Add like
      await db.like.create({
        data: {
          userId,
          commentId,
        },
      })
      liked = true
    }

    // Get updated likes count
    const likesCount = await db.like.count({
      where: { commentId },
    })

    return { liked, likesCount }
  }

  /**
   * Get user's comments
   */
  static async getUserComments(
    userId: string,
    options: PaginationOptions = {}
  ): Promise<CommentsResponse> {
    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const where = {
      authorId: userId,
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
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          parent: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      }),
      db.comment.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    
    return {
      comments: comments.map(comment => this.formatCommentResponse(comment as CommentWithRelations)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Get recent comments (for admin dashboard)
   */
  static async getRecentComments(limit: number = 10): Promise<CommentResponse[]> {
    const comments = await db.comment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    return comments.map(comment => this.formatCommentResponse(comment as CommentWithRelations))
  }

  /**
   * Get comment statistics
   */
  static async getCommentStatistics(commentId: string): Promise<{
    likesCount: number
    repliesCount: number
  }> {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    return {
      likesCount: comment._count.likes,
      repliesCount: comment._count.replies,
    }
  }

  /**
   * Moderate comment (admin only)
   */
  static async moderateComment(
    commentId: string,
    action: 'approve' | 'hide' | 'delete'
  ): Promise<void> {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    switch (action) {
      case 'approve':
        await db.comment.update({
          where: { id: commentId },
          data: { approved: true },
        })
        break
      
      case 'hide':
        await db.comment.update({
          where: { id: commentId },
          data: { approved: false },
        })
        break
      
      case 'delete':
        await db.comment.delete({
          where: { id: commentId },
        })
        break
    }
  }

  /**
   * Report comment
   */
  static async reportComment(
    commentId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    })

    if (!comment) {
      throw new AppError('Comment not found', 404)
    }

    // In a production app, you might want to store reports in a separate table
    // For now, we'll just log it
    console.log('Comment reported:', {
      commentId,
      reportedBy: userId,
      reason,
      timestamp: new Date().toISOString(),
    })

    // You could also send an email to administrators
    // await EmailService.sendCommentReport(...)
  }

  /**
   * Helper: Format comment response
   */
  private static formatCommentResponse(comment: CommentWithRelations): CommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      postId: comment.postId,
      parentId: comment.parentId,
      likesCount: comment._count.likes,
      repliesCount: comment._count.replies,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        name: comment.author.name,
        avatar: comment.author.avatar,
      },
      post: {
        id: comment.post.id,
        title: comment.post.title,
        slug: comment.post.slug,
      },
      parent: comment.parent ? {
        id: comment.parent.id,
        content: comment.parent.content,
        author: {
          id: comment.parent.author.id,
          username: comment.parent.author.username,
          name: comment.parent.author.name,
        },
      } : null,
      replies: comment.replies?.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        likesCount: reply._count.likes,
        repliesCount: reply._count.replies,
        author: {
          id: reply.author.id,
          username: reply.author.username,
          name: reply.author.name,
          avatar: reply.author.avatar,
        },
      })),
    }
  }
}