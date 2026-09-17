import type { FC } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { workspaceApi, type Workspace } from '../../api/workspace';

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100),
  description: z.string().max(500).optional(),
});

type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workspace: Workspace) => void;
}

export const CreateWorkspaceModal: FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, onCreated }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: CreateWorkspaceValues) => {
    try {
      const response = await workspaceApi.create(values);
      onCreated(response.data);
      onClose();
    } catch (err: any) {
      setError('root', {
        message: err.response?.data?.message || 'Failed to create workspace. Please try again.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Workspace</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errors.root && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="ws-name">
              Name
            </label>
            <input
              id="ws-name"
              type="text"
              autoFocus
              {...register('name')}
              placeholder="Acme Product Team"
              className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border ${
                errors.name ? 'border-red-500/50' : 'border-slate-200 dark:border-surface-700'
              } text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="ws-description">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="ws-description"
              rows={3}
              {...register('description')}
              placeholder="What's this workspace for?"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
