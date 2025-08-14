import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSocket } from '@/hooks/useSocket';

import { CircleCheck, Ban } from 'lucide-react';

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
  const [status, setStatus] = useState<'Conectado' | 'Desconectado'>(
    'Desconectado'
  );
  const nickname = useChatStore((state) => state.nickname);
  const user = useChatStore((state) => state.user);
  const setUser = useChatStore((state) => state.setUser);
  const setError = useChatStore((state) => state.setError);

  useEffect(() => {
    if (!socket || !isConnected) return;

    if (!nickname) {
      setError('Nickname no encontrado. Redirigiendo a la página de login...');
      navigate('/');
      return;
    }

    socket.on('connect', () => {
      socket.emit(
        'check_or_create_user',
        { nickname },
        (response: Response) => {
          if (response.success) {
            setUser(response.user);
            setStatus('Conectado');
          } else {
            setError(response.error || 'Error al registrar usuario');
            setStatus('Desconectado');
          }
        }
      );
    });
  }, [socket, isConnected, navigate, nickname, setError, setUser]);

  return (
    <div className='flex items-baseline gap-3'>
      <div className='size-8 flex items-end justify-center'>
        {status === 'Conectado' ? (
          <CircleCheck className='size-5 text-green-600' />
        ) : (
          <Ban className='text-red-600 size-5' />
        )}
      </div>
      <h4 className='text-lg m-0'>{user?.nickname}:</h4>{' '}
      <span className='text-xs'>{status}</span>
    </div>
  );
}
