import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { directMessageApi, type DirectMessage } from '../../api/directMessage';

interface DirectMessagePanelProps {
  otherUser: { _id: string; name: string; email: string; avatar?: string };
  onMessageSent?: () => void;
}

export const DirectMessagePanel = ({ otherUser, onMessageSent }: DirectMessagePanelProps) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    directMessageApi
      .getConversation(otherUser._id)
      .then((res) => {
        if (!cancelled) setMessages(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load conversation');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [otherUser._id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: DirectMessage) => {
      const isForThisConversation =
        (message.sender._id === otherUser._id && message.recipient._id === user?._id) ||
        (message.sender._id === user?._id && message.recipient._id === otherUser._id);
      if (!isForThisConversation) return;

      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
    };

    socket.on('newDirectMessage', handleNewMessage);
    return () => {
      socket.off('newDirectMessage', handleNewMessage);
    };
  }, [socket, otherUser._id, user?._id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !socket || !isConnected) return;

    socket.emit('sendDirectMessage', { recipientId: otherUser._id, content: trimmed }, (ack: { status: string; error?: string }) => {
      if (ack?.status === 'error') {
        setError(ack.error || 'Failed to send message');
      }
    });

    setNewMessage('');
    onMessageSent?.();
  };

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="px-8 py-5 bg-white/60 dark:bg-surface-900/60 backdrop-blur-md border-b border-slate-200 dark:border-surface-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
            {otherUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {otherUser.name}
              {!isConnected && (
                <span className="text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                  Disconnected
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{otherUser.email}</p>
          </div>
        </div>
      </div>

      {/* Message Log */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading conversation...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-7">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No messages yet</h3>
                <p className="text-slate-500 dark:text-slate-400">Say hello to {otherUser.name}!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.sender._id === user?._id;
                const showAvatar = idx === 0 || messages[idx - 1].sender._id !== msg.sender._id;

                return (
                  <div key={msg._id} className={`flex gap-4 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                      showAvatar ? (isMine ? 'bg-gradient-to-tr from-accent-500 to-primary-500' : 'bg-gradient-to-tr from-primary-500 to-indigo-500') : 'invisible'
                    }`}>
                      {showAvatar ? msg.sender.name.charAt(0).toUpperCase() : ''}
                    </div>

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
      )}

      {/* Input Area */}
      <div className="p-6 bg-white/60 dark:bg-surface-900/60 backdrop-blur-md border-t border-slate-200 dark:border-surface-800 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? `Message ${otherUser.name}...` : 'Connecting to chat...'}
            disabled={!isConnected}
            className="w-full pl-6 pr-14 py-3.5 rounded-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="absolute right-2 top-2 bottom-2 w-9 h-9 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
