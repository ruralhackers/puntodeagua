import { TabBar } from '@/components/navigation/tab-bar'
import { TabBarProvider } from '@/components/navigation/tab-bar-context'
import ProtectedRoute from '@/src/features/auth/components/protected-route'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TabBarProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 pb-16 md:pb-0">{children}</div>
          <TabBar />
        </div>
      </TabBarProvider>
    </ProtectedRoute>
  )
}
