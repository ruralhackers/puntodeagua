import { TabBar } from '@/components/navigation/tab-bar'
import { TabBarProvider } from '@/components/navigation/tab-bar-context'
import ProtectedRoute from '@/src/features/auth/components/protected-route'
import { Header } from '../../components/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TabBarProvider>
        <div className="flex flex-col min-h-screen">
          {/* Desktop Navbar - only visible on desktop */}
          <div className="md:block">
            <Header />
          </div>

          <div className="flex-1 pb-16 md:pb-0">{children}</div>

          {/* Mobile TabBar - only visible on mobile */}
          <div className="block md:hidden">
            <TabBar />
          </div>
        </div>
      </TabBarProvider>
    </ProtectedRoute>
  )
}
