import apiClient from './client'
import type {
  User,
  PostSummary,
  ApiResponse,
  PaginatedResponse,
  BaseQueryParams,
} from '@/types/api'

export const usersApi = {
  // User profiles
  async getUsers(
    params?: BaseQueryParams & { search?: string; role?: string }
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/users?${queryString}` : '/users'
    
    return apiClient.get(url)
  },

  async getUser(username: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/${username}`)
  },

  async getUserPosts(
    username: string,
    params?: BaseQueryParams & { published?: boolean }
  ): Promise<ApiResponse<PaginatedResponse<PostSummary>>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    const url = queryString 
      ? `/users/${username}/posts?${queryString}` 
      : `/users/${username}/posts`
    
    return apiClient.get(url)
  },

  async getUserStats(username: string): Promise<ApiResponse<{
    postsCount: number
    commentsCount: number
    likesReceived: number
    viewsReceived: number
  }>> {
    return apiClient.get(`/users/${username}/stats`)
  },

  // Search users
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return apiClient.get(`/users/search?q=${encodeURIComponent(query)}`)
  },

  // Admin only endpoints
  async updateUserRole(
    userId: string, 
    role: 'USER' | 'ADMIN'
  ): Promise<ApiResponse<User>> {
    return apiClient.patch(`/users/${userId}/role`, { role })
  },

  async suspendUser(userId: string, reason?: string): Promise<ApiResponse> {
    return apiClient.post(`/users/${userId}/suspend`, { reason })
  },

  async unsuspendUser(userId: string): Promise<ApiResponse> {
    return apiClient.post(`/users/${userId}/unsuspend`)
  },

  async deleteUser(userId: string): Promise<ApiResponse> {
    return apiClient.delete(`/users/${userId}`)
  },
}