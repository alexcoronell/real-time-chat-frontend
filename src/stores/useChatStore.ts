import { create } from 'zustand';

/* Interfaces */
import type { Conversation } from '@/types/conversation';
import type { User } from '@/types/user';

interface ChatState {
    nickname: string | null;
    user: User | null;
    onlineUsers: User[];
    conversations: Conversation[];
    loading: boolean;
    error: string | null;
}

interface ChatActions {
    setNickname: (nickname: string) => void;
    clearNickname: () => void;
    setUser: (user: User) => void;
    setOnlineUsers: (users: User[]) => void;
    setConversations: (conversations: Conversation[]) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (errorMessage: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
    nickname: null,
    user: null,
    onlineUsers: [],
    conversations: [],
    loading: false,
    error: null,

    setNickname: (nickname) => set({ nickname, error: null }),
    clearNickname: () => set({ nickname: null, error: null }),
    setUser: (user) => set({ user, loading: false }),
    setOnlineUsers: (onlineUsers) => set({ onlineUsers, loading: false }),
    setConversations: (conversations) => set({ conversations, loading: false }),
    setLoading: (isLoading) => set({ loading: isLoading }),
    setError: (errorMessage) => set({ error: errorMessage }),
}));
