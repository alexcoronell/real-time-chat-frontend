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
  const heartbeatHandler = useRef<() => void>(() => {});
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) {
      setIsInitialLoading(true);
      return;
    }

    // ✅ Definir handlers con validación
    usersOnlineHandler.current = (data: unknown) => {
      // ✅ Validación estricta de respuesta
      if (!data || typeof data !== 'object' || !('users' in data)) {
        console.error(
          '❌ Formato de respuesta inválido para users_online:',
          data
        );
        return;
      }

      const { users } = data as UsersOnlineResponse;

      if (!Array.isArray(users)) {
        console.error('❌ El campo "users" debe ser un array:', data);
        return;
      }

      console.log(`👥 Usuarios actualizados: ${users.length}`);
      setOnlineUsers(users);
      setIsInitialLoading(false); // ✅ Marcar como cargado
      setLastRequestTime(Date.now()); // ✅ Registrar tiempo de última respuesta
    };

    heartbeatHandler.current = () => {
      console.log('💖 Heartbeat request recibido');
      if (socket.connected) {
        socket.emit('heartbeat_response');
      }
    };

    // ✅ Registrar handlers específicos
    socket.on('users_online', usersOnlineHandler.current);
    socket.on('heartbeat_request', heartbeatHandler.current);

    // ✅ SOLUCIÓN CRÍTICA: Usar el NOMBRE CORRECTO del evento
    const requestUsers = () => {
      console.log('📡 Solicitando lista de usuarios conectados...');
      socket.emit('get_connected_users');

      // ✅ Configurar timeout para detectar falta de respuesta
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }

      requestTimeoutRef.current = setTimeout(() => {
        const timeSinceLastRequest = lastRequestTime
          ? Date.now() - lastRequestTime
          : Infinity;

        if (isInitialLoading && timeSinceLastRequest > 5000) {
          console.warn('⚠️ No se recibió respuesta de usuarios después de 5s');
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
      socket.off('heartbeat_request', heartbeatHandler.current);

      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }

      clearInterval(intervalId);
    };
  }, [socket, isConnected]);

  // ✅ Manejo seguro de clics con timeout gestionado
  const handleUserClick = (targetUser: User) => {
    if (!socket || !isConnected || !currentUser?.id) {
      console.error('❌ Socket no disponible o usuario no autenticado');
      setLoadingConversation(false);
      return;
    }

    setLoadingConversation(true);
    console.log(`💬 Solicitando chat con ${targetUser.nickname}`);

    // ✅ Limpiar timeout anterior si existe
    if (conversationTimeoutRef.current) {
      clearTimeout(conversationTimeoutRef.current);
    }

    // ✅ Timeout seguro con cleanup
    conversationTimeoutRef.current = setTimeout(() => {
      if (loadingConversation) {
        console.warn('⏳ Timeout al crear conversación');
        setLoadingConversation(false);
      }
    }, 10000);

    // ✅ Callback para manejar respuesta
    socket.emit(
      'check_or_create_conversation',
      { participantIds: [currentUser.id, targetUser.id] },
      (response: { success: boolean; error?: string }) => {
        // ✅ Limpiar timeout al recibir respuesta
        if (conversationTimeoutRef.current) {
          clearTimeout(conversationTimeoutRef.current);
          conversationTimeoutRef.current = null;
        }

        setLoadingConversation(false);

        if (!response.success) {
          console.error('❌ Error al crear conversación:', response.error);
          // Aquí podrías mostrar un toast de error
        }
      }
    );
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
