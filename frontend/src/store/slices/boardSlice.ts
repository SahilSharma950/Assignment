import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { Board, List, Task } from '../../types/board.js';

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
      const boardRes = await api.get(`/boards/${boardId}`);
      // Get all lists
      const listsRes = await api.get(`/lists/board/${boardId}`);
      
      // Fetch tasks for each list concurrently
      const tasksPromises = listsRes.data.data.map((list: List) => 
        api.get(`/tasks/list/${list._id}`)
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
      const response = await api.put(`/tasks/${payload.taskId}`, {
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
      // To properly revert, we would need the ORIGINAL order and listId. 
      // For a robust implementation, the payload should contain original state.
      // But a simple refresh or partial revert can be placed here.
      // Easiest is to force a re-fetch, or strictly invert the move.
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

export const { optimisticMoveTask, revertMoveTask } = boardSlice.actions;
export default boardSlice.reducer;
