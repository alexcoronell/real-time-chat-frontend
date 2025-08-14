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
import { CurrentUsers } from "./current-users"

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
        <CurrentUsers/>
        <SidebarGroup>
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
