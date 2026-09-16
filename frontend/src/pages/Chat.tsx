import type { FC } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchChatHistory, messageReceived } from '../store/slices/chatSlice';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../context/AuthContext';

const Chat: FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isLoading, error } = useSelector((state: RootState) => state.chat);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load history and handle socket events
  useEffect(() => {
    if (workspaceId) {
      // 1. Fetch History
      dispatch(fetchChatHistory(workspaceId));

      // 2. Socket Handshake
      if (socket && isConnected) {
        socket.emit('join_workspace', workspaceId);

        const handleNewMessage = (message: any) => {
          // If we receive a message for this workspace, dispatch it to Redux
          if (message.workspace === workspaceId) {
            dispatch(messageReceived(message));
          }
        };

        socket.on('new_message', handleNewMessage);

        // Cleanup listener when leaving
        return () => {
          socket.off('new_message', handleNewMessage);
        };
      }
    }
  }, [workspaceId, dispatch, socket, isConnected]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected || !workspaceId) return;

    // Send over socket
    socket.emit('send_message', {
      workspaceId,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading chat history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 m-8">
        Failed to load chat: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl mix-blend-multiply filter pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl mix-blend-multiply filter pointer-events-none"></div>

      {/* Header */}
      <div className="px-6 py-4 bg-white/60 dark:bg-surface-900/60 backdrop-blur-md border-b border-slate-200 dark:border-surface-800 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Workspace Chat
              {!isConnected && (
                <span className="text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                  Disconnected
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time team communication</p>
          </div>
        </div>
      </div>

      {/* Chat Log */}
      <div className="flex-1 overflow-y-auto p-6 z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No messages yet</h3>
              <p className="text-slate-500 dark:text-slate-400">Be the first to break the ice!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender._id === user?.id;
              const showAvatar = idx === 0 || messages[idx - 1].sender._id !== msg.sender._id;
              
              return (
                <div key={msg._id} className={`flex gap-4 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                    showAvatar ? (isMine ? 'bg-gradient-to-tr from-accent-500 to-primary-500' : 'bg-gradient-to-tr from-primary-500 to-indigo-500') : 'invisible'
                  }`}>
                    {showAvatar ? msg.sender.name.charAt(0).toUpperCase() : ''}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showAvatar && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 mx-1">
                        {isMine ? 'You' : msg.sender.name}
                      </span>
                    )}
                    <div className={`px-5 py-3 rounded-2xl shadow-sm relative group ${
                      isMine 
                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-surface-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-surface-700 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                      <span className={`text-[10px] absolute bottom-1 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white/60 dark:bg-surface-900/60 backdrop-blur-md border-t border-slate-200 dark:border-surface-800 z-10 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Message workspace..." : "Connecting to chat..."}
            disabled={!isConnected}
            className="w-full pl-6 pr-14 py-4 rounded-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="absolute right-2 top-2 bottom-2 w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
