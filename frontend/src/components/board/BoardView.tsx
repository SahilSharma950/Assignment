import { useState, useEffect } from 'react';
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
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ListColumn } from './ListColumn';
import { TaskCard } from './TaskCard';
import { RootState, AppDispatch } from '../../store';
import { fetchBoardData, moveTask, optimisticMoveTask } from '../../store/slices/boardSlice';
import type { Task } from '../../types/board';

interface BoardViewProps {
  boardId: string;
}

export const BoardView = ({ boardId }: BoardViewProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { lists, tasks, isLoading } = useSelector((state: RootState) => state.board);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchBoardData(boardId));
  }, [boardId, dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Prevents accidental drags on click
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverList = over.data.current?.type === 'List';

    if (!isActiveTask) return;

    const activeTask = active.data.current?.task as Task;
    const activeListId = activeTask.list;

    // Moving a Task over another Task
    if (isOverTask) {
      const overTask = over.data.current?.task as Task;
      const overListId = overTask.list;

      if (activeListId !== overListId) {
        // Moved to a new column instantly during drag
        dispatch(
          optimisticMoveTask({
            taskId: activeId.toString(),
            fromListId: activeListId,
            toListId: overListId,
            newOrder: overTask.order,
          })
        );
      }
    }
    // Moving a Task over an empty List
    else if (isOverList) {
      const overListId = overId.toString();
      if (activeListId !== overListId) {
        dispatch(
          optimisticMoveTask({
            taskId: activeId.toString(),
            fromListId: activeListId,
            toListId: overListId,
            newOrder: 0, // Top of empty list
          })
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskData = active.data.current?.task as Task;
    const overListId =
      over.data.current?.type === 'Task'
        ? (over.data.current?.task as Task).list
        : over.id.toString();

    // Determine the new order.
    // In a real app, calculate exact order based on index using fractional ordering or standardizing arrays.
    // For this assignment, we simplify by pushing the update to the backend with order based on current index.
    
    const targetTasks = tasks[overListId] || [];
    const activeIndex = targetTasks.findIndex((t) => t._id === active.id);
    const newOrder = activeIndex !== -1 ? activeIndex : targetTasks.length;

    dispatch(
      moveTask({
        taskId: active.id.toString(),
        fromListId: activeTask ? activeTask.list : activeTaskData.list,
        toListId: overListId,
        newOrder,
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-x-auto p-6 gap-6 items-start h-full custom-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {lists.map((list) => (
          <ListColumn key={list._id} list={list} tasks={tasks[list._id] || []} />
        ))}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
