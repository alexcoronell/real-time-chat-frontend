import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocation } from 'wouter';

import { useChatStore } from '@/stores/useChatStore';

import { AppSidebar } from '@/components/app-sidebar';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

import ChatArea from '@/components/chat-area';

import { useTheme } from '@/components/theme-provider';

import type { User } from '@/types/user';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

export default function ChatPage() {
  const nickname = useChatStore((state) => state.nickname);
  const user = useChatStore((state) => state.user);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const setLoading = useChatStore((state) => state.setLoading);
  const setUser = useChatStore((state) => state.setUser);
  const setError = useChatStore((state) => state.setError);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);

  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();
  const socketRef = useRef<Socket | null>(null);

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  useEffect(() => {
    if (!nickname) {
      setError('Nickname no encontrado. Redirigiendo a la página de login...');
      navigate('/');
      return;
    }

    if (user) return;

    setLoading(true);
    setError(null);

    // ✅ Crear socket dentro del useEffect
    const socket = io(SERVER_URL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
    });

    socketRef.current = socket;

    // ✅ Manejar conexión exitosa
    socket.on('connect', () => {
      console.log('🔗 Conectado al servidor:', socket.id);

      // ✅ Registrar usuario cuando se conecte
      socket.emit(
        'check_or_create_user',
        { nickname },
        (response: { success: boolean; user: User; error?: string }) => {
          setLoading(false);

          if (response.success) {
            console.log('✅ Usuario registrado:', response.user);
            setUser(response.user);
          } else {
            console.error('❌ Error al registrar usuario:', response.error);
            setError(response.error || 'Error al registrar usuario');
          }
        }
      );
    });

    // ✅ EVENTO PRINCIPAL - Lista de usuarios online
    socket.on('users_online', (data: { count: number; users: User[] }) => {
      console.log(`👥 ${data.count} usuarios conectados:`, data.users);
      setOnlineUsers(data.users);
    });

    // ✅ Notificación cuando un usuario se conecta
    socket.on(
      'user_connected',
      (data: { nickname: string; socketId: string; totalOnline: number }) => {
        console.log(
          `✅ ${data.nickname} se conectó. Total: ${data.totalOnline}`
        );
        // Opcional: mostrar toast/notificación
      }
    );

    // ✅ Notificación cuando un usuario se desconecta
    socket.on(
      'user_disconnected',
      (data: { nickname: string; socketId: string; totalOnline: number }) => {
        console.log(
          `❌ ${data.nickname} se desconectó. Total: ${data.totalOnline}`
        );
        // Opcional: mostrar toast/notificación
      }
    );

    // ✅ Manejar errores de conexión
    socket.on('connect_error', (err) => {
      console.error('Error de conexión:', err.message);
      setError('Error al conectar con el servidor.');
      setLoading(false);
    });

    // ✅ Manejar desconexión
    socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado del servidor:', reason);
      setOnlineUsers([]); // Limpiar lista de usuarios
    });

    // ✅ Cleanup function
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [nickname, user, setLoading, setUser, setError, setOnlineUsers, navigate]);

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='p-3 h-screen flex flex-col gap-3'>
          <header className='bg-muted/50 rounded-xl p-2 flex items-center justify-between grow-0 border'>
            <SidebarTrigger />
            <div className='flex items-center gap-2'>
              <Sun className='size-5' />
              <Switch
                id='theme-toggle'
                checked={theme === 'dark'}
                onCheckedChange={handleToggle}
              />
              <Moon className='size-5' />
            </div>
          </header>
          <ChatArea />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
