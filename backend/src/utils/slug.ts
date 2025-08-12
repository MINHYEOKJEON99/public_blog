import slugify from 'slugify'
import { db } from './database'

export class SlugService {
  /**
   * Generate a URL-friendly slug from text
   */
  static generateSlug(text: string): string {
    return slugify(text, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    })
  }

  /**
   * Generate a unique slug for posts
   */
  static async generateUniquePostSlug(title: string, excludeId?: string): Promise<string> {
    let baseSlug = this.generateSlug(title)
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existing = await db.post.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      })

      if (!existing) {
        break
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  /**
   * Generate a unique slug for categories
   */
  static async generateUniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = this.generateSlug(name)
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existing = await db.category.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      })

      if (!existing) {
        break
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  /**
   * Generate a unique slug for tags
   */
  static async generateUniqueTagSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = this.generateSlug(name)
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existing = await db.tag.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      })

      if (!existing) {
        break
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  /**
   * Generate a unique username slug
   */
  static async generateUniqueUsernameSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = this.generateSlug(name)
    let slug = baseSlug
    let counter = 1

    // Ensure minimum length
    if (slug.length < 3) {
      slug = `user-${slug}`
    }

    while (true) {
      const existing = await db.user.findFirst({
        where: {
          username: slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      })

      if (!existing) {
        break
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100
  }

  /**
   * Generate SEO-friendly excerpt from content
   */
  static generateExcerpt(content: string, maxLength: number = 160): string {
    // Remove HTML tags and markdown
    const plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/[#*`_~\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (plainText.length <= maxLength) {
      return plainText
    }

    // Find the last complete sentence within the limit
    const truncated = plainText.substring(0, maxLength)
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    )

    if (lastSentenceEnd > maxLength * 0.6) {
      return truncated.substring(0, lastSentenceEnd + 1)
    }

    // Find the last word boundary
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...'
    }

    return truncated + '...'
  }
}