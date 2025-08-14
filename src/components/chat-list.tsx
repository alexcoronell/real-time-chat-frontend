// chat-list.tsx

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { useChatStore } from '@/stores/useChatStore';
import type { Conversation } from '@/types/conversation';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

export function ChatList() {
  const socketRef = useRef<Socket | null>(null);
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const user = useChatStore((state) => state.user);
  const userId = user?.id;
  const selectedConversation = useChatStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation
  );

  const handleSelectConversation = useCallback(
    (conversationId: number) => {
      const chat = conversations.find((c) => c.id === conversationId);
      if (chat) {
        setSelectedConversation(chat);
      }
    },
    [conversations, setSelectedConversation]
  );

  // ✅ Función para agregar/actualizar conversación de forma inteligente
  const updateConversationInList = useCallback(
    (newConversation: Conversation) => {
      console.log('🔄 Procesando conversación:', newConversation.id);

      const currentConversations = useChatStore.getState().conversations;
      const existingIndex = currentConversations.findIndex(
        (c) => c.id === newConversation.id
      );

      if (existingIndex !== -1) {
        // Ya existe, actualizar
        console.log(
          '📝 Actualizando conversación existente:',
          newConversation.id
        );
        const updated = [...currentConversations];
        updated[existingIndex] = newConversation;
        setConversations(updated);
      } else {
        // Nueva conversación, agregar al principio
        console.log('➕ Agregando nueva conversación:', newConversation.id);
        const newList = [newConversation, ...currentConversations];
        setConversations(newList);
      }
    },
    [setConversations]
  );

  // ✅ Función para agregar conversación inmediatamente (solo para el creador)
  const addConversationImmediately = useCallback(
    (newConversation: Conversation) => {
      console.log(
        '⚡ Agregando conversación INMEDIATAMENTE:',
        newConversation.id
      );
      updateConversationInList(newConversation);
    },
    [updateConversationInList]
  );

  useEffect(() => {
    if (!SERVER_URL || !userId) {
      console.log('⚠️ Faltan datos para la conexión');
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('🔗 Inicializando Socket.IO...');

    const socket = io(SERVER_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔗 Conectado al servidor Socket.IO');
      socket.emit('check_or_create_user', { nickname: user.nickname });
      socket.emit('get_conversations', { userId });
    });

    // ✅ Lista inicial de conversaciones
    socket.on(
      'conversations_list',
      (data: {
        success: boolean;
        conversations: Conversation[];
        error?: string;
      }) => {
        if (data.success && Array.isArray(data.conversations)) {
          console.log(
            '📋 Conversaciones iniciales recibidas:',
            data.conversations.length
          );
          setConversations(data.conversations);
        } else {
          console.error('❌ Error al recibir conversaciones:', data.error);
        }
      }
    );

    // ✅ CLAVE: Resultado inmediato al crear conversación
    socket.on(
      'conversation_result',
      (data: {
        success: boolean;
        conversation?: Conversation;
        error?: string;
      }) => {
        console.log('📨 Resultado de conversación recibido:', data);

        if (data.success && data.conversation) {
          // ✅ Agregar inmediatamente sin esperar otros eventos
          addConversationImmediately(data.conversation);
        } else {
          console.error('❌ Error en conversation_result:', data.error);
        }
      }
    );

    // ✅ Actualizaciones de conversaciones (principalmente para otros usuarios)
    socket.on(
      'conversations_updated',
      (data: { success: boolean; conversation: Conversation }) => {
        if (data.success && data.conversation) {
          console.log(
            '📝 conversations_updated recibido:',
            data.conversation.id
          );
          // Usar la misma función para evitar duplicados
          updateConversationInList(data.conversation);
        }
      }
    );

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado:', reason);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [
    userId,
    user?.nickname,
    setConversations,
    addConversationImmediately,
    updateConversationInList,
  ]);

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
              <SidebarMenuButton
                onClick={() => handleSelectConversation(conversation.id)}
                className={
                  selectedConversation?.id === conversation.id
                    ? 'bg-gray-200'
                    : ''
                }
              >
                {`Conversación #${conversation.id}`}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
