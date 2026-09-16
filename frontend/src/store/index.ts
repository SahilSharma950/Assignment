import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import boardReducer from './slices/boardSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';

/**
 * Redux store configuration.
 *
 * Slices are added here as features are implemented in future tasks:
 *  - authSlice        → Task: Authentication
 *  - workspaceSlice   → Task: Workspace management
 *  - boardSlice       → Task: Kanban boards
 *  - documentSlice    → Task: Rich-text documents
 *  - chatSlice        → Task: Real-time messaging
 *  - notificationSlice → Task: Notifications
 *  - uiSlice          → Task: UI state (theme, sidebar, modals)
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    board: boardReducer,
    chat: chatReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Socket.io non-serializable values
        ignoredActions: ['socket/connected', 'socket/disconnected'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
