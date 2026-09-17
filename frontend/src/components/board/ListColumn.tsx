import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List, Task } from '../../types/board';
import { TaskCard } from './TaskCard';
import { AppDispatch } from '../../store';
import { createTask, renameList, deleteList } from '../../store/slices/boardSlice';

interface ListColumnProps {
  list: List;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const ListColumn = ({ list, tasks, onTaskClick }: ListColumnProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setNodeRef } = useDroppable({
    id: list._id,
    data: {
      type: 'List',
      list,
    },
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(list.name);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const taskInputRef = useRef<HTMLTextAreaElement>(null);

  const taskIds = tasks.map((task) => task._id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAddingTask) taskInputRef.current?.focus();
  }, [isAddingTask]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    setIsRenaming(false);
    if (trimmed && trimmed !== list.name) {
      dispatch(renameList({ listId: list._id, name: trimmed }));
    } else {
      setRenameValue(list.name);
    }
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (window.confirm(`Delete list "${list.name}" and all its tasks?`)) {
      dispatch(deleteList(list._id));
    }
  };

  const handleAddTask = async () => {
    const trimmed = taskTitle.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await dispatch(createTask({ listId: list._id, title: trimmed })).unwrap();
      setTaskTitle('');
      taskInputRef.current?.focus();
    } catch {
      // error surfaced via rejected thunk state elsewhere; keep the draft so the user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0 w-96 bg-surface-50 dark:bg-surface-900/50 backdrop-blur-md border border-slate-200 dark:border-surface-700/50 rounded-2xl">
      {/* Header */}
      <div className="flex-shrink-0 p-5 rounded-t-2xl border-b border-slate-200 dark:border-surface-700/50 bg-white/30 dark:bg-surface-800/30 flex items-center justify-between">
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') {
                setRenameValue(list.name);
                setIsRenaming(false);
              }
            }}
            className="font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-surface-800 border border-primary-500 rounded-lg px-2 py-1 w-full mr-2 outline-none"
          />
        ) : (
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {list.name}
            <span className="bg-slate-200 dark:bg-surface-700 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">
              {tasks.length}
            </span>
          </h3>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl shadow-xl overflow-hidden z-20">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsRenaming(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-700 transition-colors"
              >
                Rename list
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task List — grows to fit every task, no internal scroll */}
      <div ref={setNodeRef} className="p-4 space-y-4">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>

      {/* Add Task */}
      <div className="flex-shrink-0 p-4">
        {isAddingTask ? (
          <div className="space-y-2">
            <textarea
              ref={taskInputRef}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask();
                }
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setTaskTitle('');
                }
              }}
              placeholder="Enter a title for this task..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-800 border border-primary-500 text-sm text-slate-900 dark:text-white outline-none resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddTask}
                disabled={!taskTitle.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setTaskTitle('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        )}
      </div>
    </div>
  );
};
