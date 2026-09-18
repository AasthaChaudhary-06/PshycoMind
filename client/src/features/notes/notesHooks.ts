import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import notesAPI from '../../services/notesAPI'

export const notesKeys = {
  all: ['notes'],
  byDocument: (documentId) => [...notesKeys.all, 'document', documentId],
  detail: (id) => [...notesKeys.all, 'detail', id],
}

export const useNotes = (documentId) =>
  useQuery({
    queryKey: notesKeys.byDocument(documentId),
    queryFn: () => notesAPI.list({ documentId }).then((res) => res.data),
    enabled: Boolean(documentId),
  })

export const useGenerateNotes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId) => notesAPI.generateSummary({ documentId }).then((res) => res.data),
    onSuccess: (_, documentId) =>
      queryClient.invalidateQueries({ queryKey: notesKeys.byDocument(documentId) }),
  })
}

export const useUpdateNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: any) => notesAPI.update(id, payload).then((res) => res.data),
    onSuccess: (note) =>
      queryClient.invalidateQueries({ queryKey: notesKeys.byDocument(note.documentId) }),
  })
}
