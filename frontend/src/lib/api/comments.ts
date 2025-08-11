import apiClient from './client'
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentQueryParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api'

export const commentsApi = {
  // Comments CRUD
  async getComments(
    postId: string,
    params?: Omit<CommentQueryParams, 'postId'>
  ): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    const queryParams = new URLSearchParams({ postId })
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value) !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    return apiClient.get(`/comments?${queryParams.toString()}`)
  },

  async getComment(id: string): Promise<ApiResponse<Comment>> {
    return apiClient.get(`/comments/${id}`)
  },

  async createComment(
    postId: string,
    data: CreateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    return apiClient.post(`/posts/${postId}/comments`, data)
  },

  async updateComment(
    id: string,
    data: UpdateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    return apiClient.put(`/comments/${id}`, data)
  },

  async deleteComment(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/comments/${id}`)
  },

  // Comment replies
  async getReplies(
    commentId: string,
    params?: Pick<CommentQueryParams, 'page' | 'limit'>
  ): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value) !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    const url = queryString 
      ? `/comments/${commentId}/replies?${queryString}` 
      : `/comments/${commentId}/replies`
    
    return apiClient.get(url)
  },

  async replyToComment(
    parentId: string,
    data: Omit<CreateCommentRequest, 'parentId'>
  ): Promise<ApiResponse<Comment>> {
    return apiClient.post(`/comments/${parentId}/reply`, data)
  },

  // My comments (for authenticated users)
  async getMyComments(
    params?: Pick<CommentQueryParams, 'page' | 'limit' | 'sortBy' | 'sortOrder'>
  ): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value) !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/comments/me?${queryString}` : '/comments/me'
    
    return apiClient.get(url)
  },

  // Comment moderation (admin only)
  async reportComment(id: string, reason: string): Promise<ApiResponse> {
    return apiClient.post(`/comments/${id}/report`, { reason })
  },

  async approveComment(id: string): Promise<ApiResponse<Comment>> {
    return apiClient.patch(`/comments/${id}/approve`)
  },

  async rejectComment(id: string): Promise<ApiResponse> {
    return apiClient.patch(`/comments/${id}/reject`)
  },
}