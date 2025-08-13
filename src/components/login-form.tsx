import { useLocation } from 'wouter';
import { GalleryVerticalEnd } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useChatStore } from '@/stores/useChatStore';

import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  nickname: z.string().min(4, {
    message: 'El nickname es obligatorio, debe tener al menos 4 letras',
  }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const setNickname = useChatStore((state) => state.setNickname);
  const [, navigate] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setNickname(values.nickname);
    navigate('/chat');
  }


  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-md'>
                <GalleryVerticalEnd className='size-6' />
              </div>
              <h1 className='text-xl font-bold'>
                Bienvenido al chat de SDH Inc.
              </h1>
            </div>
            <FormField
              control={form.control}
              name='nickname'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage className='text-xs absolute bottom-[-1rem] top-auto' />
                </FormItem>
              )}
            ></FormField>
            <Button type='submit' className='w-full mt-1'>
              Ingresar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
