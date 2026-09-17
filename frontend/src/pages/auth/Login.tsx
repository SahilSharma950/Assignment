import type { FC } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setApiError(null);
      const response = await authApi.login(data);
      const { user, accessToken } = response.data;
      login(user, accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || 'An unexpected error occurred during login.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account to continue</p>
        </div>

        <div className="glass-card p-8">
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-surface-900/50 border ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-surface-700 focus:border-transparent focus:ring-primary-500'
                } text-slate-900 dark:text-white focus:ring-2 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-surface-900/50 border ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-surface-700 focus:border-transparent focus:ring-primary-500'
                } text-slate-900 dark:text-white focus:ring-2 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-50 dark:focus:ring-offset-surface-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
