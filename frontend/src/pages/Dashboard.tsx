import type { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../api/analytics';

const Dashboard: FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: analyticsApi.getDashboardMetrics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Crunching analytics...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
        Failed to load dashboard metrics. Please try again later.
      </div>
    );
  }

  const { taskStatusDistribution, workspaceOverview, upcomingDeadlines } = data.data;

  // Calculate totals
  const totalWorkspaces = workspaceOverview.length;
  const totalTasks = taskStatusDistribution.reduce((acc, curr) => acc + curr.count, 0);
  const doneTasks = taskStatusDistribution.find((s) => s.status === 'Done')?.count || 0;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is what's happening across your workspaces.</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5">
          + New Workspace
        </button>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Workspaces</h3>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalWorkspaces}</div>
        </div>

        <div className="glass-card p-6 bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Active Tasks</h3>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalTasks}</div>
        </div>

        <div className="glass-card p-6 bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Completion Rate</h3>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{progressPercent}%</div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-surface-800 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-success-500 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workspaces Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Workspaces</h2>
          <div className="grid grid-cols-1 gap-4">
            {workspaceOverview.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-surface-900 rounded-2xl border border-dashed border-slate-300 dark:border-surface-700">
                <p className="text-slate-500 dark:text-slate-400">You haven't joined any workspaces yet.</p>
              </div>
            ) : (
              workspaceOverview.map((workspace) => (
                <Link
                  key={workspace._id}
                  to={`/workspace/${workspace._id}`}
                  className="flex items-center justify-between p-5 bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl hover:border-primary-500/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{workspace.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${workspace.role === 'Owner' ? 'bg-accent-500' : 'bg-primary-500'}`}></span>
                          {workspace.role}
                        </span>
                        <span>•</span>
                        <span>{workspace.boardCount} boards</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex -space-x-2">
                     <div className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 bg-slate-100 dark:bg-surface-800 flex items-center justify-center text-xs font-medium text-slate-500">
                      {workspace.memberCount}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h2>
          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl overflow-hidden">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">No upcoming tasks due. You're all caught up! 🎉</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-surface-800">
                {upcomingDeadlines.map((task) => {
                  const isUrgent = new Date(task.dueDate).getTime() - new Date().getTime() < 86400000; // < 24 hrs
                  
                  return (
                    <li key={task._id} className="p-5 hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${isUrgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-orange-400'}`}></div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {task.boardName} <span className="mx-1">•</span> {task.status}
                            </p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${isUrgent ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
