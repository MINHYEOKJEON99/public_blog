import { Post, User, Category, Tag, PostStatus } from '@prisma/client'
import { db } from '@/utils/database'
import { SlugService } from '@/utils/slug'
import { AppError } from '@/middleware/error'
import {
  PostRequest,
  PostResponse,
  PostsResponse,
  PostSearchParams,
  PaginationOptions,
  PostWithRelations,
  PostStatistics,
  PostUpdateRequest,
} from '@/types'

export class PostService {
  /**
   * Create a new post
   */
  static async createPost(authorId: string, data: PostRequest): Promise<PostResponse> {
    // Generate slug from title
    const baseSlug = SlugService.generateSlug(data.title)
    
    // Ensure slug is unique
    let slug = baseSlug
    let counter = 1
    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Handle categories - create if they don't exist
    const categoryIds: string[] = []
    if (data.categories && data.categories.length > 0) {
      for (const categoryName of data.categories) {
        const category = await db.category.upsert({
          where: { name: categoryName },
          update: {},
          create: {
            name: categoryName,
            slug: SlugService.generateSlug(categoryName),
          },
        })
        categoryIds.push(category.id)
      }
    }

    // Handle tags - create if they don't exist
    const tagIds: string[] = []
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tag = await db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: SlugService.generateSlug(tagName),
          },
        })
        tagIds.push(tag.id)
      }
    }

    // Create the post
    const post = await db.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || this.generateExcerpt(data.content),
        coverImage: data.coverImage,
        status: data.status || PostStatus.DRAFT,
        publishedAt: data.status === PostStatus.PUBLISHED ? new Date() : null,
        authorId,
        categories: {
          connect: categoryIds.map(id => ({ id })),
        },
        tags: {
          connect: tagIds.map(id => ({ id })),
        },
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        featuredPostPriority: data.featuredPostPriority,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return this.formatPostResponse(post as PostWithRelations)
  }

  /**
   * Get posts with pagination and filtering
   */
  static async getPosts(params: PostSearchParams = {}): Promise<PostsResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      tag,
      author,
      status = PostStatus.PUBLISHED,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params

    const skip = (page - 1) * limit
    const orderBy: any = {}
    
    // Handle sorting
    switch (sortBy) {
      case 'views':
        orderBy.views = sortOrder
        break
      case 'likes':
        orderBy.likes = { _count: sortOrder }
        break
      case 'comments':
        orderBy.comments = { _count: sortOrder }
        break
      case 'publishedAt':
        orderBy.publishedAt = sortOrder
        break
      default:
        orderBy[sortBy] = sortOrder
    }

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      }
    }
    
    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      }
    }
    
    if (author) {
      where.author = {
        username: author,
      }
    }
    
    if (featured !== undefined) {
      if (featured) {
        where.featuredPostPriority = { gt: 0 }
      } else {
        where.featuredPostPriority = 0
      }
    }

    // Execute queries
    const [posts, total] = await Promise.all([
      db.post.findMany({
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
              bio: true,
            },
          },
          categories: true,
          tags: true,
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
    
    return {
      posts: posts.map(post => this.formatPostResponse(post as PostWithRelations)),
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
   * Get a single post by slug
   */
  static async getPostBySlug(slug: string, userId?: string): Promise<PostResponse> {
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        tags: true,
        likes: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    // Increment view count
    await db.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })

    const postResponse = this.formatPostResponse(post as PostWithRelations)
    
    // Add like status if user is provided
    if (userId && 'likes' in post) {
      postResponse.isLiked = Array.isArray(post.likes) && post.likes.length > 0
    }

    return postResponse
  }

  /**
   * Get post by ID (for editing)
   */
  static async getPostById(id: string, authorId?: string): Promise<PostResponse> {
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    // Check if user is the author or admin
    if (authorId && post.authorId !== authorId) {
      throw new AppError('Access denied', 403)
    }

    return this.formatPostResponse(post as PostWithRelations)
  }

  /**
   * Update a post
   */
  static async updatePost(id: string, authorId: string, data: PostUpdateRequest): Promise<PostResponse> {
    // Check if post exists and user is the author
    const existingPost = await db.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, slug: true, status: true },
    })

    if (!existingPost) {
      throw new AppError('Post not found', 404)
    }

    if (existingPost.authorId !== authorId) {
      throw new AppError('Access denied', 403)
    }

    const updateData: any = {
      ...data,
    }

    // Generate new slug if title changed
    if (data.title) {
      const newSlug = SlugService.generateSlug(data.title)
      if (newSlug !== existingPost.slug) {
        // Ensure new slug is unique
        let slug = newSlug
        let counter = 1
        while (await this.slugExists(slug, id)) {
          slug = `${newSlug}-${counter}`
          counter++
        }
        updateData.slug = slug
      }
    }

    // Update excerpt if content changed
    if (data.content && !data.excerpt) {
      updateData.excerpt = this.generateExcerpt(data.content)
    }

    // Handle status changes
    if (data.status && data.status !== existingPost.status) {
      if (data.status === PostStatus.PUBLISHED && existingPost.status === PostStatus.DRAFT) {
        updateData.publishedAt = new Date()
      } else if (data.status === PostStatus.DRAFT && existingPost.status === PostStatus.PUBLISHED) {
        updateData.publishedAt = null
      }
    }

    // Handle categories
    if (data.categories !== undefined) {
      const categoryIds: string[] = []
      if (data.categories.length > 0) {
        for (const categoryName of data.categories) {
          const category = await db.category.upsert({
            where: { name: categoryName },
            update: {},
            create: {
              name: categoryName,
              slug: SlugService.generateSlug(categoryName),
            },
          })
          categoryIds.push(category.id)
        }
      }
      updateData.categories = {
        set: categoryIds.map(id => ({ id })),
      }
    }

    // Handle tags
    if (data.tags !== undefined) {
      const tagIds: string[] = []
      if (data.tags.length > 0) {
        for (const tagName of data.tags) {
          const tag = await db.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              slug: SlugService.generateSlug(tagName),
            },
          })
          tagIds.push(tag.id)
        }
      }
      updateData.tags = {
        set: tagIds.map(id => ({ id })),
      }
    }

    const updatedPost = await db.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return this.formatPostResponse(updatedPost as PostWithRelations)
  }

  /**
   * Delete a post
   */
  static async deletePost(id: string, authorId: string): Promise<void> {
    const post = await db.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    if (post.authorId !== authorId) {
      throw new AppError('Access denied', 403)
    }

    await db.post.delete({
      where: { id },
    })
  }

  /**
   * Toggle post like
   */
  static async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
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
          postId,
        },
      })
      liked = true
    }

    // Get updated likes count
    const likesCount = await db.like.count({
      where: { postId },
    })

    return { liked, likesCount }
  }

  /**
   * Get related posts
   */
  static async getRelatedPosts(postId: string, limit: number = 4): Promise<PostResponse[]> {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: { categories: true, tags: true },
    })

    if (!post) {
      return []
    }

    const categoryIds = post.categories.map(c => c.id)
    const tagIds = post.tags.map(t => t.id)

    const relatedPosts = await db.post.findMany({
      where: {
        AND: [
          { id: { not: postId } },
          { status: PostStatus.PUBLISHED },
          {
            OR: [
              { categories: { some: { id: { in: categoryIds } } } },
              { tags: { some: { id: { in: tagIds } } } },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return relatedPosts.map(post => this.formatPostResponse(post as PostWithRelations))
  }

  /**
   * Get featured posts
   */
  static async getFeaturedPosts(limit: number = 5): Promise<PostResponse[]> {
    const posts = await db.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        featuredPostPriority: { gt: 0 },
      },
      orderBy: [
        { featuredPostPriority: 'desc' },
        { views: 'desc' },
      ],
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return posts.map(post => this.formatPostResponse(post as PostWithRelations))
  }

  /**
   * Get trending posts
   */
  static async getTrendingPosts(days: number = 7, limit: number = 10): Promise<PostResponse[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const posts = await db.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        publishedAt: { gte: since },
      },
      orderBy: [
        { views: 'desc' },
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
      ],
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return posts.map(post => this.formatPostResponse(post as PostWithRelations))
  }

  /**
   * Get post statistics
   */
  static async getPostStatistics(postId: string): Promise<PostStatistics> {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    return {
      views: post.views,
      likes: post._count.likes,
      comments: post._count.comments,
      readingTime: this.calculateReadingTime(post.content),
    }
  }

  /**
   * Search posts
   */
  static async searchPosts(query: string, options: PaginationOptions = {}): Promise<PostsResponse> {
    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const where = {
      status: PostStatus.PUBLISHED,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
        { author: { username: { contains: query, mode: 'insensitive' } } },
        { categories: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: [
          { views: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true,
            },
          },
          categories: true,
          tags: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      db.post.count({ where: where as any }),
    ])

    const totalPages = Math.ceil(total / limit)
    
    return {
      posts: posts.map(post => this.formatPostResponse(post as PostWithRelations)),
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
   * Helper: Check if slug exists
   */
  private static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    
    const count = await db.post.count({ where })
    return count > 0
  }

  /**
   * Helper: Generate excerpt from content
   */
  private static generateExcerpt(content: string, maxLength: number = 160): string {
    // Remove HTML tags and markdown
    const plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/[#*_`~]/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    if (plainText.length <= maxLength) {
      return plainText
    }

    const truncated = plainText.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }

  /**
   * Helper: Calculate reading time
   */
  private static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  /**
   * Helper: Format post response
   */
  private static formatPostResponse(post: PostWithRelations): PostResponse {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      status: post.status,
      views: post.views,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      readingTime: this.calculateReadingTime(post.content),
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        username: post.author.username,
        name: post.author.name,
        avatar: post.author.avatar,
        bio: post.author.bio,
      },
      categories: post.categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      tags: post.tags.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      featuredPostPriority: post.featuredPostPriority,
    }
  }
}