import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { changePassword } from '@/features/auth/authThunk';
import { useTheme } from '@/hooks/useTheme';
import { showNotification } from '@/features/notification/notificationSlice';
import { getErrorMessage } from '@/utils/error';

export default function Settings() {
  const dispatch: any = useDispatch();
  const { mode, set, isDark } = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '' } });

  const onSubmit = async (values) => {
    const action = await dispatch(changePassword(values));
    if (changePassword.fulfilled.match(action)) {
      dispatch(showNotification({ type: 'success', title: 'Password changed', message: 'Your password was updated.' }));
      reset();
    } else {
      dispatch(showNotification({ type: 'error', title: 'Failed', message: getErrorMessage(action.payload) }));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Appearance and security preferences.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Appearance</h2>
        <div className="flex gap-3">
          {['light', 'dark'].map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => set(theme)}
              className={`flex-1 rounded-lg border p-4 text-center text-sm font-medium capitalize transition-colors ${
                mode === theme
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {isDark ? 'Dark mode is enabled.' : 'Light mode is enabled.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              {...register('currentPassword')}
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              placeholder="Minimum 8 characters"
              {...register('newPassword')}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
