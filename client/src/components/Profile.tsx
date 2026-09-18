import { useSelector } from 'react-redux';
import { selectUser } from '@/features/auth/authSelectors';
import { ROLE_LABELS } from '@/types/roles';

export function Profile({ onNavigate }: any) {
  const user = useSelector(selectUser);

  return (
    <div className="card max-w-lg p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Member since</dt>
          <dd className="font-medium text-slate-900 dark:text-white">
            {new Date(user?.createdAt).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Theme</dt>
          <dd className="font-medium capitalize text-slate-900 dark:text-white">
            {user?.preferences?.theme || 'system'}
          </dd>
        </div>
      </dl>

      <button type="button" className="btn-primary mt-6 w-full" onClick={onNavigate}>
        Edit Settings
      </button>
    </div>
  );
}

export default Profile;
