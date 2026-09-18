import { useState } from 'react'
import { useLeaderboard, useDashboardStats } from '../features/analytics/analyticsHooks'
import { Pagination, Filter } from '../components'
import { formatDate } from '../utils/format'

export default function AdminPage() {
  const [page, setPage] = useState(1)
  const { data: stats } = useDashboardStats()
  const { data: leaderboard } = useLeaderboard({ page, limit: 10 })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-2xl font-bold">{stats?.documents ?? 0}</p>
          <p className="text-sm text-gray-500">Total Documents</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{stats?.users ?? 0}</p>
          <p className="text-sm text-gray-500">Active Users</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{stats?.quizzes ?? 0}</p>
          <p className="text-sm text-gray-500">Quizzes Taken</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="font-semibold">Leaderboard</h2>
          <Filter
            options={[
              { key: 'weekly', label: 'Weekly' },
              { key: 'monthly', label: 'Monthly' },
              { key: 'alltime', label: 'All Time' },
            ]}
            value="weekly"
            onChange={() => {}}
            label="Leaderboard period"
          />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-800">
              <th className="px-6 py-3 font-medium">Rank</th>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard?.entries?.map((entry, index) => (
              <tr key={entry.userId} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-6 py-3 font-semibold">#{index + 1}</td>
                <td className="px-6 py-3">{entry.name}</td>
                <td className="px-6 py-3">{entry.score}</td>
                <td className="px-6 py-3 text-gray-500">{formatDate(entry.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaderboard?.totalPages > 1 && (
          <div className="p-4">
            <Pagination page={page} totalPages={leaderboard.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
