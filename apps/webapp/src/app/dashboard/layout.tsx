import { TabBar } from '@/components/navigation/tab-bar'
import { TabBarProvider } from '@/components/navigation/tab-bar-context'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabBarProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 pb-16 md:pb-0">{children}</div>
        <TabBar />
      </div>
    </TabBarProvider>
  )
}
