import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { updateProfile } from '@/features/auth/authThunk';
import { Profile } from '@/components/Profile';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@/features/notification/notificationSlice';
import { getErrorMessage } from '@/utils/error';

export default function ProfilePage() {
  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm({
    defaultValues: { name: '', avatar: '' },
  });

  const onSubmit = async (values) => {
    if (!values.name.trim()) return;
    const action = await dispatch(updateProfile({ name: values.name.trim(), avatar: values.avatar }));
    if (updateProfile.fulfilled.match(action)) {
      dispatch(showNotification({ type: 'success', title: 'Profile updated', message: 'Your changes were saved.' }));
    } else {
      dispatch(showNotification({ type: 'error', message: getErrorMessage(action.payload) }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Profile onNavigate={() => navigate('/settings')} />

        <form onSubmit={handleSubmit(onSubmit)} className="card max-w-lg p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Edit Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" placeholder="Your full name" {...register('name')} />
            </div>
            <div>
              <label className="label">Avatar URL (optional)</label>
              <input className="input" placeholder="https://…" {...register('avatar')} />
            </div>
            <button type="submit" className="btn-primary w-full">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
