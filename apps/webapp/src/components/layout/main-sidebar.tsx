'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { APP_CONFIG } from '@/config/app-config'
import { getInitials } from '@/lib/utils'
import { getActiveNavUrl, getMainNavItems } from '@/navigation/main-nav-items'
import { useUserStore } from '@/stores/user/user-provider'

export function MainSidebar() {
  const user = useUserStore((state) => state.user)
  const pathname = usePathname()

  if (!user) return null

  const items = getMainNavItems(user.roles)

  // Reader-only users have a single destination; a sidebar would be noise.
  if (items.length < 2) return null

  const activeUrl = getActiveNavUrl(items, pathname)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3 text-sm font-bold tracking-tight group-data-[collapsible=icon]:hidden">
        {APP_CONFIG.name}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.url === activeUrl}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* The sidebar is the only nav on desktop, so it has to carry the session:
          the header no longer duplicates these destinations or the sign-out. */}
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src="/favicon/32x32.png" alt="" />
            <AvatarFallback className="rounded-lg">{getInitials(user.email || '')}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs capitalize text-muted-foreground">
              {user.roles[0]}
            </span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Cerrar sesión">
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
