import { Category, PostStatus } from '@prisma/client'
import { db } from '@/utils/database'
import { SlugService } from '@/utils/slug'
import { AppError } from '@/middleware/error'
import {
  CategoryRequest,
  CategoryResponse,
  CategoriesResponse,
  CategoryWithStats,
  PaginationOptions,
} from '@/types'

export class CategoryService {
  /**
   * Create a new category
   */
  static async createCategory(data: CategoryRequest): Promise<CategoryResponse> {
    // Generate slug from name
    const baseSlug = SlugService.generateSlug(data.name)
    
    // Ensure slug is unique
    let slug = baseSlug
    let counter = 1
    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        color: data.color,
        icon: data.icon,
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

    return this.formatCategoryResponse(category as CategoryWithStats)
  }

  /**
   * Get all categories
   */
  static async getCategories(options: PaginationOptions & { 
    includeEmpty?: boolean
    sortBy?: 'name' | 'postsCount' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<CategoriesResponse> {
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

    const [categories, total] = await Promise.all([
      db.category.findMany({
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
      db.category.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      categories: categories.map(category => this.formatCategoryResponse(category as CategoryWithStats)),
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
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
    const category = await db.category.findUnique({
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

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    const categoryResponse = this.formatCategoryResponse(category as CategoryWithStats)
    
    // Add recent posts
    if ('posts' in category) {
      categoryResponse.recentPosts = category.posts.map(post => ({
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

    return categoryResponse
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string): Promise<CategoryResponse> {
    const category = await db.category.findUnique({
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

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    return this.formatCategoryResponse(category as CategoryWithStats)
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, data: CategoryRequest): Promise<CategoryResponse> {
    const existingCategory = await db.category.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true },
    })

    if (!existingCategory) {
      throw new AppError('Category not found', 404)
    }

    const updateData: any = {
      ...data,
    }

    // Generate new slug if name changed
    if (data.name && data.name !== existingCategory.name) {
      const baseSlug = SlugService.generateSlug(data.name)
      let slug = baseSlug
      let counter = 1
      while (await this.slugExists(slug, id)) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }

    const updatedCategory = await db.category.update({
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

    return this.formatCategoryResponse(updatedCategory as CategoryWithStats)
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<void> {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    if (category._count.posts > 0) {
      throw new AppError('Cannot delete category with existing posts', 400)
    }

    await db.category.delete({
      where: { id },
    })
  }

  /**
   * Get popular categories
   */
  static async getPopularCategories(limit: number = 10): Promise<CategoryResponse[]> {
    const categories = await db.category.findMany({
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

    return categories.map(category => this.formatCategoryResponse(category as CategoryWithStats))
  }

  /**
   * Search categories
   */
  static async searchCategories(
    query: string,
    options: PaginationOptions = {}
  ): Promise<CategoriesResponse> {
    const { page = 1, limit = 20 } = options
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    }

    const [categories, total] = await Promise.all([
      db.category.findMany({
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
      db.category.count({ where: where as any }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      categories: categories.map(category => this.formatCategoryResponse(category as CategoryWithStats)),
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
   * Get category statistics
   */
  static async getCategoryStatistics(): Promise<{
    totalCategories: number
    categoriesWithPosts: number
    averagePostsPerCategory: number
    mostPopularCategory: CategoryResponse | null
  }> {
    const [totalCategories, categoriesWithPosts, categoryStats, mostPopular] = await Promise.all([
      db.category.count(),
      db.category.count({
        where: {
          posts: {
            some: {
              status: PostStatus.PUBLISHED,
            },
          },
        },
      }),
      db.category.findMany({
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
      db.category.findFirst({
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

    const totalPosts = categoryStats.reduce((sum, cat) => sum + cat._count.posts, 0)
    const averagePostsPerCategory = categoriesWithPosts > 0 ? totalPosts / categoriesWithPosts : 0

    return {
      totalCategories,
      categoriesWithPosts,
      averagePostsPerCategory: Math.round(averagePostsPerCategory * 100) / 100,
      mostPopularCategory: mostPopular ? this.formatCategoryResponse(mostPopular as CategoryWithStats) : null,
    }
  }

  /**
   * Merge categories
   */
  static async mergeCategories(
    sourceId: string,
    targetId: string
  ): Promise<CategoryResponse> {
    const [sourceCategory, targetCategory] = await Promise.all([
      db.category.findUnique({ where: { id: sourceId } }),
      db.category.findUnique({ where: { id: targetId } }),
    ])

    if (!sourceCategory) {
      throw new AppError('Source category not found', 404)
    }

    if (!targetCategory) {
      throw new AppError('Target category not found', 404)
    }

    if (sourceId === targetId) {
      throw new AppError('Cannot merge category with itself', 400)
    }

    // Move all posts from source to target category
    await db.post.updateMany({
      where: {
        categories: {
          some: { id: sourceId },
        },
      },
      data: {
        categories: {
          disconnect: { id: sourceId },
          connect: { id: targetId },
        },
      },
    })

    // Delete source category
    await db.category.delete({
      where: { id: sourceId },
    })

    // Return updated target category
    const updatedTarget = await db.category.findUnique({
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

    return this.formatCategoryResponse(updatedTarget as CategoryWithStats)
  }

  /**
   * Helper: Check if slug exists
   */
  private static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    
    const count = await db.category.count({ where })
    return count > 0
  }

  /**
   * Helper: Format category response
   */
  private static formatCategoryResponse(category: CategoryWithStats): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      postsCount: category._count.posts,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }
  }
}