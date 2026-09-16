import type { FC } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';

import { AppDispatch, RootState } from '../store';
import { fetchBoardData, moveTask } from '../store/slices/boardSlice';
import { ListColumn } from '../components/board/ListColumn';
import { TaskCard } from '../components/board/TaskCard';
import { Task } from '../types/board';

const BoardPage: FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentBoard, lists, tasks, isLoading, error } = useSelector((state: RootState) => state.board);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardData(boardId));
    }
  }, [boardId, dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: handle moving across lists during drag for visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // We are dragging a Task
    if (activeData.type === 'Task') {
      const task = activeData.task as Task;
      const fromListId = task.list;
      let toListId = '';
      let newOrder = task.order;

      // Dropped over a List column directly (empty list or end of list)
      if (overData.type === 'List') {
        toListId = overData.list._id;
        newOrder = tasks[toListId]?.length || 0; // Append to end
      } 
      // Dropped over another Task
      else if (overData.type === 'Task') {
        const overTask = overData.task as Task;
        toListId = overTask.list;
        
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newOrder = overTask.order + modifier; 
      }

      // Dispatch Redux action
      if (toListId) {
        dispatch(moveTask({
          taskId: activeId,
          fromListId,
          toListId,
          newOrder
        }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error || !currentBoard) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 m-8">
        {error || 'Board not found'}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Board Header */}
      <div className="px-6 py-4 bg-white/50 dark:bg-surface-900/50 backdrop-blur-md border-b border-slate-200 dark:border-surface-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentBoard.name}</h1>
          {currentBoard.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{currentBoard.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1,2,3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 bg-slate-200 dark:bg-surface-700"></div>
            ))}
            <button className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-surface-600 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full items-start">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {lists.map((list) => (
              <ListColumn 
                key={list._id} 
                list={list} 
                tasks={tasks[list._id] || []} 
              />
            ))}

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>

          {/* Add List Button */}
          <button className="flex-shrink-0 w-80 h-14 bg-white/40 dark:bg-surface-800/40 hover:bg-white/80 dark:hover:bg-surface-800/80 backdrop-blur-sm border border-slate-200 dark:border-surface-700 border-dashed rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all cursor-pointer font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add new list
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
