import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import chatAPI from '../../services/chatAPI'

export const chatKeys = {
  all: ['chat'],
  byDocument: (documentId) => [...chatKeys.all, 'document', documentId],
}

export const useChatMessages = (documentId) =>
  useQuery({
    queryKey: chatKeys.byDocument(documentId),
    queryFn: () => chatAPI.list({ documentId, limit: 50 }).then((res) => res.data),
    enabled: Boolean(documentId),
  })

export const useChatHistory = (documentId) =>
  useInfiniteQuery({
    queryKey: [...chatKeys.byDocument(documentId), 'history'],
    queryFn: ({ pageParam }) =>
      chatAPI.list({ documentId, page: pageParam, limit: 20 }).then((res) => res.data),
    initialPageParam: 1,
    enabled: Boolean(documentId),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  })

export const useSendMessage = () =>
  useMutation({
    mutationFn: ({ documentId, payload }: any) =>
      chatAPI.sendMessage(documentId, payload).then((res) => res.data),
  })
