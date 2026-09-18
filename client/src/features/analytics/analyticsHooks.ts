import { useMutation, useQuery } from '@tanstack/react-query'
import analyticsAPI from '../../services/analyticsAPI'

export const analyticsKeys = {
  all: ['analytics'],
  dashboard: ['analytics', 'dashboard'],
  progress: (userId) => ['progress', userId],
  leaderboard: ['analytics', 'leaderboard'],
}

export const useDashboardStats = () =>
  useQuery({
    queryKey: analyticsKeys.dashboard,
    queryFn: () => analyticsAPI.getDashboard().then((res) => res.data),
  })

export const useLeaderboard = (params) =>
  useQuery({
    queryKey: [...analyticsKeys.leaderboard, params],
    queryFn: () => analyticsAPI.getLeaderboard(params).then((res) => res.data),
  })

export const useProgress = (userId) =>
  useQuery({
    queryKey: analyticsKeys.progress(userId),
    queryFn: () => analyticsAPI.getUserProgress(userId).then((res) => res.data),
    enabled: Boolean(userId),
  })

export const useStudyPlan = (userId) =>
  useMutation({
    mutationFn: () => analyticsAPI.getDashboard().then((res) => res.data),
  })
