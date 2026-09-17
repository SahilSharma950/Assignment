import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspace';
import { directMessageApi } from '../api/directMessage';
import type { UserSummary } from '../api/user';
import { GroupChatPanel } from '../components/chat/GroupChatPanel';
import { DirectMessagePanel } from '../components/chat/DirectMessagePanel';
import { NewMessageModal } from '../components/chat/NewMessageModal';
import { useSocket } from '../contexts/SocketContext';

type SelectedConversation =
  | { type: 'group'; workspaceId: string; workspaceName: string }
  | { type: 'dm'; userId: string; userName: string; userEmail: string; userAvatar?: string }
  | null;

const ChatHub: FC = () => {
  const [selected, setSelected] = useState<SelectedConversation>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data: workspacesData } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getAll,
  });
  const workspaces = workspacesData?.data ?? [];

  const { data: conversationsData } = useQuery({
    queryKey: ['dmConversations'],
    queryFn: directMessageApi.getConversations,
  });
  const conversations = conversationsData?.data ?? [];

  // Keep the sidebar's conversation list current when a DM arrives anywhere,
  // so a brand-new conversation shows up without a manual refresh.
  useEffect(() => {
    if (!socket) return;
    const handler = () => queryClient.invalidateQueries({ queryKey: ['dmConversations'] });
    socket.on('newDirectMessage', handler);
    return () => {
      socket.off('newDirectMessage', handler);
    };
  }, [socket, queryClient]);

  const handleSelectNewUser = (user: UserSummary) => {
    setIsNewMessageOpen(false);
    setSelected({ type: 'dm', userId: user._id, userName: user.name, userEmail: user.email, userAvatar: user.avatar });
  };

  return (
    <div className="h-full flex rounded-2xl overflow-hidden border border-slate-200 dark:border-surface-800">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-surface-900 border-r border-slate-200 dark:border-surface-800 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-surface-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-7">
          {/* Direct Messages */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-semibold uppercase text-slate-400">Direct Messages</h3>
              <button
                onClick={() => setIsNewMessageOpen(true)}
                title="New message"
                className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <p className="px-2 text-sm text-slate-400">No conversations yet</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.userId}
                    onClick={() =>
                      setSelected({ type: 'dm', userId: c.userId, userName: c.name, userEmail: c.email, userAvatar: c.avatar })
                    }
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left ${
                      selected?.type === 'dm' && selected.userId === c.userId
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Group Chats */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-slate-400 px-2 mb-2">Group Chats</h3>
            <div className="space-y-1">
              {workspaces.length === 0 ? (
                <p className="px-2 text-sm text-slate-400">No workspaces yet</p>
              ) : (
                workspaces.map((w) => (
                  <button
                    key={w._id}
                    onClick={() => setSelected({ type: 'group', workspaceId: w._id, workspaceName: w.name })}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left ${
                      selected?.type === 'group' && selected.workspaceId === w._id
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{w.name}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Conversation */}
      <div className="flex-1 min-w-0">
        {selected?.type === 'group' ? (
          <GroupChatPanel workspaceId={selected.workspaceId} workspaceName={selected.workspaceName} />
        ) : selected?.type === 'dm' ? (
          <DirectMessagePanel
            otherUser={{ _id: selected.userId, name: selected.userName, email: selected.userEmail, avatar: selected.userAvatar }}
            onMessageSent={() => queryClient.invalidateQueries({ queryKey: ['dmConversations'] })}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-center p-8 bg-surface-50 dark:bg-surface-950">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Select a conversation</h3>
              <p className="text-slate-500 dark:text-slate-400">Pick a workspace or a person to start chatting.</p>
            </div>
          </div>
        )}
      </div>

      <NewMessageModal isOpen={isNewMessageOpen} onClose={() => setIsNewMessageOpen(false)} onSelect={handleSelectNewUser} />
    </div>
  );
};

export default ChatHub;
