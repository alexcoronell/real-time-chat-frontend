/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { useChatStore } from '@/stores/useChatStore';
import type { Conversation } from '@/types/conversation';
import { Loader2 } from 'lucide-react';

// Interfaz para validación de respuestas
interface ConversationsListResponse {
  success: boolean;
  conversations: Conversation[];
  error?: string;
}

interface ConversationResult {
  success: boolean;
  conversation?: Conversation;
  error?: string;
}

export function ChatList() {
  const { socket, isConnected } = useSocket();
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

  // ✅ Estados de carga y error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Refs para handlers estables
  const conversationsListHandler = useRef<
    (data: ConversationsListResponse) => void
  >(() => {});
  const conversationResultHandler = useRef<(data: ConversationResult) => void>(
    () => {}
  );
  const conversationsUpdatedHandler = useRef<
    (data: { success: boolean; conversation: Conversation }) => void
  >(() => {});
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectConversation = useCallback(
    (conversationId: number) => {
      const chat = conversations.find((c) => c.id === conversationId);
      if (chat) {
        setSelectedConversation(chat);
      }
    },
    [conversations, setSelectedConversation]
  );

  // ✅ Actualización segura de conversaciones
  const updateConversationInList = useCallback(
    (newConversation: Conversation) => {
      setConversations((prev) => {
        // ✅ Tipo explícito para 'c'
        const existingIndex = prev.findIndex(
          (c: Conversation) => c.id === newConversation.id
        );

        if (existingIndex !== -1) {
          console.log(
            '📝 Actualizando conversación existente:',
            newConversation.id
          );
          const updated = [...prev];
          updated[existingIndex] = newConversation;
          return updated;
        } else {
          console.log('➕ Agregando nueva conversación:', newConversation.id);
          return [newConversation, ...prev];
        }
      });
    },
    [setConversations]
  );

  // ✅ Manejo seguro de carga inicial
  const loadConversations = useCallback(() => {
    if (!socket || !isConnected || !userId) return;

    setIsLoading(true);
    setError(null);

    console.log('📡 Solicitando conversaciones iniciales...');

    // ✅ Limpiar timeout anterior
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    // ✅ Configurar timeout seguro
    requestTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn('⏳ Timeout al cargar conversaciones');
        setIsLoading(false);
        setError('Timeout al cargar conversaciones');
      }
    }, 8000);

    // ✅ Solicitar conversaciones
    socket.emit('get_conversations', { userId });
  }, [socket, isConnected, userId, isLoading]);

  useEffect(() => {
    // ✅ Resetear estado al desconectarse
    if (!isConnected) {
      setIsLoading(true);
      setError(null);
      return;
    }

    // ✅ Definir handlers con validación
    conversationsListHandler.current = (data: ConversationsListResponse) => {
      // ✅ Validación estricta
      if (!data || typeof data !== 'object') {
        console.error('❌ Formato inválido para conversations_list:', data);
        return;
      }

      // ✅ Limpiar timeout al recibir respuesta
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      if (data.success && Array.isArray(data.conversations)) {
        console.log(
          '📋 Conversaciones iniciales recibidas:',
          data.conversations.length
        );
        setConversations(data.conversations);
        setIsLoading(false);
      } else {
        console.error('❌ Error al recibir conversaciones:', data.error);
        setIsLoading(false);
        setError(data.error || 'Error al cargar conversaciones');
      }
    };

    conversationResultHandler.current = (data: ConversationResult) => {
      if (!data || typeof data !== 'object') {
        console.error('❌ Formato inválido para conversation_result:', data);
        return;
      }

      if (data.success && data.conversation) {
        console.log(
          '⚡ Conversación creada inmediatamente:',
          data.conversation.id
        );
        updateConversationInList(data.conversation);
      } else {
        console.error('❌ Error en conversation_result:', data.error);
        setError(data.error || 'Error al crear conversación');
      }
    };

    conversationsUpdatedHandler.current = (data: {
      success: boolean;
      conversation: Conversation;
    }) => {
      if (!data || typeof data !== 'object' || !data.conversation) {
        console.error('❌ Formato inválido para conversations_updated:', data);
        return;
      }

      console.log('📝 conversations_updated recibido:', data.conversation.id);
      updateConversationInList(data.conversation);
    };

    // ✅ Registrar handlers
    if (socket) {
      socket.on('conversations_list', conversationsListHandler.current);
      socket.on('conversation_result', conversationResultHandler.current);
      socket.on('conversations_updated', conversationsUpdatedHandler.current);
    }

    // ✅ Solicitar conversaciones inmediatamente
    loadConversations();

    // ✅ Cleanup CORRECTO
    return () => {
      if (socket) {
        socket.off('conversations_list', conversationsListHandler.current);
        socket.off('conversation_result', conversationResultHandler.current);
        socket.off(
          'conversations_updated',
          conversationsUpdatedHandler.current
        );
      }

      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, [
    socket,
    isConnected,
    userId,
    loadConversations,
    updateConversationInList,
  ]);

  return (
    <SidebarGroup>
      <div className='px-2 py-2'>
        <h3 className='text-sm font-medium text-gray-500 mb-2 flex items-center'>
          Chats
          {/* ✅ Indicadores de estado */}
          {isLoading && (
            <span className='ml-2 text-xs text-blue-500 animate-pulse'>
              Cargando...
            </span>
          )}
          {error && (
            <span className='ml-2 text-xs text-yellow-500' title={error}>
              ⚠️
            </span>
          )}
        </h3>
      </div>

      <SidebarMenu>
        {/* ✅ Estado de carga */}
        {isLoading ? (
          <SidebarMenuItem>
            <div className='px-2 py-1 text-sm text-gray-400 flex items-center'>
              <Loader2 className='mr-2 h-4 w-4 animate-spin text-gray-400' />
              Cargando conversaciones...
            </div>
          </SidebarMenuItem>
        ) : error ? (
          <SidebarMenuItem>
            <div className='px-2 py-1 text-sm text-yellow-400 flex items-center'>
              <span className='mr-2'>⚠️</span>
              {error}
              <button
                onClick={loadConversations}
                className='ml-2 text-blue-500 hover:underline'
              >
                Reintentar
              </button>
            </div>
          </SidebarMenuItem>
        ) : conversations.length === 0 ? (
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
                className={`${
                  selectedConversation?.id === conversation.id
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-50'
                } transition-colors`}
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
