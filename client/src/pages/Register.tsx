import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@/features/auth/authThunk';
import { showNotification } from '@/features/notification/notificationSlice';
import { registerSchema } from '@/types/schemas';
import { getErrorMessage } from '@/utils/error';

export default function Register() {
  const dispatch: any = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', password: '', confirmPassword: '' } });

  const onSubmit = async (values) => {
    setError('');
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    const { confirmPassword, ...payload } = parsed.data;
    const action = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(action)) {
      dispatch(
        showNotification({ type: 'success', title: 'Account created', message: 'Welcome to PhysioMind!' }),
      );
      navigate('/dashboard');
    } else {
      const message = getErrorMessage(action.payload, action.error?.message);
      setError(message);
      dispatch(
        showNotification({ type: 'error', title: 'Registration failed', message }),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Full name</label>
        <input className="input" placeholder="Jane Doe" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="you@university.edu" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Password</label>
        <input type="password" className="input" placeholder="Minimum 8 characters" {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label className="label">Confirm password</label>
        <input type="password" className="input" placeholder="Repeat password" {...register('confirmPassword')} />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create Account'}
      </button>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
