import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/board';
import { getDueDateBadge } from '../../utils';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 ring-2 ring-primary-500 rounded-xl bg-surface-100 dark:bg-surface-800 p-4 h-[100px]"
      />
    );
  }

  const dueDateBadge = task.dueDate ? getDueDateBadge(task.dueDate) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm border border-slate-200 dark:border-surface-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-4">
        <div className="flex -space-x-2">
          {task.assignees?.map((assignee) => (
            <div
              key={assignee._id}
              className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 border-2 border-white dark:border-surface-800 flex items-center justify-center text-[10px] font-medium text-primary-700 dark:text-primary-400"
              title={assignee.name}
            >
              {assignee.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        {dueDateBadge && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${dueDateBadge.colorClasses}`}>
            {dueDateBadge.label}
          </span>
        )}
      </div>
    </div>
  );
};
