'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { APP_CONFIG } from '@/config/app-config'
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
    </Sidebar>
  )
}
