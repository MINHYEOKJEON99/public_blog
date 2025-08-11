import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import type { ApiResponse } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle auth errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config

        if (error.response?.status === 401 && !original._retry) {
          if (this.isRefreshing) {
            // If refresh is in progress, queue the request
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                original.headers.Authorization = `Bearer ${token}`
                resolve(this.client(original))
              })
            })
          }

          original._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = useAuthStore.getState().refreshToken
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            const response = await this.client.post('/auth/refresh', {
              refreshToken,
            })

            const { token: newToken } = response.data.data
            useAuthStore.getState().setToken(newToken)

            // Process all queued requests
            this.refreshSubscribers.forEach((callback) => callback(newToken))
            this.refreshSubscribers = []

            // Retry the original request
            original.headers.Authorization = `Bearer ${newToken}`
            return this.client(original)
          } catch (refreshError) {
            // Refresh failed, logout user
            useAuthStore.getState().logout()
            useUIStore.getState().addToast({
              type: 'error',
              title: '세션 만료',
              message: '다시 로그인해주세요.',
            })
            
            // Redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle other errors
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: any) {
    const uiStore = useUIStore.getState()
    
    if (error.response) {
      // Server error response
      const status = error.response.status
      const message = error.response.data?.message || '서버 오류가 발생했습니다.'

      switch (status) {
        case 400:
          uiStore.addToast({
            type: 'error',
            title: '잘못된 요청',
            message,
          })
          break
        case 403:
          uiStore.addToast({
            type: 'error',
            title: '접근 권한 없음',
            message: '이 작업을 수행할 권한이 없습니다.',
          })
          break
        case 404:
          uiStore.addToast({
            type: 'error',
            title: '찾을 수 없음',
            message: '요청한 리소스를 찾을 수 없습니다.',
          })
          break
        case 422:
          // Validation errors are handled by forms
          break
        case 429:
          uiStore.addToast({
            type: 'warning',
            title: '요청 제한',
            message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
          })
          break
        case 500:
          uiStore.addToast({
            type: 'error',
            title: '서버 오류',
            message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          })
          break
        default:
          uiStore.addToast({
            type: 'error',
            title: '오류',
            message,
          })
      }
    } else if (error.request) {
      // Network error
      uiStore.addToast({
        type: 'error',
        title: '네트워크 오류',
        message: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
      })
    } else {
      // Other error
      uiStore.addToast({
        type: 'error',
        title: '오류',
        message: error.message || '알 수 없는 오류가 발생했습니다.',
      })
    }
  }

  // Generic request methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config)
    return response.data
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config)
    return response.data
  }

  // File upload method
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Cancel request method
  getCancelToken() {
    return axios.CancelToken.source()
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export for use in other API modules
export default apiClient