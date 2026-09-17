import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNotifications, markAsRead, markAllAsRead, notificationReceived } from '../../store/slices/notificationSlice';
import { useSocket } from '../../contexts/SocketContext';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { items, unreadCount, isLoading } = useSelector((state: RootState) => state.notification);
  const { socket, isConnected } = useSocket();

  // Load initial notifications
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Listen for socket events
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewNotification = (notification: any) => {
        dispatch(notificationReceived(notification));
      };
      
      socket.on('notification', handleNewNotification);
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket, isConnected, dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors relative"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-surface-900 text-[8px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in origin-top-right">
          <div className="p-4 border-b border-slate-100 dark:border-surface-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 text-xs py-0.5 px-2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading && items.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto mb-2"></div>
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-surface-800">
                {items.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {notif.sender?.avatar ? (
                        <img src={notif.sender.avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {notif.sender?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-slate-900 dark:text-slate-100 ${!notif.isRead ? 'font-medium' : ''}`}>
                        {notif.content}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
