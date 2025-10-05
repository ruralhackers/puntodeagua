import { AlertTriangle, Droplets, FlaskConical, Wrench } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/config/app-config'

export const metadata = {
  title: `${APP_CONFIG.name} | Panel`
}

export default async function Home() {
  return (
    <main className="flex-1 px-3 py-4">
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/water-meter/new" className="group">
            <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:border-cyan-300 dark:from-cyan-950 dark:to-cyan-900 dark:border-cyan-800">
              <CardContent className="flex items-center justify-center h-full p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Droplets className="h-8 w-8 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <CardTitle className="text-cyan-800 dark:text-cyan-200 text-sm font-semibold">
                      Registrar Lectura
                    </CardTitle>
                    <CardDescription className="text-cyan-600 dark:text-cyan-400 text-xs mt-1">
                      de contadores
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analysis/new" className="group">
            <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
              <CardContent className="flex items-center justify-center h-full p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <FlaskConical className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <CardTitle className="text-blue-800 dark:text-blue-200 text-sm font-semibold">
                      Registrar Analítica
                    </CardTitle>
                    <CardDescription className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                      Análisis de agua
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* <Link href="/registers/maintenance" className="group"> */}
          <Card className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 opacity-60 relative">
            <CardContent className="flex items-center justify-center h-full p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <Wrench className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                <div>
                  <CardTitle className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    Registrar Mantenimiento
                  </CardTitle>
                  <CardDescription className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Próximamente
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* </Link> */}

          <Link href="/incident/new" className="group">
            <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:border-orange-300 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
              <CardContent className="flex items-center justify-center h-full p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <CardTitle className="text-orange-800 dark:text-orange-200 text-sm font-semibold">
                      Registrar Incidencia
                    </CardTitle>
                    <CardDescription className="text-orange-600 dark:text-orange-400 text-xs mt-1">
                      Problemas y alertas
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}
