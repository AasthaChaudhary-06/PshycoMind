import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '@/features/auth/authThunk';
import { showNotification } from '@/features/notification/notificationSlice';
import { loginSchema } from '@/types/schemas';
import { getErrorMessage } from '@/utils/error';

export default function Login() {
  const dispatch: any = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setError('');
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    const action = await dispatch(loginUser(parsed.data));
    if (loginUser.fulfilled.match(action)) {
      dispatch(showNotification({ type: 'success', title: 'Welcome back', message: 'Logged in successfully' }));
      navigate(from, { replace: true });
    } else {
      const message = getErrorMessage(action.payload, action.error?.message);
      setError(message);
      dispatch(
        showNotification({
          type: 'error',
          title: 'Login failed',
          message,
        }),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="you@university.edu" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Password</label>
        <input type="password" className="input" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </button>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        No account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
