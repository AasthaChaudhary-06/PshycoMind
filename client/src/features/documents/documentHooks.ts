import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import documentAPI from '../../services/documentAPI'

export const documentKeys = {
  all: ['documents'],
  lists: () => [...documentKeys.all, 'list'],
  list: (params) => [...documentKeys.lists(), params],
  detail: (id) => [...documentKeys.all, 'detail', id],
  search: (query) => [...documentKeys.all, 'search', query],
}

export const useDocuments = (params) =>
  useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentAPI.list(params).then((res) => res.data),
    placeholderData: (prev) => prev,
  })

export const useDocument = (id) =>
  useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentAPI.get(id).then((res) => res.data),
    enabled: Boolean(id),
  })

export const useInfiniteDocuments = (filters) =>
  useInfiniteQuery({
    queryKey: documentKeys.lists(),
    queryFn: ({ pageParam }) =>
      documentAPI.list({ ...filters, page: pageParam, limit: 10 }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  })

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ formData, config }: any) => documentAPI.upload(formData, config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => documentAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  })
}

export const useSearchDocuments = (query) =>
  useQuery({
    queryKey: documentKeys.search(query),
    queryFn: () => documentAPI.list({ q: query }).then((res) => res.data),
    enabled: Boolean(query && query.length >= 2),
  })
