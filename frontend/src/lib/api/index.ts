// Export API client
export { default as apiClient } from './client'

// Export API modules
export { authApi } from './auth'
export { postsApi } from './posts'
export { commentsApi } from './comments'
export { categoriesApi, tagsApi } from './categories'
export { usersApi } from './users'

// Combined API object for convenience
export const api = {
  auth: require('./auth').authApi,
  posts: require('./posts').postsApi,
  comments: require('./comments').commentsApi,
  categories: require('./categories').categoriesApi,
  tags: require('./categories').tagsApi,
  users: require('./users').usersApi,
}

// Export types for external use
export type * from '@/types/api'