import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/services/axios';
import { FullPageLoader } from '@/components/Loader';

export default function Admin() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => axiosInstance.get('/admin/stats').then((r) => r.data.data),
  });

  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => axiosInstance.get('/admin/users', { params: { page: 1, limit: 20 } }).then((r) => r.data.data),
  });

  if (isLoading) return <FullPageLoader label="Loading admin panel…" />;

  const statCards = stats
    ? [
        { label: 'Users', value: stats.users },
        { label: 'Documents', value: stats.documents },
        { label: 'Quizzes', value: stats.quizzes },
        { label: 'Notes', value: stats.notes },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Platform-wide statistics and user management (admin only).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Registered Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {users?.docs?.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2.5 pr-4 font-medium text-slate-800 dark:text-slate-100">
                    {user.name}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="py-2.5 pr-4 capitalize text-slate-600 dark:text-slate-300">
                    {user.role}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
