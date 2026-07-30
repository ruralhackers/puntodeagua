'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AccountMenuItems } from '@/app/(main)/app/_components/account-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getMainNavItems, isNavItemActive } from '@/navigation/main-nav-items'
import { useUserStore } from '@/stores/user/user-provider'

export function BottomNav() {
  const user = useUserStore((state) => state.user)
  const pathname = usePathname()

  if (!user) return null

  const primaryItems = getMainNavItems(user.roles).filter((item) => item.primary)

  // A single destination does not warrant a nav bar (reader-only users).
  if (primaryItems.length < 2) return null

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      // Resolves to 0px today (no viewport-fit=cover is set anywhere in the app), so this is a
      // no-op for now. Kept because it's harmless and correct if viewport-fit=cover is ever
      // enabled (manifest.json already declares display: standalone).
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch justify-around">
        {primaryItems.map((item) => {
          const active = isNavItemActive(item.url, pathname)
          return (
            <li key={item.url} className="flex-1">
              <Link
                href={item.url}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors',
                  active ? 'text-blue-700' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            </li>
          )
        })}
        <li className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span>Más</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="top" align="end">
              <AccountMenuItems />
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  )
}
