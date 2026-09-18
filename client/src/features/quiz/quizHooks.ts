import { useMutation, useQuery } from '@tanstack/react-query'
import quizAPI from '../../services/quizAPI'

export const quizKeys = {
  all: ['quiz'],
  lists: () => [...quizKeys.all, 'list'],
  detail: (id) => [...quizKeys.all, 'detail', id],
}

export const useGenerateQuiz = () =>
  useMutation({
    mutationFn: ({ documentId, payload }: any) =>
      quizAPI.generate({ documentId, ...payload }).then((res) => res.data),
  })

export const useQuizzes = (params) =>
  useQuery({
    queryKey: [...quizKeys.lists(), params],
    queryFn: () => quizAPI.list(params).then((res) => res.data),
    placeholderData: (prev) => prev,
  })

export const useQuiz = (id) =>
  useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => quizAPI.get(id).then((res) => res.data),
    enabled: Boolean(id),
  })

export const useSubmitQuiz = () =>
  useMutation({
    mutationFn: ({ id, answers }: any) =>
      quizAPI.submit(id, answers).then((res) => res.data),
  })
