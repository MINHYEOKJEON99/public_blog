import apiClient from './client'
import type {
  Post,
  PostSummary,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  ApiResponse,
  PaginatedResponse,
  UploadResponse,
} from '@/types/api'

export const postsApi = {
  // Posts CRUD
  async getPosts(filters?: PostFilters): Promise<ApiResponse<PaginatedResponse<PostSummary>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const url = queryString ? `/posts?${queryString}` : '/posts'
    
    return apiClient.get(url)
  },

  async getPost(slug: string): Promise<ApiResponse<Post>> {
    return apiClient.get(`/posts/${slug}`)
  },

  async createPost(data: CreatePostRequest): Promise<ApiResponse<Post>> {
    return apiClient.post('/posts', data)
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<ApiResponse<Post>> {
    return apiClient.put(`/posts/${id}`, data)
  },

  async deletePost(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/posts/${id}`)
  },

  // Post actions
  async likePost(id: string): Promise<ApiResponse> {
    return apiClient.post(`/posts/${id}/like`)
  },

  async unlikePost(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/posts/${id}/like`)
  },

  async incrementViewCount(id: string): Promise<ApiResponse> {
    return apiClient.post(`/posts/${id}/view`)
  },

  // My posts (for authenticated users)
  async getMyPosts(filters?: Omit<PostFilters, 'author'>): Promise<ApiResponse<PaginatedResponse<PostSummary>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const url = queryString ? `/posts/me?${queryString}` : '/posts/me'
    
    return apiClient.get(url)
  },

  async getDraftPosts(): Promise<ApiResponse<PaginatedResponse<PostSummary>>> {
    return apiClient.get('/posts/me?published=false')
  },

  // Post management
  async publishPost(id: string): Promise<ApiResponse<Post>> {
    return apiClient.patch(`/posts/${id}/publish`)
  },

  async unpublishPost(id: string): Promise<ApiResponse<Post>> {
    return apiClient.patch(`/posts/${id}/unpublish`)
  },

  // File upload for posts
  async uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.upload('/posts/upload-image', formData)
  },

  async uploadCoverImage(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('cover', file)
    return apiClient.upload('/posts/upload-cover', formData)
  },

  // Search
  async searchPosts(
    query: string,
    filters?: Omit<PostFilters, 'search'>
  ): Promise<ApiResponse<PaginatedResponse<PostSummary>>> {
    const params = new URLSearchParams({ search: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    return apiClient.get(`/posts/search?${params.toString()}`)
  },

  // Related posts
  async getRelatedPosts(id: string): Promise<ApiResponse<PostSummary[]>> {
    return apiClient.get(`/posts/${id}/related`)
  },

  // Popular posts
  async getPopularPosts(limit?: number): Promise<ApiResponse<PostSummary[]>> {
    const params = limit ? `?limit=${limit}` : ''
    return apiClient.get(`/posts/popular${params}`)
  },

  // Recent posts
  async getRecentPosts(limit?: number): Promise<ApiResponse<PostSummary[]>> {
    const params = limit ? `?limit=${limit}` : ''
    return apiClient.get(`/posts/recent${params}`)
  },
}