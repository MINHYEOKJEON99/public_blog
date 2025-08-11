// Export API client
export { default as apiClient } from './client'

// Export API modules
export { authApi } from './auth'
export { postsApi } from './posts'
export { commentsApi } from './comments'
export { categoriesApi, tagsApi } from './categories'
export { usersApi } from './users'

// Import for combined API object
import { authApi } from './auth'
import { postsApi } from './posts'
import { commentsApi } from './comments'
import { categoriesApi, tagsApi } from './categories'
import { usersApi } from './users'

// Combined API object for convenience
export const api = {
  auth: authApi,
  posts: postsApi,
  comments: commentsApi,
  categories: categoriesApi,
  tags: tagsApi,
  users: usersApi,
}

// Export types for external use
export type * from '@/types/api'