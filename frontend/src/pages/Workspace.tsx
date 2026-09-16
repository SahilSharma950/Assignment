import type { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { boardApi } from '../api/board';

const Workspace: FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['workspaceBoards', workspaceId],
    queryFn: ({ pageParam = 1 }) => boardApi.getWorkspaceBoards(workspaceId!, pageParam, 12),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data;
      if (pagination.hasMore) {
        return pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!workspaceId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading workspace boards...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
        Failed to load boards. Please try again later.
      </div>
    );
  }

  // Flatten the pages array into a single array of boards
  const boards = data?.pages.flatMap((page) => page.data.data) || [];
  const totalCount = data?.pages[0]?.data?.pagination?.total || 0;

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workspace Boards
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {totalCount} total boards in this workspace.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-2xl border border-dashed border-slate-300 dark:border-surface-700">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No boards found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Get started by creating your first board in this workspace to track your tasks.
          </p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={boards.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              You've reached the end of the boards list.
            </div>
          }
          style={{ overflow: 'visible' }} // required for grid layout inside InfiniteScroll
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/workspace/${workspaceId}/board/${board._id}`}
                className="group flex flex-col h-full bg-white dark:bg-surface-900 rounded-2xl border border-slate-200 dark:border-surface-800 overflow-hidden hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Board Card Banner */}
                <div className="h-24 w-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 group-hover:from-indigo-500/30 group-hover:via-purple-500/30 group-hover:to-fuchsia-500/30 transition-colors relative">
                  <div className="absolute top-4 right-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                    {new Date(board.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Board Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                    {board.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1 mb-4">
                    {board.description || 'No description provided for this board.'}
                  </p>
                  
                  {/* Board Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-surface-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {board.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                        {board.createdBy.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Workspace;
