import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {CurrentUser} from "./current-user"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Usuarios",
      items: [
        {
          title: "Usuario 1",
        },
        {
          title: "Usuario 2",
        },
        {
          title: "Usuario 3",
        },
      ],
    },
    {
      title: "Chats",
      items: [
        {
          title: "Chat 1",
        },
        {
          title: "Chat 2",
        },
        {
          title: "Chat 3",
        },
        {
          title: "Chat 4",
        },
        {
          title: "Chat 5",
        },
        {
          title: "Chat 6",
        },
      ],
    },
  ],
}

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
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            Usuarios
             <SidebarMenuItem>
                <SidebarMenuButton>
                    Usuario 1
                </SidebarMenuButton>
                <SidebarMenuButton>
                    Usuario 2
                </SidebarMenuButton>
                <SidebarMenuButton>
                    Usuario 3
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
           <Separator className="my-6" orientation="horizontal" />
          <SidebarMenu>
            Chats
             <SidebarMenuItem>
                <SidebarMenuButton>
                    Chat 1
                </SidebarMenuButton>
                <SidebarMenuButton>
                    Chat 2
                </SidebarMenuButton>
                <SidebarMenuButton>
                    Chat 3
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
