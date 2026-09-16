import type { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ─── Lazy-loaded page groups (split per route) ─────────────────────────────────
// Pages will be implemented in future tasks.
// Placeholder structure is established here for routing scaffold.

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import { DashboardLayout } from './components/layout/DashboardLayout';

const App: FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<div>Forgot Password</div>} />

      {/* Protected routes wrapped in Dashboard Layout */}
      <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/workspace/:workspaceId" element={<DashboardLayout><Workspace /></DashboardLayout>} />
      <Route path="/workspace/:workspaceId/board/:boardId" element={<DashboardLayout><div>Board</div></DashboardLayout>} />
      <Route path="/workspace/:workspaceId/docs/:docId" element={<DashboardLayout><div>Document</div></DashboardLayout>} />
      <Route path="/workspace/:workspaceId/chat/:channelId" element={<DashboardLayout><div>Chat</div></DashboardLayout>} />

      {/* Error routes */}
      <Route path="/404" element={<div>404 Not Found</div>} />
      <Route path="/500" element={<div>500 Server Error</div>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default App;
