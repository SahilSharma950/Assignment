import React, { useEffect, useState } from 'react';
import { setupPWA } from '../../pwa';

export const PwaUpdatePrompt: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFn, setUpdateFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const updateSW = setupPWA(
      () => setNeedRefresh(true),
      () => setOfflineReady(true)
    );
    setUpdateFn(() => updateSW);
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 rounded-xl shadow-2xl p-4 max-w-sm flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {needRefresh ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                )}
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {needRefresh ? 'Update available' : 'App ready for offline'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {needRefresh
                  ? 'A new version of the app is available. Reload to update.'
                  : 'The app has been cached and is ready to work offline.'}
              </p>
            </div>
          </div>
          <button onClick={close} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {needRefresh && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={close}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => updateFn && updateFn()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
            >
              Reload & Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
