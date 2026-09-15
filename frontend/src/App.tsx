import type { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ─── Lazy-loaded page groups (split per route) ─────────────────────────────────
// Pages will be implemented in future tasks.
// Placeholder structure is established here for routing scaffold.

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';

const App: FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<div>Forgot Password</div>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/workspace/:workspaceId" element={<div>Workspace</div>} />
      <Route path="/workspace/:workspaceId/board/:boardId" element={<div>Board</div>} />
      <Route path="/workspace/:workspaceId/docs/:docId" element={<div>Document</div>} />
      <Route path="/workspace/:workspaceId/chat/:channelId" element={<div>Chat</div>} />

      {/* Error routes */}
      <Route path="/404" element={<div>404 Not Found</div>} />
      <Route path="/500" element={<div>500 Server Error</div>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default App;
