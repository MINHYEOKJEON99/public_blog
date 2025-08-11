import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from '@/types/api'

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore()
  const { addToast } = useUIStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ data }) => {
      if (data) {
        login(data.user, data.token, data.refreshToken)
        addToast({
          type: 'success',
          title: '로그인 성공',
          message: `${data.user.name || data.user.username}님, 환영합니다!`,
        })
        router.push('/dashboard')
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '로그인 실패',
        message: error.response?.data?.message || '로그인에 실패했습니다.',
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: ({ data }) => {
      if (data) {
        login(data.user, data.token, data.refreshToken)
        addToast({
          type: 'success',
          title: '회원가입 성공',
          message: '계정이 성공적으로 생성되었습니다!',
        })
        router.push('/dashboard')
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '회원가입 실패',
        message: error.response?.data?.message || '회원가입에 실패했습니다.',
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      addToast({
        type: 'success',
        title: '로그아웃',
        message: '성공적으로 로그아웃되었습니다.',
      })
      router.push('/')
    },
    onError: () => {
      // Even if logout API fails, clear local state
      logout()
      queryClient.clear()
      router.push('/')
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      if (data) {
        updateUser(data)
        queryClient.invalidateQueries({ queryKey: ['user'] })
        addToast({
          type: 'success',
          title: '프로필 업데이트',
          message: '프로필이 성공적으로 업데이트되었습니다.',
        })
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '업데이트 실패',
        message: error.response?.data?.message || '프로필 업데이트에 실패했습니다.',
      })
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: {
      currentPassword: string
      newPassword: string
    }) => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: '비밀번호 변경',
        message: '비밀번호가 성공적으로 변경되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '비밀번호 변경 실패',
        message: error.response?.data?.message || '비밀번호 변경에 실패했습니다.',
      })
    },
  })

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: ({ data }) => {
      if (data && user) {
        const updatedUser = { ...user, avatar: data.url }
        updateUser(updatedUser)
        queryClient.invalidateQueries({ queryKey: ['user'] })
        addToast({
          type: 'success',
          title: '아바타 업데이트',
          message: '아바타가 성공적으로 업데이트되었습니다.',
        })
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '아바타 업로드 실패',
        message: error.response?.data?.message || '아바타 업로드에 실패했습니다.',
      })
    },
  })

  // Get current user query
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    // State
    user: currentUser || user,
    isAuthenticated,
    isUserLoading,

    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    uploadAvatar: uploadAvatarMutation.mutate,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,

    // Reset functions
    resetLoginError: loginMutation.reset,
    resetRegisterError: registerMutation.reset,
  }
}