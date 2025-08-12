import { Tag, PostStatus } from '@prisma/client'
import { db } from '@/utils/database'
import { SlugService } from '@/utils/slug'
import { AppError } from '@/middleware/error'
import {
  TagRequest,
  TagResponse,
  TagsResponse,
  TagWithStats,
  PaginationOptions,
} from '@/types'

export class TagService {
  /**
   * Create a new tag
   */
  static async createTag(data: TagRequest): Promise<TagResponse> {
    // Generate slug from name
    const baseSlug = SlugService.generateSlug(data.name)
    
    // Ensure slug is unique
    let slug = baseSlug
    let counter = 1
    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const tag = await db.tag.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        color: data.color,
      },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
    })

    return this.formatTagResponse(tag as TagWithStats)
  }

  /**
   * Get all tags
   */
  static async getTags(options: PaginationOptions & { 
    includeEmpty?: boolean
    sortBy?: 'name' | 'postsCount' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<TagsResponse> {
    const { 
      page = 1, 
      limit = 50,
      includeEmpty = true,
      sortBy = 'name',
      sortOrder = 'asc',
    } = options

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (!includeEmpty) {
      where.posts = {
        some: {
          status: PostStatus.PUBLISHED,
        },
      }
    }

    // Build order by clause
    let orderBy: any = {}
    if (sortBy === 'postsCount') {
      orderBy = { posts: { _count: sortOrder } }
    } else {
      orderBy[sortBy] = sortOrder
    }

    const [tags, total] = await Promise.all([
      db.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              posts: {
                where: { status: PostStatus.PUBLISHED },
              },
            },
          },
        },
      }),
      db.tag.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      tags: tags.map(tag => this.formatTagResponse(tag as TagWithStats)),
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
   * Get tag by slug
   */
  static async getTagBySlug(slug: string): Promise<TagResponse> {
    const tag = await db.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
        posts: {
          where: { status: PostStatus.PUBLISHED },
          take: 5,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true,
            views: true,
            author: {
              select: {
                username: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    })

    if (!tag) {
      throw new AppError('Tag not found', 404)
    }

    const tagResponse = this.formatTagResponse(tag as TagWithStats)
    
    // Add recent posts
    if ('posts' in tag) {
      tagResponse.recentPosts = tag.posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        publishedAt: post.publishedAt,
        views: post.views,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        author: {
          username: post.author.username,
          name: post.author.name,
          avatar: post.author.avatar,
        },
      }))
    }

    return tagResponse
  }

  /**
   * Get tag by ID
   */
  static async getTagById(id: string): Promise<TagResponse> {
    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
    })

    if (!tag) {
      throw new AppError('Tag not found', 404)
    }

    return this.formatTagResponse(tag as TagWithStats)
  }

  /**
   * Update tag
   */
  static async updateTag(id: string, data: TagRequest): Promise<TagResponse> {
    const existingTag = await db.tag.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true },
    })

    if (!existingTag) {
      throw new AppError('Tag not found', 404)
    }

    const updateData: any = {
      ...data,
    }

    // Generate new slug if name changed
    if (data.name && data.name !== existingTag.name) {
      const baseSlug = SlugService.generateSlug(data.name)
      let slug = baseSlug
      let counter = 1
      while (await this.slugExists(slug, id)) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }

    const updatedTag = await db.tag.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
    })

    return this.formatTagResponse(updatedTag as TagWithStats)
  }

  /**
   * Delete tag
   */
  static async deleteTag(id: string): Promise<void> {
    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!tag) {
      throw new AppError('Tag not found', 404)
    }

    if (tag._count.posts > 0) {
      throw new AppError('Cannot delete tag with existing posts', 400)
    }

    await db.tag.delete({
      where: { id },
    })
  }

  /**
   * Get popular tags
   */
  static async getPopularTags(limit: number = 20): Promise<TagResponse[]> {
    const tags = await db.tag.findMany({
      take: limit,
      orderBy: {
        posts: { _count: 'desc' },
      },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
      where: {
        posts: {
          some: {
            status: PostStatus.PUBLISHED,
          },
        },
      },
    })

    return tags.map(tag => this.formatTagResponse(tag as TagWithStats))
  }

  /**
   * Get trending tags (based on recent posts)
   */
  static async getTrendingTags(days: number = 7, limit: number = 10): Promise<TagResponse[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const tags = await db.tag.findMany({
      take: limit,
      orderBy: {
        posts: { _count: 'desc' },
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: PostStatus.PUBLISHED,
                publishedAt: { gte: since },
              },
            },
          },
        },
      },
      where: {
        posts: {
          some: {
            status: PostStatus.PUBLISHED,
            publishedAt: { gte: since },
          },
        },
      },
    })

    return tags.map(tag => this.formatTagResponse(tag as TagWithStats))
  }

  /**
   * Search tags
   */
  static async searchTags(
    query: string,
    options: PaginationOptions = {}
  ): Promise<TagsResponse> {
    const { page = 1, limit = 20 } = options
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    }

    const [tags, total] = await Promise.all([
      db.tag.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              posts: {
                where: { status: PostStatus.PUBLISHED },
              },
            },
          },
        },
      }),
      db.tag.count({ where: where as any }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      tags: tags.map(tag => this.formatTagResponse(tag as TagWithStats)),
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
   * Get tag cloud data (all tags with their frequency)
   */
  static async getTagCloud(minPostCount: number = 1): Promise<Array<{
    id: string
    name: string
    slug: string
    count: number
    weight: number // 1-5 scale for tag cloud display
  }>> {
    const tags = await db.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
      where: {
        posts: {
          some: {
            status: PostStatus.PUBLISHED,
          },
        },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
    })

    const filteredTags = tags.filter(tag => tag._count.posts >= minPostCount)
    
    if (filteredTags.length === 0) {
      return []
    }

    // Calculate weights (1-5 scale)
    const maxCount = Math.max(...filteredTags.map(tag => tag._count.posts))
    const minCount = Math.min(...filteredTags.map(tag => tag._count.posts))
    const range = maxCount - minCount

    return filteredTags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: tag._count.posts,
      weight: range === 0 ? 3 : Math.ceil(((tag._count.posts - minCount) / range) * 4) + 1,
    }))
  }

  /**
   * Get related tags based on co-occurrence in posts
   */
  static async getRelatedTags(tagId: string, limit: number = 10): Promise<TagResponse[]> {
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      select: { id: true },
    })

    if (!tag) {
      throw new AppError('Tag not found', 404)
    }

    // Find posts that have this tag
    const postsWithTag = await db.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        tags: {
          some: { id: tagId },
        },
      },
      select: { id: true },
    })

    const postIds = postsWithTag.map(post => post.id)

    if (postIds.length === 0) {
      return []
    }

    // Find other tags that appear in these posts
    const relatedTags = await db.tag.findMany({
      where: {
        AND: [
          { id: { not: tagId } }, // Exclude the original tag
          {
            posts: {
              some: {
                id: { in: postIds },
                status: PostStatus.PUBLISHED,
              },
            },
          },
        ],
      },
      take: limit,
      orderBy: {
        posts: { _count: 'desc' },
      },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
    })

    return relatedTags.map(tag => this.formatTagResponse(tag as TagWithStats))
  }

  /**
   * Get tag statistics
   */
  static async getTagStatistics(): Promise<{
    totalTags: number
    tagsWithPosts: number
    averagePostsPerTag: number
    mostPopularTag: TagResponse | null
  }> {
    const [totalTags, tagsWithPosts, tagStats, mostPopular] = await Promise.all([
      db.tag.count(),
      db.tag.count({
        where: {
          posts: {
            some: {
              status: PostStatus.PUBLISHED,
            },
          },
        },
      }),
      db.tag.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: { status: PostStatus.PUBLISHED },
              },
            },
          },
        },
      }),
      db.tag.findFirst({
        orderBy: {
          posts: { _count: 'desc' },
        },
        include: {
          _count: {
            select: {
              posts: {
                where: { status: PostStatus.PUBLISHED },
              },
            },
          },
        },
      }),
    ])

    const totalPosts = tagStats.reduce((sum, tag) => sum + tag._count.posts, 0)
    const averagePostsPerTag = tagsWithPosts > 0 ? totalPosts / tagsWithPosts : 0

    return {
      totalTags,
      tagsWithPosts,
      averagePostsPerTag: Math.round(averagePostsPerTag * 100) / 100,
      mostPopularTag: mostPopular ? this.formatTagResponse(mostPopular as TagWithStats) : null,
    }
  }

  /**
   * Merge tags
   */
  static async mergeTags(
    sourceId: string,
    targetId: string
  ): Promise<TagResponse> {
    const [sourceTag, targetTag] = await Promise.all([
      db.tag.findUnique({ where: { id: sourceId } }),
      db.tag.findUnique({ where: { id: targetId } }),
    ])

    if (!sourceTag) {
      throw new AppError('Source tag not found', 404)
    }

    if (!targetTag) {
      throw new AppError('Target tag not found', 404)
    }

    if (sourceId === targetId) {
      throw new AppError('Cannot merge tag with itself', 400)
    }

    // Move all posts from source to target tag
    await db.post.updateMany({
      where: {
        tags: {
          some: { id: sourceId },
        },
      },
      data: {
        tags: {
          disconnect: { id: sourceId },
          connect: { id: targetId },
        },
      },
    })

    // Delete source tag
    await db.tag.delete({
      where: { id: sourceId },
    })

    // Return updated target tag
    const updatedTarget = await db.tag.findUnique({
      where: { id: targetId },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
    })

    return this.formatTagResponse(updatedTarget as TagWithStats)
  }

  /**
   * Batch create/update tags from names
   */
  static async upsertTags(tagNames: string[]): Promise<TagResponse[]> {
    const results: TagResponse[] = []

    for (const name of tagNames) {
      const slug = SlugService.generateSlug(name)
      
      const tag = await db.tag.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
        },
        include: {
          _count: {
            select: {
              posts: {
                where: { status: PostStatus.PUBLISHED },
              },
            },
          },
        },
      })

      results.push(this.formatTagResponse(tag as TagWithStats))
    }

    return results
  }

  /**
   * Helper: Check if slug exists
   */
  private static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    
    const count = await db.tag.count({ where })
    return count > 0
  }

  /**
   * Helper: Format tag response
   */
  private static formatTagResponse(tag: TagWithStats): TagResponse {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      postsCount: tag._count.posts,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }
  }
}