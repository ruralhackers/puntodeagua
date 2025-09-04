import { TabBar } from '@/components/navigation/tab-bar'
import { TabBarProvider } from '@/components/navigation/tab-bar-context'
import { DesktopNavbar } from '@/src/components/navigation/desktop-navbar'
import ProtectedRoute from '@/src/features/auth/components/protected-route'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TabBarProvider>
        <div className="flex flex-col min-h-screen">
          {/* Desktop Navbar - only visible on desktop */}
          <div className="hidden md:block">
            <DesktopNavbar />
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
