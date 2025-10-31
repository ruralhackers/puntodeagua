import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { auth } from '@/server/auth'
import { getPreference } from '@/server/server-actions'
import { UserStoreProvider } from '@/stores/user/user-provider'
import { HydrateClient } from '@/trpc/server'
import { CONTENT_LAYOUT_VALUES, type ContentLayout } from '@/types/preferences/layout'
import { CommunityZonesStoreProvider } from '../../stores/community/community-zones-provider'

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
            <Header session={session} />
            <CommunityZonesStoreProvider communityId={session.user.community?.id || ''}>
              <div className="min-h-0 flex-1 p-4 md:p-6 overflow-y-auto">{children}</div>
              <Footer />
            </CommunityZonesStoreProvider>
          </SidebarInset>
        </SidebarProvider>
      </UserStoreProvider>
    </HydrateClient>
  )
}
