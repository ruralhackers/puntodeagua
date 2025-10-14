'use client'

import { Download, Gauge, LogOut, Menu, ShieldUser, Users } from 'lucide-react'
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
import { useUserStore } from '../../../../stores/user/user-provider'

export function AccountMenu() {
  const user = useUserStore((state) => state.user)

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 space-y-1 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem className="cursor-default focus:bg-transparent hover:bg-transparent">
          <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage src={'/favicon/32x32.png'} />
              <AvatarFallback className="rounded-lg">
                {getInitials(user.email || '')}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs capitalize">{user.roles[0]}</span>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.roles.includes('ADMIN') && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/admin`} className="flex items-center gap-2 cursor-pointer">
                  <ShieldUser />
                  Admin
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href={`/users`} className="flex items-center gap-2 cursor-pointer">
              <Users />
              Usuarios
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/water-point`} className="flex items-center gap-2 cursor-pointer">
              <Gauge />
              Puntos de Agua
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/water-meter`} className="flex items-center gap-2 cursor-pointer">
              <Gauge />
              Lecturas
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/export`} className="flex items-center gap-2 cursor-pointer">
              <Download />
              Exportar
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut()
          }}
          className="cursor-pointer"
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
