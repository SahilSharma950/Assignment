import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceApi, type Workspace } from '../api/workspace';
import { CreateWorkspaceModal } from '../components/workspace/CreateWorkspaceModal';
import { useAuth } from '../context/AuthContext';

const Workspaces: FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getAll,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-workspace-menu-root]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreated = (workspace: Workspace) => {
    queryClient.setQueryData(['workspaces'], (old: Awaited<ReturnType<typeof workspaceApi.getAll>> | undefined) =>
      old ? { ...old, data: [workspace, ...old.data] } : old,
    );
    queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
  };

  const handleDelete = async (workspace: Workspace) => {
    setOpenMenuId(null);
    if (!window.confirm(`Delete workspace "${workspace.name}" and everything in it — all its boards, lists, and tasks? This cannot be undone.`)) {
      return;
    }
    setDeletingId(workspace._id);
    try {
      await workspaceApi.delete(workspace._id);
      queryClient.setQueryData(['workspaces'], (old: Awaited<ReturnType<typeof workspaceApi.getAll>> | undefined) =>
        old ? { ...old, data: old.data.filter((w) => w._id !== workspace._id) } : old,
      );
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Failed to delete workspace. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const workspaces = data?.data ?? [];

  return (
    <div className="animate-fade-in space-y-10 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Workspaces</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">All the workspaces you own or belong to.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Workspace
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
          Failed to load workspaces. Please try again later.
        </div>
      ) : workspaces.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-2xl border border-dashed border-slate-300 dark:border-surface-700">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No workspaces yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Create your first workspace to start organizing boards and tasks.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            New Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {workspaces.map((workspace) => {
            const isOwner = !!user && workspace.owner === user._id;
            return (
              <Link
                key={workspace._id}
                to={`/workspace/${workspace._id}`}
                className="group relative flex flex-col h-full bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl p-7 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 transform hover:-translate-y-1"
              >
                {isOwner && (
                  <div className="absolute top-4 right-4 z-10" data-workspace-menu-root>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId((id) => (id === workspace._id ? null : workspace._id));
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {openMenuId === workspace._id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl shadow-xl overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(workspace);
                          }}
                          disabled={deletingId === workspace._id}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                          {deletingId === workspace._id ? 'Deleting...' : 'Delete workspace'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors pr-6">
                  {workspace.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                  {workspace.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-surface-800 text-xs text-slate-500 dark:text-slate-400">
                  <span>{workspace.members.length} member{workspace.members.length === 1 ? '' : 's'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default Workspaces;
