import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { commentsApi } from '@/lib/api'
import { useUIStore } from '@/stores/uiStore'
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentQueryParams,
} from '@/types/api'

// Comments query for a post
export const useComments = (
  postId: string,
  params?: Omit<CommentQueryParams, 'postId'>
) => {
  return useQuery({
    queryKey: ['comments', postId, params],
    queryFn: () => commentsApi.getComments(postId, params),
    select: (response) => response.data,
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Infinite comments query for pagination
export const useInfiniteComments = (
  postId: string,
  params?: Omit<CommentQueryParams, 'postId' | 'page'>
) => {
  return useInfiniteQuery({
    queryKey: ['comments', 'infinite', postId, params],
    queryFn: ({ pageParam = 1 }) =>
      commentsApi.getComments(postId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data?.pagination.hasNext) {
        return lastPage.data.pagination.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: !!postId,
    select: (data) => ({
      pages: data.pages.map((page) => page.data),
      pageParams: data.pageParams,
    }),
    staleTime: 2 * 60 * 1000,
  })
}

// Single comment query
export const useComment = (commentId: string) => {
  return useQuery({
    queryKey: ['comment', commentId],
    queryFn: () => commentsApi.getComment(commentId),
    select: (response) => response.data,
    enabled: !!commentId,
    staleTime: 5 * 60 * 1000,
  })
}

// Comment replies query
export const useCommentReplies = (
  commentId: string,
  params?: Pick<CommentQueryParams, 'page' | 'limit'>
) => {
  return useQuery({
    queryKey: ['comments', 'replies', commentId, params],
    queryFn: () => commentsApi.getReplies(commentId, params),
    select: (response) => response.data,
    enabled: !!commentId,
    staleTime: 2 * 60 * 1000,
  })
}

// My comments query
export const useMyComments = (
  params?: Pick<CommentQueryParams, 'page' | 'limit' | 'sortBy' | 'sortOrder'>
) => {
  return useQuery({
    queryKey: ['comments', 'me', params],
    queryFn: () => commentsApi.getMyComments(params),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000,
  })
}

// Comment mutations
export const useCommentMutations = () => {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  // Create comment
  const createCommentMutation = useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string
      data: CreateCommentRequest
    }) => commentsApi.createComment(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.postId],
      })
      queryClient.invalidateQueries({
        queryKey: ['comments', 'infinite', variables.postId],
      })
      addToast({
        type: 'success',
        title: '댓글 작성',
        message: '댓글이 성공적으로 작성되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '댓글 작성 실패',
        message: error.response?.data?.message || '댓글 작성에 실패했습니다.',
      })
    },
  })

  // Update comment
  const updateCommentMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateCommentRequest
    }) => commentsApi.updateComment(id, data),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['comment', data?.id] })
      addToast({
        type: 'success',
        title: '댓글 수정',
        message: '댓글이 성공적으로 수정되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '댓글 수정 실패',
        message: error.response?.data?.message || '댓글 수정에 실패했습니다.',
      })
    },
  })

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => commentsApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      addToast({
        type: 'success',
        title: '댓글 삭제',
        message: '댓글이 성공적으로 삭제되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '댓글 삭제 실패',
        message: error.response?.data?.message || '댓글 삭제에 실패했습니다.',
      })
    },
  })

  // Reply to comment
  const replyToCommentMutation = useMutation({
    mutationFn: ({
      parentId,
      data,
    }: {
      parentId: string
      data: Omit<CreateCommentRequest, 'parentId'>
    }) => commentsApi.replyToComment(parentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      addToast({
        type: 'success',
        title: '답글 작성',
        message: '답글이 성공적으로 작성되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '답글 작성 실패',
        message: error.response?.data?.message || '답글 작성에 실패했습니다.',
      })
    },
  })

  // Report comment
  const reportCommentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      commentsApi.reportComment(id, reason),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: '신고 접수',
        message: '댓글 신고가 접수되었습니다.',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '신고 실패',
        message: error.response?.data?.message || '신고 접수에 실패했습니다.',
      })
    },
  })

  return {
    // Mutations
    createComment: createCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    replyToComment: replyToCommentMutation.mutate,
    reportComment: reportCommentMutation.mutate,

    // Loading states
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isReplying: replyToCommentMutation.isPending,
    isReporting: reportCommentMutation.isPending,

    // Reset functions
    resetCreateError: createCommentMutation.reset,
    resetUpdateError: updateCommentMutation.reset,
  }
}