import { Home, RefreshCw, Users } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/config/app-config'

export const metadata = {
  title: `${APP_CONFIG.name} | Gestión`
}

export default function ManagementPage() {
  return (
    <main className="flex-1 px-3 py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gestión</h1>
        <p className="text-muted-foreground">Administra cambios en la comunidad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/management/meter-replacement" className="group">
          <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
            <CardContent className="flex items-center justify-center h-full p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-blue-800 dark:text-blue-200 text-sm font-semibold">
                    Cambio de Contador
                  </CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    Reemplazar contador antiguo
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 opacity-60 relative">
          <CardContent className="flex items-center justify-center h-full p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              <div>
                <CardTitle className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                  Cambio de Titular
                </CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Próximamente
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 opacity-60 relative">
          <CardContent className="flex items-center justify-center h-full p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Home className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              <div>
                <CardTitle className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                  Cambio de Datos
                </CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Próximamente
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
