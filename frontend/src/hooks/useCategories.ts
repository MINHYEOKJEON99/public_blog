import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi, tagsApi } from '@/lib/api'
import { useUIStore } from '@/stores/uiStore'
import type { CreateCategoryRequest, BaseQueryParams } from '@/types/api'

// Categories
export const useCategories = (params?: BaseQueryParams) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesApi.getCategories(params),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  })
}

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getCategory(slug),
    select: (response) => response.data,
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  })
}

export const usePopularCategories = (limit?: number) => {
  return useQuery({
    queryKey: ['categories', 'popular', limit],
    queryFn: () => categoriesApi.getPopularCategories(limit),
    select: (response) => response.data,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Tags
export const useTags = (params?: BaseQueryParams & { search?: string }) => {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: () => tagsApi.getTags(params),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  })
}

export const useTag = (slug: string) => {
  return useQuery({
    queryKey: ['tag', slug],
    queryFn: () => tagsApi.getTag(slug),
    select: (response) => response.data,
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  })
}

export const usePopularTags = (limit?: number) => {
  return useQuery({
    queryKey: ['tags', 'popular', limit],
    queryFn: () => tagsApi.getPopularTags(limit),
    select: (response) => response.data,
    staleTime: 15 * 60 * 1000,
  })
}

export const useSearchTags = (query: string) => {
  return useQuery({
    queryKey: ['tags', 'search', query],
    queryFn: () => tagsApi.searchTags(query),
    select: (response) => response.data,
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

// Category mutations
export const useCategoryMutations = () => {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  // Create category
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.createCategory(data),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      addToast({
        type: 'success',
        title: '카테고리 생성',
        message: `"${data?.name}" 카테고리가 성공적으로 생성되었습니다.`,
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '카테고리 생성 실패',
        message: error.response?.data?.message || '카테고리 생성에 실패했습니다.',
      })
    },
  })

  // Update category
  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateCategoryRequest>
    }) => categoriesApi.updateCategory(id, data),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', data?.slug] })
      addToast({
        type: 'success',
        title: '카테고리 수정',
        message: '카테고리가 성공적으로 수정되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '카테고리 수정 실패',
        message: error.response?.data?.message || '카테고리 수정에 실패했습니다.',
      })
    },
  })

  // Delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      addToast({
        type: 'success',
        title: '카테고리 삭제',
        message: '카테고리가 성공적으로 삭제되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '카테고리 삭제 실패',
        message: error.response?.data?.message || '카테고리 삭제에 실패했습니다.',
      })
    },
  })

  return {
    // Mutations
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,

    // Loading states
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  }
}

// Tag mutations
export const useTagMutations = () => {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  // Create tag
  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagsApi.createTag(name),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      addToast({
        type: 'success',
        title: '태그 생성',
        message: `"${data?.name}" 태그가 성공적으로 생성되었습니다.`,
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '태그 생성 실패',
        message: error.response?.data?.message || '태그 생성에 실패했습니다.',
      })
    },
  })

  // Update tag
  const updateTagMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      tagsApi.updateTag(id, name),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tag', data?.slug] })
      addToast({
        type: 'success',
        title: '태그 수정',
        message: '태그가 성공적으로 수정되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '태그 수정 실패',
        message: error.response?.data?.message || '태그 수정에 실패했습니다.',
      })
    },
  })

  // Delete tag
  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => tagsApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      addToast({
        type: 'success',
        title: '태그 삭제',
        message: '태그가 성공적으로 삭제되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '태그 삭제 실패',
        message: error.response?.data?.message || '태그 삭제에 실패했습니다.',
      })
    },
  })

  return {
    // Mutations
    createTag: createTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,

    // Loading states
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
  }
}