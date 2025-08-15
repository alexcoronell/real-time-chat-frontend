import { create } from 'zustand';

/* Interfaces */
import type { Conversation } from '@/types/conversation';
import type { User } from '@/types/user';

interface ChatState {
    nickname: string | null;
    user: User | null;
    onlineUsers: User[];
    loadingConversation: boolean
    conversations: Conversation[];
    selectedConversation: number | null;
    error: string | null;
}

interface ChatActions {
    setNickname: (nickname: string) => void;
    clearNickname: () => void;
    setUser: (user: User) => void;
    setOnlineUsers: (users: User[]) => void;
    setLoadingConversation: (loadingConversation: boolean) => void;
    setConversations: (conversations: Conversation[]) => void;
    setSelectedConversation: (selectedConversation: number) => void;
    setError: (errorMessage: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
    nickname: null,
    user: null,
    onlineUsers: [],
    loadingConversation: false,
    conversations: [],
    selectedConversation: null,
    error: null,

    setNickname: (nickname) => set({ nickname, error: null }),
    clearNickname: () => set({ nickname: null, error: null }),
    setUser: (user) => set({ user }),
    setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    setLoadingConversation: (loadingConversation) => set({ loadingConversation }),
    setConversations: (conversations) => set({ conversations }),
    setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
    setError: (errorMessage) => set({ error: errorMessage }),
}));
