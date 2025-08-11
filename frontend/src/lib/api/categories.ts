import apiClient from './client'
import type {
  Category,
  Tag,
  CreateCategoryRequest,
  ApiResponse,
  BaseQueryParams,
} from '@/types/api'

export const categoriesApi = {
  // Categories
  async getCategories(
    params?: BaseQueryParams
  ): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/categories?${queryString}` : '/categories'
    
    return apiClient.get(url)
  },

  async getCategory(slug: string): Promise<ApiResponse<Category>> {
    return apiClient.get(`/categories/${slug}`)
  },

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiClient.post('/categories', data)
  },

  async updateCategory(
    id: string,
    data: Partial<CreateCategoryRequest>
  ): Promise<ApiResponse<Category>> {
    return apiClient.put(`/categories/${id}`, data)
  },

  async deleteCategory(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/categories/${id}`)
  },

  // Popular categories
  async getPopularCategories(limit?: number): Promise<ApiResponse<Category[]>> {
    const params = limit ? `?limit=${limit}` : ''
    return apiClient.get(`/categories/popular${params}`)
  },
}

export const tagsApi = {
  // Tags
  async getTags(
    params?: BaseQueryParams & { search?: string }
  ): Promise<ApiResponse<Tag[]>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/tags?${queryString}` : '/tags'
    
    return apiClient.get(url)
  },

  async getTag(slug: string): Promise<ApiResponse<Tag>> {
    return apiClient.get(`/tags/${slug}`)
  },

  async createTag(name: string): Promise<ApiResponse<Tag>> {
    return apiClient.post('/tags', { name })
  },

  async updateTag(
    id: string,
    name: string
  ): Promise<ApiResponse<Tag>> {
    return apiClient.put(`/tags/${id}`, { name })
  },

  async deleteTag(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/tags/${id}`)
  },

  // Popular tags
  async getPopularTags(limit?: number): Promise<ApiResponse<Tag[]>> {
    const params = limit ? `?limit=${limit}` : ''
    return apiClient.get(`/tags/popular${params}`)
  },

  // Search tags
  async searchTags(query: string): Promise<ApiResponse<Tag[]>> {
    return apiClient.get(`/tags/search?q=${encodeURIComponent(query)}`)
  },
}