import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchApi, type SearchResponse } from '../../api/search';

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['data'] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await searchApi.search(trimmed);
        setResults(response.data);
        setIsOpen(true);
      } catch {
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasResults = !!results && (results.tasks.length > 0 || results.boards.length > 0 || results.users.length > 0);

  return (
    <div className="relative hidden md:block" ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
        placeholder="Search tasks, boards, people..."
        className="w-64 px-4 py-2 pl-10 rounded-full bg-slate-100 dark:bg-surface-800 border-transparent focus:bg-white dark:focus:bg-surface-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm text-slate-900 dark:text-white transition-all outline-none"
      />
      <svg className="w-4 h-4 text-slate-400 absolute left-4 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute right-0 mt-2 w-96 max-h-[28rem] overflow-y-auto bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 rounded-2xl shadow-xl z-50 animate-fade-in">
          {isSearching ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">Searching...</div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No results for "{query}"</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-surface-800">
              {results!.tasks.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">Tasks</p>
                  {results!.tasks.map((task) => (
                    <Link
                      key={task._id}
                      to={`/workspace/${task.workspaceId}/board/${task.boardId}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {task.boardName} • {task.status}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {results!.boards.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">Boards</p>
                  {results!.boards.map((board) => (
                    <Link
                      key={board._id}
                      to={`/workspace/${board.workspace}/board/${board._id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{board.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{board.workspaceDoc?.name}</p>
                    </Link>
                  ))}
                </div>
              )}

              {results!.users.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">People</p>
                  {results!.users.map((user) => (
                    <div key={user._id} className="flex items-center gap-2 px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
