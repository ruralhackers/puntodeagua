import Image from 'next/image'
import type { Session } from 'next-auth'
import { AccountMenu } from '@/app/(main)/app/_components/account-menu'
import { ThemeSwitcher } from '@/app/(main)/app/_components/theme-switcher'
import { APP_CONFIG } from '@/config/app-config'

interface HeaderProps {
  session: Session
}

export function Header({ session }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 shadow-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex w-full items-center justify-between px-3 lg:px-6">
        <div className="flex items-center gap-2 lg:gap-3">
          <a href="/" className="flex items-center gap-2 lg:gap-3">
            <div className="relative">
              <Image
                src="/favicon/32x32.png"
                alt="Logo"
                width={24}
                height={24}
                className="h-6 w-6 lg:h-7 lg:w-7 rounded-md lg:rounded-lg shadow-lg ring-1 lg:ring-2 ring-white/20"
              />
            </div>
            <span className="text-sm lg:text-lg font-bold text-white tracking-tight">
              {APP_CONFIG.name}
            </span>
          </a>
          {session?.user.community?.name && (
            <>
              <div className="h-4 lg:h-6 w-px bg-white/20 mx-0.5 lg:mx-1" />
              <div className="flex items-center gap-1.5 lg:gap-2 bg-white/10 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <div className="h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
                <span className="text-xs lg:text-sm font-semibold text-white/95 truncate max-w-20 lg:max-w-none">
                  {session.user.community.name}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <ThemeSwitcher />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
