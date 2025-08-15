/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/stores/useChatStore';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

// Variable global para mantener UNA sola instancia del socket
let globalSocket: Socket | null = null;

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const nickname = useChatStore((state) => state.nickname);

    useEffect(() => {
        // Si no hay nickname, no conectar
        if (!nickname || !SERVER_URL) {
            // Asegurar estado desconectado
            setIsConnected(false);
            return;
        }

        // Si ya existe una conexión global activa, reutilizarla
        if (globalSocket && globalSocket.connected) {
            socketRef.current = globalSocket;
            setIsConnected(true);
            console.log('🔄 Reutilizando conexión existente para:', nickname);
            return;
        }

        // Crear nueva conexión
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

        // Manejadores de eventos
        const handleConnect = () => {
            console.log('✅ Socket conectado con ID:', socket.id);
            setIsConnected(true);
        };

        const handleDisconnect = (reason: string) => {
            console.log('❌ Socket desconectado:', reason);
            setIsConnected(false);
        };

        const handleError = (error: any) => {
            console.error('❌ Error de conexión:', error);
            setIsConnected(false);
        };

        // Registrar listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleError);

        // Limpieza específica para este hook
        return () => {
            console.log('🧹 Limpiando listeners específicos');
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleError);

            // No desconectar el socket global aquí
            // (para permitir reutilización entre componentes)
        };
    }, [nickname]);

    return {
        socket: socketRef.current,
        isConnected,
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