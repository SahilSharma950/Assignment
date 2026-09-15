import type { FC } from 'react';
import { Link } from 'react-router-dom';

const Dashboard: FC = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-surface-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-surface-800">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mini SaaS
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-surface-800">
                Overview
              </a>
              <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-surface-850 transition-colors">
                Workspaces
              </a>
              <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-surface-850 transition-colors">
                Settings
              </a>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-container py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, John Doe</p>
          </div>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-all hover:shadow-md">
            + New Workspace
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Workspaces', value: '4', trend: '+1 this week' },
            { label: 'Active Tasks', value: '12', trend: '3 due today' },
            { label: 'Unread Messages', value: '5', trend: 'In 2 channels' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-900">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                <span className="text-xs font-medium text-success-500">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Workspaces section */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Workspaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Link key={i} to={`/workspace/${i}`} className="group glass-card p-5 border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400">
                  Updated 2h ago
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Project Alpha
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                Main workspace for the new marketing campaign and product launch.
              </p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 bg-slate-200 dark:bg-surface-700 flex items-center justify-center text-xs font-medium">
                    U{j}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 bg-slate-100 dark:bg-surface-800 flex items-center justify-center text-xs font-medium text-slate-500">
                  +2
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
