import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { useChatStore } from '@/stores/useChatStore';
import type { User } from '@/types/user';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

export function CurrentUsers() {
  const socketRef = useRef<Socket | null>(null);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const currentUser = useChatStore((state) => state.user);

  useEffect(() => {
    if (!SERVER_URL || !currentUser?.nickname) {
      console.error('VITE_SOCKET_SERVER_URL o el nickname del usuario no están definidos.');
      return;
    }

    const socket = io(SERVER_URL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔗 Conectado al servidor Socket.IO');
      socket.emit('check_or_create_user', { nickname: currentUser.nickname });
    });

    socket.on('users_online', (data: { count: number; users: User[] }) => {
      console.log(`👥 Lista de usuarios actualizada: ${data.count} usuarios`);
      setOnlineUsers(data.users);
    });

    socket.on('check_or_create_user', (response) => {
      if (response.success) {
        console.log(`✅ Usuario ${response.user.nickname} registrado correctamente.`);
      } else {
        console.error('❌ Error al registrar el usuario:', response.error);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado del servidor:', reason);
      setOnlineUsers([]);
    });
    
    // 🚨 CRÍTICO: Responder al heartbeat del servidor.
    // Esto evita que el backend desconecte a los clientes inactivos.
    socket.on('heartbeat_request', () => {
      console.log('💖 Heartbeat request recibido del servidor, respondiendo...');
      socket.emit('heartbeat_response');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('users_online');
        socketRef.current.off('check_or_create_user');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.off('heartbeat_request'); // Limpiar el listener
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [setOnlineUsers, currentUser]);

  const otherUsers = onlineUsers.filter((user) => user.id !== currentUser?.id);
  
  return (
    <SidebarGroup>
      <div className="px-2 py-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Otros Usuarios Conectados ({otherUsers.length})
        </h3>
      </div>
      <SidebarMenu>
        {otherUsers.length === 0 ? (
          <SidebarMenuItem>
            <div className="px-2 py-1 text-sm text-gray-400">
              No hay otros usuarios conectados
            </div>
          </SidebarMenuItem>
        ) : (
          otherUsers.map((user) => (
            <SidebarMenuItem key={user.id}>
              <SidebarMenuButton>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.nickname}</span>
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