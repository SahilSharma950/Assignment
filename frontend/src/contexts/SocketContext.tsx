import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../config/index.js';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if we have an access token
    // NOTE: auth writes the token under the plain 'accessToken' key (see AuthContext),
    // not config.auth.accessTokenKey — kept in sync with that until they're unified.
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketInstance = io(config.api.baseUrl.replace('/api/v1', ''), {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'], // Prefer websocket, fallback to polling if needed
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
