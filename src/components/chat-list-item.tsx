import { useEffect, useState } from 'react';
import { SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import type { Conversation } from '@/types/conversation';

import { useChatStore } from '@/stores/useChatStore';
import type { User } from '@/types/user';

interface ChatListItemProps {
  conversation: Conversation;
}

export function ChatListItem({ conversation }: ChatListItemProps) {
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const user = useChatStore((state) => state.user);
  const selectedConversation = useChatStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation
  );

  useEffect(() => {
    const { participants } = conversation;
    const otherUser = participants.filter(
      (participant) => participant.id !== user?.id
    );
    console.log(otherUser[0].nickname);
    setOtherUser(otherUser[0]);
  }, [user, conversation]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setSelectedConversation(conversation.id)}
        className={
          selectedConversation === conversation.id
            ? 'bg-gray-900 text-gray-100'
            : ''
        }
      >
        {otherUser?.nickname}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
