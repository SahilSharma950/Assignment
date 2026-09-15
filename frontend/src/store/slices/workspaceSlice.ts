import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    fetchWorkspacesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchWorkspacesSuccess: (state, action: PayloadAction<Workspace[]>) => {
      state.isLoading = false;
      state.workspaces = action.payload;
      state.error = null;
    },
    fetchWorkspacesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setActiveWorkspace: (state, action: PayloadAction<string>) => {
      state.activeWorkspaceId = action.payload;
    },
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(action.payload);
    },
    updateWorkspace: (state, action: PayloadAction<Workspace>) => {
      const index = state.workspaces.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.workspaces[index] = action.payload;
      }
    },
    deleteWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = null;
      }
    },
  },
});

export const {
  fetchWorkspacesStart,
  fetchWorkspacesSuccess,
  fetchWorkspacesFailure,
  setActiveWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
