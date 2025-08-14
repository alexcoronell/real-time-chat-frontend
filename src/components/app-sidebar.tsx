import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {CurrentUser} from "./current-user"
import { CurrentUsers } from "./current-users"
import { ChatList } from "./chat-list"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
                <div className="flex aspect-square size-8 items-center justify-start rounded-lg">
                  <CurrentUser />
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator className="my-3" />
      <SidebarContent>
        <CurrentUsers/>
        <Separator className="my-3" />
        <ChatList />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
