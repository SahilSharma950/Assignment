import React, { FC, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white dark:bg-surface-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-surface-800 flex-shrink-0 relative hidden md:block">
        <div className="p-8 sticky top-0 h-screen flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Mini SaaS
            </span>
          </div>

          <nav className="flex-1 space-y-3">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-800'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </NavLink>
            <NavLink
              to="/workspaces"
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-800'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Workspaces
            </NavLink>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-800'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Chat
            </NavLink>
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-200 dark:border-surface-800">
            <div className="flex items-center gap-3 mb-5 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate w-32">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate w-32">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar Header */}
        <header className="bg-white dark:bg-surface-900 border-b border-slate-200 dark:border-surface-800 p-6 sm:p-8 flex items-center justify-between z-10 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white hidden sm:block">
            Dashboard Overview
          </h2>
          {/* Mobile brand (shown only on small screens) */}
          <div className="flex sm:hidden items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Mini SaaS</span>
          </div>

          <div className="flex items-center gap-4">
            <GlobalSearch />

            <ThemeToggle />
            
            {/* Notifications Button */}
            <NotificationDropdown />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 relative">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
