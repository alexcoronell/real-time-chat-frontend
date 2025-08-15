/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { useChatStore } from '@/stores/useChatStore';
import type { User } from '@/types/user';

// Interfaz para validación de respuesta
interface UsersOnlineResponse {
  count: number;
  users: User[];
}

export function CurrentUsers() {
  const { socket, isConnected } = useSocket();
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const currentUser = useChatStore((state) => state.user);
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation
  );
  const loadingConversation = useChatStore(
    (state) => state.loadingConversation
  );
  const setLoadingConversation = useChatStore(
    (state) => state.setLoadingConversation
  );

  // ✅ Estado de carga inicial para usuarios
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  const usersOnlineHandler = useRef<(data: UsersOnlineResponse) => void>(
    () => {}
  );

  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) {
      setIsInitialLoading(true);
      return;
    }

    // ✅ Definir handlers con validación
    usersOnlineHandler.current = (data: unknown) => {
      const { users } = data as UsersOnlineResponse;
      setOnlineUsers(users);
      setIsInitialLoading(false);
      setLastRequestTime(Date.now());
    };

    socket.on('users_online', usersOnlineHandler.current);

    const requestUsers = () => {
      socket.emit('get_connected_users');
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }

      requestTimeoutRef.current = setTimeout(() => {
        const timeSinceLastRequest = lastRequestTime
          ? Date.now() - lastRequestTime
          : Infinity;

        if (isInitialLoading && timeSinceLastRequest > 5000) {
          setIsInitialLoading(false);
        }
      }, 5000);
    };

    // ✅ Solicitar usuarios inmediatamente y periódicamente
    requestUsers();

    // ✅ Reintentar cada 10 segundos si no hay respuesta
    const intervalId = setInterval(requestUsers, 10000);

    // ✅ Cleanup CORRECTO
    return () => {
      socket.off('users_online', usersOnlineHandler.current);

      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }

      clearInterval(intervalId);
    };
  }, [socket, isConnected]);

  const handleUserClick = (targetUser: User) => {
    setLoadingConversation(true);
    if (!socket || !isConnected || !currentUser?.id) {
      setLoadingConversation(false);
      return;
    }
    setLoadingConversation(true);
    socket.emit('check_or_create_conversation', {
      participantIds: [currentUser.id, targetUser.id],
    });
    socket.on('join_conversation_result', (data) => {
      setLoadingConversation(false);
      const { conversation } = data;
      setSelectedConversation(conversation.id);
    });
  };

  // ✅ Filtro simplificado y seguro (sin redundancia)
  const otherUsers = onlineUsers.filter((user) => user.id !== currentUser?.id);

  return (
    <SidebarGroup>
      <div className='px-2 py-2'>
        <h3 className='text-sm font-medium text-gray-500 mb-2 flex items-center'>
          Otros Usuarios Conectados ({otherUsers.length})
          {/* ✅ Indicadores mejorados */}
          {!isConnected && (
            <span
              className='ml-2 text-xs text-red-500'
              title='Desconectado del servidor'
            >
              ⚠️
            </span>
          )}
          {isInitialLoading && isConnected && (
            <span className='ml-2 text-xs text-blue-500 animate-pulse'>
              Cargando...
            </span>
          )}
        </h3>
      </div>
      <SidebarMenu>
        {/* ✅ Estado de carga inicial */}
        {isInitialLoading && isConnected ? (
          <SidebarMenuItem>
            <div className='px-2 py-1 text-sm text-gray-400 flex items-center'>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Cargando usuarios en línea...
            </div>
          </SidebarMenuItem>
        ) : otherUsers.length === 0 ? (
          <SidebarMenuItem>
            <div className='px-2 py-1 text-sm text-gray-400'>
              {!isConnected
                ? 'Desconectado del servidor'
                : 'No hay otros usuarios conectados'}
            </div>
          </SidebarMenuItem>
        ) : (
          otherUsers.map((user) => (
            <SidebarMenuItem key={user.id}>
              <SidebarMenuButton
                onDoubleClick={() => handleUserClick(user)}
                disabled={loadingConversation || !isConnected}
                className='transition-all hover:bg-gray-50'
              >
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                      {user.nickname}
                      {/* ✅ Indicador de loading mejorado */}
                      {loadingConversation && (
                        <span className='ml-2 text-xs text-gray-400'>⏳</span>
                      )}
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
