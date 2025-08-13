import { GalleryVerticalEnd } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-md'>
              <GalleryVerticalEnd className='size-6' />
            </div>
            <h1 className='text-xl font-bold'>Bienvenido al chat de SDH Inc.</h1>
          </div>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-3'>
              <Label htmlFor='nickname'>Nickname</Label>
              <Input id='nickname' type='nickname' required />
            </div>
            <Button type='submit' className='w-full'>
              Ingresar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
