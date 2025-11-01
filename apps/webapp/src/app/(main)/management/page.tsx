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

        <Link href="/management/owner-change" className="group">
          <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300 dark:from-green-950 dark:to-green-900 dark:border-green-800">
            <CardContent className="flex items-center justify-center h-full p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    Cambio de Titular
                  </CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-400 text-xs mt-1">
                    Cambiar propietario
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/management/water-point-data" className="group">
          <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
            <CardContent className="flex items-center justify-center h-full p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <Home className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-purple-800 dark:text-purple-200 text-sm font-semibold">
                    Cambiar Datos de Casa
                  </CardTitle>
                  <CardDescription className="text-purple-600 dark:text-purple-400 text-xs mt-1">
                    Editar información
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}
