// src/hooks/useServerStatus.ts

import { useChatStore } from '@/stores/useChatStore';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

export const useServerStatus = () => {
  const setServerStatus = useChatStore((state) => state.setServerStatus);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      path: '/chat',
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setServerStatus('connected');
    });

    socket.on('disconnect', () => {
      setServerStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Error de conexión con Socket.io:', err.message);
      setServerStatus('disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [setServerStatus]);
};