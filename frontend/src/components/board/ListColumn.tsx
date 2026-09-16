import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List, Task } from '../../types/board';
import { TaskCard } from './TaskCard';

interface ListColumnProps {
  list: List;
  tasks: Task[];
}

export const ListColumn = ({ list, tasks }: ListColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: list._id,
    data: {
      type: 'List',
      list,
    },
  });

  const taskIds = tasks.map((task) => task._id);

  return (
    <div className="flex flex-col flex-shrink-0 w-80 max-h-full bg-surface-50 dark:bg-surface-900/50 backdrop-blur-md border border-slate-200 dark:border-surface-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-surface-700/50 bg-white/30 dark:bg-surface-800/30 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {list.name}
          <span className="bg-slate-200 dark:bg-surface-700 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">
            {tasks.length}
          </span>
        </h3>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px] custom-scrollbar"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <div className="p-3">
        <button className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
};
