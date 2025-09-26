import { cookies } from 'next/headers'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { auth } from '@/server/auth'
import { getPreference } from '@/server/server-actions'
import { UserStoreProvider } from '@/stores/user/user-provider'
import { HydrateClient } from '@/trpc/server'
import { CONTENT_LAYOUT_VALUES, type ContentLayout } from '@/types/preferences/layout'
import { APP_CONFIG } from '../../config/app-config'
import { CommunityZonesStoreProvider } from '../../stores/community/community-zones-provider'
import { AccountMenu } from './app/_components/account-menu'
import { ThemeSwitcher } from './app/_components/theme-switcher'

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  const session = await auth()

  if (!session?.user) {
    return redirect('/login')
  }

  const [contentLayout] = await Promise.all([
    getPreference<ContentLayout>('content_layout', CONTENT_LAYOUT_VALUES, 'full-width')
  ])

  return (
    <HydrateClient>
      <UserStoreProvider user={session.user}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SidebarInset
            data-content-layout={contentLayout}
            className={cn(
              'data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl',
              // Adds right margin for inset sidebar in centered layout up to 113rem.
              // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
              'max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto',
              // Ensure proper flexbox layout for scroll and add background
              'flex flex-col h-screen bg-gradient-to-br from-blue-50/40 to-slate-50/60'
            )}
          >
            <header className="flex h-14 shrink-0 items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 shadow-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
              <div className="flex w-full items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-3">
                  <a href="/" className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src="/favicon/32x32.png"
                        alt="Logo"
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-lg shadow-lg ring-2 ring-white/20"
                      />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">
                      {APP_CONFIG.name}
                    </span>
                  </a>
                  {session?.user.community?.name && (
                    <>
                      <div className="h-6 w-px bg-white/20 mx-1" />
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
                        <span className="text-sm font-semibold text-white/95">
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
            <CommunityZonesStoreProvider communityId={session.user.community?.id || ''}>
              <div className="min-h-0 flex-1 p-4 md:p-6 overflow-y-auto">{children}</div>
            </CommunityZonesStoreProvider>
          </SidebarInset>
        </SidebarProvider>
      </UserStoreProvider>
    </HydrateClient>
  )
}
