import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import { Board, List, Task } from '../../types/board';

interface BoardState {
  currentBoard: Board | null;
  lists: List[];
  tasks: Record<string, Task[]>; // Keyed by listId
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  currentBoard: null,
  lists: [],
  tasks: {},
  isLoading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchBoardData = createAsyncThunk(
  'board/fetchBoardData',
  async (boardId: string, { rejectWithValue }) => {
    try {
      // Assuming GET /api/v1/boards/:id exists
      const boardRes = await apiClient.get(`/boards/${boardId}`);
      // Get all lists
      const listsRes = await apiClient.get(`/lists/board/${boardId}`);
      
      // Fetch tasks for each list concurrently
      const tasksPromises = listsRes.data.data.map((list: List) => 
        apiClient.get(`/tasks/list/${list._id}`)
      );
      const tasksResponses = await Promise.all(tasksPromises);
      
      const tasksByList: Record<string, Task[]> = {};
      listsRes.data.data.forEach((list: List, index: number) => {
        tasksByList[list._id] = tasksResponses[index].data.data;
      });

      return {
        board: boardRes.data.data,
        lists: listsRes.data.data,
        tasks: tasksByList,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board data');
    }
  }
);

export interface MoveTaskPayload {
  taskId: string;
  fromListId: string;
  toListId: string;
  newOrder: number;
}

// Move task with optimistic update
export const moveTask = createAsyncThunk(
  'board/moveTask',
  async (payload: MoveTaskPayload, { dispatch, rejectWithValue }) => {
    // 1. Dispatch optimistic update immediately
    dispatch(optimisticMoveTask(payload));

    try {
      // 2. Make API call
      const response = await apiClient.put(`/tasks/${payload.taskId}`, {
        listId: payload.toListId,
        order: payload.newOrder,
      });
      return response.data.data;
    } catch (error: any) {
      // 3. Rollback if failed
      dispatch(revertMoveTask(payload));
      return rejectWithValue(error.response?.data?.message || 'Failed to move task');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    // Synchronous optimistic update
    optimisticMoveTask: (state, action: PayloadAction<MoveTaskPayload>) => {
      const { taskId, fromListId, toListId, newOrder } = action.payload;
      
      const sourceList = state.tasks[fromListId];
      if (!sourceList) return;

      const taskIndex = sourceList.findIndex(t => t._id === taskId);
      if (taskIndex === -1) return;

      const [task] = sourceList.splice(taskIndex, 1);
      
      // Update its reference
      task.list = toListId;
      task.order = newOrder;

      // Ensure destination list array exists
      if (!state.tasks[toListId]) {
        state.tasks[toListId] = [];
      }

      // If moving within same list, we must insert correctly based on new order
      // For simplicity in optimistic UI, we insert at the correct index derived from UI sorting,
      // but if the payload's newOrder is arbitrary, sorting by order is needed.
      state.tasks[toListId].push(task);
      state.tasks[toListId].sort((a, b) => a.order - b.order);
    },
    
    // Fallback rollback
    revertMoveTask: (state, action: PayloadAction<MoveTaskPayload>) => {
      // Stub
    },

    // ─── Real-time Event Handlers ─────────────────────────────────────────────
    taskCreatedEvent: (state, action: PayloadAction<Task>) => {
      const task = action.payload;
      if (!state.tasks[task.list]) {
        state.tasks[task.list] = [];
      }
      // Only push if it doesn't already exist (avoid dupes from creator's own emit)
      if (!state.tasks[task.list].find(t => t._id === task._id)) {
        state.tasks[task.list].push(task);
        state.tasks[task.list].sort((a, b) => a.order - b.order);
      }
    },
    taskUpdatedEvent: (state, action: PayloadAction<Task>) => {
      const updatedTask = action.payload;
      
      // If we don't know the list, ignore
      if (!state.tasks[updatedTask.list]) {
        state.tasks[updatedTask.list] = [];
      }

      // Check if it exists in the *current* target list
      const targetListIndex = state.tasks[updatedTask.list].findIndex(t => t._id === updatedTask._id);
      
      if (targetListIndex !== -1) {
        // It's already in the target list, just update it inline
        state.tasks[updatedTask.list][targetListIndex] = updatedTask;
        state.tasks[updatedTask.list].sort((a, b) => a.order - b.order);
      } else {
        // It's not in the target list, meaning it was MOVED from another list.
        // We need to find and remove it from the old list.
        for (const [listId, tasks] of Object.entries(state.tasks)) {
          const oldIndex = tasks.findIndex(t => t._id === updatedTask._id);
          if (oldIndex !== -1) {
            tasks.splice(oldIndex, 1);
            break;
          }
        }
        // Insert into the new list
        state.tasks[updatedTask.list].push(updatedTask);
        state.tasks[updatedTask.list].sort((a, b) => a.order - b.order);
      }
    },
    taskDeletedEvent: (state, action: PayloadAction<{ taskId: string, listId: string }>) => {
      const { taskId, listId } = action.payload;
      if (state.tasks[listId]) {
        state.tasks[listId] = state.tasks[listId].filter(t => t._id !== taskId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBoard = action.payload.board;
        state.lists = action.payload.lists;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchBoardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { optimisticMoveTask, revertMoveTask, taskCreatedEvent, taskUpdatedEvent, taskDeletedEvent } = boardSlice.actions;
export default boardSlice.reducer;
