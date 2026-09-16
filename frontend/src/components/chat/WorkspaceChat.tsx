import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchChatHistory, messageReceived, clearChat } from '../../store/slices/chatSlice';
import { useSocket } from '../../contexts/SocketContext';
import type { ChatMessage } from '../../store/slices/chatSlice';

interface WorkspaceChatProps {
  workspaceId: string;
}

export const WorkspaceChat: React.FC<WorkspaceChatProps> = ({ workspaceId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { socket, isConnected } = useSocket();
  const [inputValue, setInputValue] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Fetch initial history and setup socket listeners
  useEffect(() => {
    dispatch(fetchChatHistory(workspaceId));

    if (socket && isConnected) {
      socket.emit('joinWorkspace', workspaceId);

      const handleNewMessage = (message: ChatMessage) => {
        dispatch(messageReceived(message));
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.emit('leaveWorkspace', workspaceId);
        socket.off('newMessage', handleNewMessage);
        dispatch(clearChat());
      };
    }
  }, [workspaceId, socket, isConnected, dispatch]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket || !isConnected) return;

    socket.emit('sendMessage', { workspaceId, content: inputValue });
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-lg w-80">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Workspace Chat</h3>
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === user?.id;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-400 mb-1 px-1">
                  {isMe ? 'You' : msg.sender.name}
                </span>
                <div
                  className={`px-3 py-2 rounded-lg max-w-[90%] text-sm ${
                    isMe
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected}
            className="px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
