'use client'

import { LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { getMainNavItems } from '@/navigation/main-nav-items'
import { useUserStore } from '../../../../stores/user/user-provider'

export function AccountMenuItems() {
  const user = useUserStore((state) => state.user)

  if (!user) return null

  const items = getMainNavItems(user.roles)

  // Mirrors BottomNav's own gating: a bar only renders once there are 2+ primary
  // destinations. When it does, drop those from this menu to avoid duplicating them;
  // when it doesn't (reader-only, or no role), show everything the config returns so
  // that destination stays reachable here.
  const hasBottomNav = items.filter((item) => item.primary).length >= 2
  const navItems = hasBottomNav ? items.filter((item) => !item.primary) : items

  return (
    <>
      <DropdownMenuItem className="cursor-default focus:bg-transparent hover:bg-transparent">
        <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={'/favicon/32x32.png'} />
            <AvatarFallback className="rounded-lg">{getInitials(user.email || '')}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs capitalize">{user.roles[0]}</span>
          </div>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {navItems.length > 0 && (
        <>
          <DropdownMenuGroup>
            {navItems.map((item) => (
              <DropdownMenuItem key={item.url} asChild>
                <Link href={item.url} className="flex items-center gap-2 cursor-pointer">
                  <item.icon />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItem
        onClick={() => {
          signOut()
        }}
        className="cursor-pointer"
      >
        <LogOut />
        Cerrar sesión
      </DropdownMenuItem>
    </>
  )
}

export function AccountMenu() {
  const user = useUserStore((state) => state.user)

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú de cuenta"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 space-y-1 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <AccountMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
