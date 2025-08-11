import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { postsApi } from '@/lib/api'
import { useUIStore } from '@/stores/uiStore'
import type {
  PostFilters,
  CreatePostRequest,
  UpdatePostRequest,
} from '@/types/api'

// Posts list query
export const usePosts = (filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postsApi.getPosts(filters),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Infinite posts query for pagination
export const useInfinitePosts = (filters?: Omit<PostFilters, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getPosts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data?.pagination.hasNext) {
        return lastPage.data.pagination.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    select: (data) => ({
      pages: data.pages.map((page) => page.data),
      pageParams: data.pageParams,
    }),
    staleTime: 2 * 60 * 1000,
  })
}

// Single post query
export const usePost = (slug: string) => {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPost(slug),
    select: (response) => response.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// My posts query
export const useMyPosts = (filters?: Omit<PostFilters, 'author'>) => {
  return useQuery({
    queryKey: ['posts', 'me', filters],
    queryFn: () => postsApi.getMyPosts(filters),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000,
  })
}

// Popular posts query
export const usePopularPosts = (limit?: number) => {
  return useQuery({
    queryKey: ['posts', 'popular', limit],
    queryFn: () => postsApi.getPopularPosts(limit),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Recent posts query
export const useRecentPosts = (limit?: number) => {
  return useQuery({
    queryKey: ['posts', 'recent', limit],
    queryFn: () => postsApi.getRecentPosts(limit),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  })
}

// Related posts query
export const useRelatedPosts = (postId: string) => {
  return useQuery({
    queryKey: ['posts', 'related', postId],
    queryFn: () => postsApi.getRelatedPosts(postId),
    select: (response) => response.data,
    enabled: !!postId,
    staleTime: 10 * 60 * 1000,
  })
}

// Search posts query
export const useSearchPosts = (query: string, filters?: Omit<PostFilters, 'search'>) => {
  return useQuery({
    queryKey: ['posts', 'search', query, filters],
    queryFn: () => postsApi.searchPosts(query, filters),
    select: (response) => response.data,
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}

// Post mutations
export const usePostMutations = () => {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  // Create post
  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.createPost(data),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      addToast({
        type: 'success',
        title: '포스트 생성',
        message: `"${data?.title}"이(가) 성공적으로 생성되었습니다.`,
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '포스트 생성 실패',
        message: error.response?.data?.message || '포스트 생성에 실패했습니다.',
      })
    },
  })

  // Update post
  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostRequest }) =>
      postsApi.updatePost(id, data),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', data?.slug] })
      addToast({
        type: 'success',
        title: '포스트 수정',
        message: '포스트가 성공적으로 수정되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '포스트 수정 실패',
        message: error.response?.data?.message || '포스트 수정에 실패했습니다.',
      })
    },
  })

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: (id: string) => postsApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      addToast({
        type: 'success',
        title: '포스트 삭제',
        message: '포스트가 성공적으로 삭제되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '포스트 삭제 실패',
        message: error.response?.data?.message || '포스트 삭제에 실패했습니다.',
      })
    },
  })

  // Like post
  const likePostMutation = useMutation({
    mutationFn: (id: string) => postsApi.likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post'] })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '좋아요 실패',
        message: error.response?.data?.message || '좋아요에 실패했습니다.',
      })
    },
  })

  // Unlike post
  const unlikePostMutation = useMutation({
    mutationFn: (id: string) => postsApi.unlikePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post'] })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '좋아요 취소 실패',
        message: error.response?.data?.message || '좋아요 취소에 실패했습니다.',
      })
    },
  })

  // Publish post
  const publishPostMutation = useMutation({
    mutationFn: (id: string) => postsApi.publishPost(id),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', data?.slug] })
      addToast({
        type: 'success',
        title: '포스트 발행',
        message: '포스트가 성공적으로 발행되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '포스트 발행 실패',
        message: error.response?.data?.message || '포스트 발행에 실패했습니다.',
      })
    },
  })

  // Upload image
  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => postsApi.uploadImage(file),
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '이미지 업로드 실패',
        message: error.response?.data?.message || '이미지 업로드에 실패했습니다.',
      })
    },
  })

  return {
    // Mutations
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    likePost: likePostMutation.mutate,
    unlikePost: unlikePostMutation.mutate,
    publishPost: publishPostMutation.mutate,
    uploadImage: uploadImageMutation.mutate,

    // Loading states
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    isLiking: likePostMutation.isPending,
    isUnliking: unlikePostMutation.isPending,
    isPublishing: publishPostMutation.isPending,
    isUploadingImage: uploadImageMutation.isPending,

    // Reset functions
    resetCreateError: createPostMutation.reset,
    resetUpdateError: updatePostMutation.reset,
  }
}