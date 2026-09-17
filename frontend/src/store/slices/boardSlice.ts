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

export const createList = createAsyncThunk(
  'board/createList',
  async (payload: { boardId: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/lists`, { boardId: payload.boardId, name: payload.name });
      return response.data.data as List;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create list');
    }
  }
);

export const renameList = createAsyncThunk(
  'board/renameList',
  async (payload: { listId: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/lists/${payload.listId}`, { name: payload.name });
      return response.data.data as List;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rename list');
    }
  }
);

export const deleteList = createAsyncThunk(
  'board/deleteList',
  async (listId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/lists/${listId}`);
      return listId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete list');
    }
  }
);

export const createTask = createAsyncThunk(
  'board/createTask',
  async (payload: { listId: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/tasks`, { listId: payload.listId, title: payload.title });
      return response.data.data as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export interface UpdateTaskDetailsPayload {
  taskId: string;
  title?: string;
  description?: string;
  dueDate?: string; // ISO datetime string
}

export const updateTaskDetails = createAsyncThunk(
  'board/updateTaskDetails',
  async (payload: UpdateTaskDetailsPayload, { rejectWithValue }) => {
    try {
      const { taskId, ...rest } = payload;
      const response = await apiClient.put(`/tasks/${taskId}`, rest);
      return response.data.data as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const assignTask = createAsyncThunk(
  'board/assignTask',
  async (payload: { taskId: string; assigneeId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/tasks/${payload.taskId}/assignees`, { assigneeId: payload.assigneeId });
      return response.data.data as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign task');
    }
  }
);

export const unassignTask = createAsyncThunk(
  'board/unassignTask',
  async (payload: { taskId: string; assigneeId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/tasks/${payload.taskId}/assignees/${payload.assigneeId}`);
      return response.data.data as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unassign task');
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
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
        state.tasks[action.payload._id] = [];
      })
      .addCase(renameList.fulfilled, (state, action) => {
        const list = state.lists.find((l) => l._id === action.payload._id);
        if (list) list.name = action.payload.name;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l._id !== action.payload);
        delete state.tasks[action.payload];
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload;
        if (!state.tasks[task.list]) {
          state.tasks[task.list] = [];
        }
        state.tasks[task.list].push(task);
      })
      .addMatcher(
        (action): action is PayloadAction<Task> =>
          [updateTaskDetails.fulfilled.type, assignTask.fulfilled.type, unassignTask.fulfilled.type].includes(action.type),
        (state, action) => {
          const task = action.payload;
          const list = state.tasks[task.list];
          if (!list) return;
          const index = list.findIndex((t) => t._id === task._id);
          if (index !== -1) list[index] = task;
        },
      );
  }
});

export const { optimisticMoveTask, revertMoveTask, taskCreatedEvent, taskUpdatedEvent, taskDeletedEvent } = boardSlice.actions;
export default boardSlice.reducer;
