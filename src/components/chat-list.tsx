import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { useChatStore } from '@/stores/useChatStore';

export function ChatList() {
  return (
    <SidebarGroup>
      <h3>Chats</h3>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>Chat 1</SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>Chat 2</SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>Chat 3</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
