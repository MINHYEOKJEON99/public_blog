import apiClient from './client'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  UpdateUserRequest,
  ApiResponse,
  UploadResponse,
} from '@/types/api'
import type { User } from '@/types/user'

export const authApi = {
  // Authentication
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post('/auth/login', data)
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post('/auth/register', data)
  },

  async logout(): Promise<ApiResponse> {
    return apiClient.post('/auth/logout')
  },

  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post('/auth/refresh', data)
  },

  async me(): Promise<ApiResponse<User>> {
    return apiClient.get('/auth/me')
  },

  // Password management
  async forgotPassword(email: string): Promise<ApiResponse> {
    return apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return apiClient.post('/auth/reset-password', { token, password })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  // Email verification
  async sendVerificationEmail(): Promise<ApiResponse> {
    return apiClient.post('/auth/send-verification-email')
  },

  async verifyEmail(token: string): Promise<ApiResponse> {
    return apiClient.post('/auth/verify-email', { token })
  },

  // Profile management
  async updateProfile(data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put('/auth/profile', data)
  },

  async uploadAvatar(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiClient.upload('/auth/upload-avatar', formData)
  },

  async deleteAccount(): Promise<ApiResponse> {
    return apiClient.delete('/auth/account')
  },
}