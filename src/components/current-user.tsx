import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSocket } from '@/hooks/useSocket';

import { CircleCheck, Ban, Loader2 } from 'lucide-react';
import { useChatStore } from '@/stores/useChatStore';

import type { User } from '@/types/user';

interface Response {
  success: boolean;
  user: User;
  error: string;
}

export function CurrentUser() {
  const { socket, isConnected } = useSocket();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<
    'Conectado' | 'Desconectado' | 'Cargando' | 'Error'
  >('Desconectado');
  const nickname = useChatStore((state) => state.nickname);
  const user = useChatStore((state) => state.user);
  const setUser = useChatStore((state) => state.setUser);
  const setError = useChatStore((state) => state.setError);

  useEffect(() => {
    if (!nickname) {
      setError('Nickname no encontrado. Redirigiendo a la página de login...');
      navigate('/');
      return;
    }

    if (!isConnected) {
      setStatus('Desconectado');
      return;
    }

    // ✅ Solo emitir cuando ESTÁ CONECTADO
    if (socket && isConnected) {
      setStatus('Cargando');

      socket.emit(
        'check_or_create_user',
        { nickname },
        (response: Response) => {
          if (response.success) {
            setUser(response.user);
            setStatus('Conectado');
          } else {
            setError(response.error || 'Error al registrar usuario');
            setStatus('Error');
          }
        }
      );

      socket.on('heartbeat_request', () => {
        socket.emit('heartbeat_response');
      });
    }
  }, [socket, isConnected, nickname, navigate, setError, setUser]);

  return (
    <div className='flex items-baseline gap-3'>
      <div className='size-8 flex items-end justify-center'>
        {status === 'Conectado' ? (
          <CircleCheck className='size-5 text-green-600' />
        ) : status === 'Cargando' ? (
          <Loader2 className='size-5 animate-spin text-blue-500' />
        ) : status === 'Error' ? (
          <Ban className='text-yellow-500 size-5' />
        ) : (
          <Ban className='text-red-600 size-5' />
        )}
      </div>
      <h4 className='text-lg m-0'>{user?.nickname || 'Usuario'}:</h4>
      <span className='text-xs'>
        {status === 'Cargando' ? (
          <span className='flex items-center'>
            <Loader2 className='mr-1 h-3 w-3 animate-spin' />
            Cargando...
          </span>
        ) : (
          status
        )}
      </span>
    </div>
  );
}
