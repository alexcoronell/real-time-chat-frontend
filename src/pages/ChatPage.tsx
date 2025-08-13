import { AppSidebar } from '@/components/app-sidebar';
import { Switch } from "@/components/ui/switch"

import ChatArea from '@/components/chat-area';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

function ChatPage() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='p-3 h-screen flex flex-col gap-3'>
          <header className='bg-muted/50 rounded-xl p-2 flex items-center justify-between grow-0 border'>
            <SidebarTrigger />
            <Switch />
          </header>
          <ChatArea />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default ChatPage;
