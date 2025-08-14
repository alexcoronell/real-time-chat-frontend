import { AppSidebar } from '@/components/app-sidebar';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

import ChatArea from '@/components/chat-area';

import { useTheme } from '@/components/theme-provider';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function ChatPage() {
  const { theme, setTheme } = useTheme();

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

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
