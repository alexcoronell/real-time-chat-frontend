import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { useChatStore } from '@/stores/useChatStore';
import type { User } from '@/types/user';

export function CurrentUsers() {
  const { socket, isConnected } = useSocket();
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const currentUser = useChatStore((state) => state.user);
  const nickname = useChatStore((state) => state.nickname); // ✅ Agregar nickname del store
  const loadingConversation = useChatStore(
    (state) => state.loadingConversation
  );
  const setLoadingConversation = useChatStore(
    (state) => state.setLoadingConversation
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Event listeners específicos para este componente
    socket.on('users_online', (data: { count: number; users: User[] }) => {
      console.log(`👥 Lista de usuarios actualizada: ${data.count} usuarios`);
      setOnlineUsers(data.users);
    });

    // ✅ Heartbeat específico para este componente
    socket.on('heartbeat_request', () => {
      console.log(
        '💖 Heartbeat request recibido del servidor, respondiendo...'
      );
      socket.emit('heartbeat_response');
    });

    // ✅ Cleanup local - remover solo los listeners de este componente
    return () => {
      socket.off('users_online');
      socket.off('heartbeat_request');
    };
  }, [socket, isConnected, nickname, setOnlineUsers]);

  // ✅ CORREGIDO: Usar socket directamente en lugar de socketRef
  const handleUserClick = (targetUser: User) => {
    if (!socket || !isConnected || !currentUser?.id) {
      console.error('❌ Socket no disponible o usuario no autenticado');
      return;
    }

    setLoadingConversation(true);

    const participantIds = [currentUser.id, targetUser.id];
    console.log(`💬 Solicitando chat con ${targetUser.nickname}`);

    // ✅ CORREGIDO: Usar socket en lugar de socketRef.current
    socket.emit('check_or_create_conversation', {
      participantIds,
    });

    // ✅ OPCIONAL: Agregar timeout para el loading
    setTimeout(() => {
      setLoadingConversation(false);
    }, 5000); // Reset loading después de 5 segundos si no hay respuesta
  };

  // ✅ MEJORADO: Filtro más seguro
  const otherUsers = onlineUsers.filter(
    (user) => user.id !== currentUser?.id && user.nickname !== nickname
  );

  return (
    <SidebarGroup>
      <div className='px-2 py-2'>
        <h3 className='text-sm font-medium text-gray-500 mb-2'>
          Otros Usuarios Conectados ({otherUsers.length})
          {/* ✅ Agregar indicador de conexión */}
          {!isConnected && (
            <span className='ml-2 text-xs text-red-500'>⚠️</span>
          )}
        </h3>
      </div>
      <SidebarMenu>
        {otherUsers.length === 0 ? (
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
              >
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                      {user.nickname}
                      {/* ✅ Indicador de loading */}
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
