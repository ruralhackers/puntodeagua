import { cookies } from 'next/headers'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
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
              'max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto'
            )}
          >
            <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex w-full items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-2">
                  <a href="/" className="flex items-center gap-2">
                    <Image
                      src="/favicon/32x32.png"
                      alt="Logo"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                    <span className="text-base font-semibold">{APP_CONFIG.name}</span>
                  </a>
                  {session?.user.community?.name && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          {session.user.community.name}
                        </span>
                      </div>
                    </>
                  )}
                  <Separator orientation="vertical" className="h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <ThemeSwitcher />
                  <AccountMenu />
                </div>
              </div>
            </header>
            <CommunityZonesStoreProvider communityId={session.user.community?.id || ''}>
              <div className="h-full p-4 md:p-6">{children}</div>
            </CommunityZonesStoreProvider>
          </SidebarInset>
        </SidebarProvider>
      </UserStoreProvider>
    </HydrateClient>
  )
}
