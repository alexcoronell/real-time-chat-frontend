// hooks/useSocket.ts - Versión simplificada que solo exporta el socket

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/stores/useChatStore';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

// Variable global para mantener UNA sola instancia del socket
let globalSocket: Socket | null = null;

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const nickname = useChatStore((state) => state.nickname);

    useEffect(() => {
        // Si no hay nickname, no conectar
        if (!nickname || !SERVER_URL) {
            return;
        }

        // Si ya existe una conexión global activa, reutilizarla
        if (globalSocket && globalSocket.connected) {
            socketRef.current = globalSocket;
            return;
        }

        // Crear nueva conexión solo si no existe
        console.log('🔌 Creando nueva conexión socket para:', nickname);

        const socket = io(SERVER_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000,
            forceNew: false,
        });

        // Asignar a variables globales y locales
        globalSocket = socket;
        socketRef.current = socket;

        // Eventos básicos de conexión
        socket.on('connect', () => {
            console.log('✅ Socket conectado con ID:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket desconectado:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión:', error);
        });

        return () => {
            // NO desconectar aquí para mantener la conexión activa entre componentes
            console.log('🔄 useSocket cleanup - manteniendo conexión');
        };
    }, [nickname]);

    return {
        socket: socketRef.current,
        isConnected: socketRef.current?.connected || false,
    };
}

// Hook separado para cleanup completo (usar solo en el componente principal)
export function useSocketCleanup() {
    useEffect(() => {
        return () => {
            console.log('🧹 Cleanup completo del socket');
            if (globalSocket) {
                globalSocket.removeAllListeners();
                globalSocket.disconnect();
                globalSocket = null;
            }
        };
    }, []);
}

// Función utilitaria para obtener el socket global desde cualquier lugar
export function getGlobalSocket(): Socket | null {
    return globalSocket;
}