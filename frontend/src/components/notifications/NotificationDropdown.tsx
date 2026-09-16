import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchNotifications, markAsRead, markAllAsRead, notificationReceived } from '../../store/slices/notificationSlice';
import { useSocket } from '../../contexts/SocketContext';
import type { Notification } from '../../store/slices/notificationSlice';

export const NotificationDropdown: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, unreadCount, isLoading } = useSelector((state: RootState) => state.notification);
  const { socket, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Socket listener
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notification: Notification) => {
      dispatch(notificationReceived(notification));
      // Optionally show a toast here
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, isConnected, dispatch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markAllAsRead());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors rounded-full hover:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading && items.length === 0 ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((notification) => (
                  <li
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Avatar placeholder */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                          {notification.sender?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 break-words">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="flex-shrink-0 flex items-center">
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="w-2.5 h-2.5 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors"
                            title="Mark as read"
                          />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
