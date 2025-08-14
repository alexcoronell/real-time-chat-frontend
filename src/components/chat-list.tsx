import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { useChatStore } from '@/stores/useChatStore';
import { Conversation } from '@/types/conversation';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

export function ChatList() {
  const socketRef = useRef<Socket | null>(null);
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const user = useChatStore((state) => state.user);
  const userId = user?.id;

  useEffect(() => {
    if (!SERVER_URL || !userId) {
      console.log(
        'Faltan datos para la conexión, omitiendo la inicialización del socket.'
      );
      return;
    }

    if (socketRef.current) {
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
      console.log('🔗 Conectado al servidor Socket.IO.');
      socket.emit('get_conversations', { userId });
    });

    // 🚨 Corrección: Ahora `data` es el objeto `{ success, conversations }`.
    // Debemos acceder a `data.conversations` para obtener el array.
    socket.on(
      'conversations_list',
      (data: { success: boolean; conversations: Conversation[] }) => {
        if (data.success) {
          console.log('✅ Conversaciones recibidas:', data.conversations);
          setConversations(data.conversations);
        } else {
          console.error('❌ Error al recibir conversaciones:', data.error);
        }
      }
    );

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado del servidor:', reason);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('conversations_list');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, setConversations]);

  return (
    <SidebarGroup>
      <h3>Chats</h3>
      <SidebarMenu>
        {conversations.length === 0 ? (
          <SidebarMenuItem>
            <div className='px-2 py-1 text-sm text-gray-400'>
              No hay conversaciones
            </div>
          </SidebarMenuItem>
        ) : (
          conversations.map((conversation) => (
            <SidebarMenuItem key={conversation.id}>
              <SidebarMenuButton>{`Conversación #${conversation.id}`}</SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
