import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { fetchBoardData, moveTask, createList } from '../store/slices/boardSlice';
import { ListColumn } from '../components/board/ListColumn';
import { TaskCard } from '../components/board/TaskCard';
import { InviteMemberModal } from '../components/workspace/InviteMemberModal';
import { TaskDetailModal } from '../components/board/TaskDetailModal';
import { workspaceApi } from '../api/workspace';
import { boardApi } from '../api/board';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types/board';

const BoardPage: FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentBoard, lists, tasks, isLoading, error } = useSelector((state: RootState) => state.board);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSubmittingList, setIsSubmittingList] = useState(false);
  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);
  const boardMenuRef = useRef<HTMLDivElement>(null);

  const { data: membersData } = useQuery({
    queryKey: ['workspaceMembers', currentBoard?.workspace],
    queryFn: () => workspaceApi.getMembers(currentBoard!.workspace),
    enabled: !!currentBoard?.workspace,
  });
  const isOwner = !!user && membersData?.data.owner._id === user._id;
  const canDeleteBoard = isOwner || (!!user && currentBoard?.createdBy._id === user._id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boardMenuRef.current && !boardMenuRef.current.contains(event.target as Node)) {
        setIsBoardMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteBoard = async () => {
    if (!currentBoard) return;
    if (!window.confirm(`Delete board "${currentBoard.name}" and everything on it? This cannot be undone.`)) {
      return;
    }
    setIsDeletingBoard(true);
    try {
      await boardApi.delete(currentBoard._id);
      queryClient.invalidateQueries({ queryKey: ['workspaceBoards', currentBoard.workspace] });
      navigate(`/workspace/${currentBoard.workspace}`);
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Failed to delete board. Please try again.');
      setIsDeletingBoard(false);
    }
  };
  const members = membersData?.data.members ?? [];

  // Assignee picker should offer every other person in the workspace —
  // including the owner, who isn't in `members` — but never the current
  // user themselves (tasks are assigned to teammates, not to yourself).
  const assignableMembers = [
    ...(membersData?.data.owner ? [membersData.data.owner] : []),
    ...members,
  ].filter((member) => member._id !== user?._id);

  // Re-derive from live Redux state (not the stale click-time snapshot) so the
  // modal reflects assignee/due-date changes immediately after they save.
  const liveSelectedTask = selectedTask
    ? Object.values(tasks).flat().find((t) => t._id === selectedTask._id) ?? null
    : null;

  const handleAddList = async () => {
    const trimmed = newListName.trim();
    if (!trimmed || !boardId || isSubmittingList) return;
    setIsSubmittingList(true);
    try {
      await dispatch(createList({ boardId, name: trimmed })).unwrap();
      setNewListName('');
      setIsAddingList(false);
    } catch {
      // keep the form open with the draft so the user can retry
    } finally {
      setIsSubmittingList(false);
    }
  };

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
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="flex-shrink-0 px-8 py-6 bg-white/50 dark:bg-surface-900/50 backdrop-blur-md border-b border-slate-200 dark:border-surface-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentBoard.name}</h1>
            {currentBoard.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{currentBoard.description}</p>
            )}
          </div>

          {canDeleteBoard && (
            <div className="relative" ref={boardMenuRef}>
              <button
                onClick={() => setIsBoardMenuOpen((v) => !v)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {isBoardMenuOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl shadow-xl overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setIsBoardMenuOpen(false);
                      handleDeleteBoard();
                    }}
                    disabled={isDeletingBoard}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    {isDeletingBoard ? 'Deleting...' : 'Delete board'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {members.map((member) => (
              <div
                key={member._id}
                title={`${member.name} (${member.email})`}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-sm"
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {isOwner && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-surface-600 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 transition-colors"
                title="Manage workspace members"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Area — scrolls independently so long lists don't clip, header stays put */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex gap-8 items-start">
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
                onTaskClick={setSelectedTask}
              />
            ))}

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>

          {/* Add List */}
          {isAddingList ? (
            <div className="flex-shrink-0 w-96 bg-white dark:bg-surface-800 border border-primary-500 rounded-2xl p-4 space-y-3">
              <input
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddList();
                  if (e.key === 'Escape') {
                    setIsAddingList(false);
                    setNewListName('');
                  }
                }}
                placeholder="List name..."
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 text-sm text-slate-900 dark:text-white outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddList}
                  disabled={!newListName.trim() || isSubmittingList}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingList ? 'Adding...' : 'Add List'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingList(false);
                    setNewListName('');
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
              onClick={() => setIsAddingList(true)}
              className="flex-shrink-0 w-96 h-16 bg-white/40 dark:bg-surface-800/40 hover:bg-white/80 dark:hover:bg-surface-800/80 backdrop-blur-sm border border-slate-200 dark:border-surface-700 border-dashed rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all cursor-pointer font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add new list
            </button>
          )}
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        workspaceId={currentBoard.workspace}
        onClose={() => setIsInviteModalOpen(false)}
        onInvited={() => {
          queryClient.invalidateQueries({ queryKey: ['workspaceMembers', currentBoard.workspace] });
        }}
      />

      <TaskDetailModal
        task={liveSelectedTask}
        members={assignableMembers}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default BoardPage;
