import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi, type UserSummary } from '../../api/user';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: UserSummary) => void;
}

export const NewMessageModal: FC<NewMessageModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: userApi.list,
    enabled: isOpen,
  });

  const results = useMemo(() => {
    const all = data?.data ?? [];
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return all;
    return all.filter((u) => u.name.toLowerCase().includes(trimmed) || u.email.toLowerCase().includes(trimmed));
  }, [data, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Message</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
        />

        <div className="mt-3 max-h-72 overflow-y-auto space-y-1 -mx-2">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">Loading users...</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No matching users found.</div>
          ) : (
            results.map((u) => (
              <button
                key={u._id}
                onClick={() => onSelect(u)}
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
