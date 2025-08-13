import { create } from 'zustand';
//import type { User } from '@/types/user.d.ts';

type ServerStatus = 'connected' | 'disconnected' | 'ckecking'

interface ChatState {
    nickname: string | null;
    serverStatus: ServerStatus;
    loading: boolean;
    error: string | null;
}

interface ChatActions {
    setNickname: (nickname: string) => void;
    clearNickname: () => void;
    setServerStatus: (status: ServerStatus) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (errorMessage: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
    nickname: null,
    serverStatus: 'disconnected',
    loading: false,
    error: null,

    setNickname: (nickname) => set({ nickname, error: null }),
    clearNickname: () => set({ nickname: null, error: null }),
    setServerStatus: (status) => set({ serverStatus: status }),
    setLoading: (isLoading) => set({ loading: isLoading }),
    setError: (errorMessage) => set({ error: errorMessage }),
}));