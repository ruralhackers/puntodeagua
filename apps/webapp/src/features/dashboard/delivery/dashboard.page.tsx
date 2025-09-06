'use client'

import { AlertTriangle, Droplets, FlaskConical, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { AttentionItem } from '../../../app/dashboard/AttentionItem'

type AttentionItemType = {
  id: string
  titulo: string
  ubicacion: string
  fecha: string
}

type DashboardPageProps = {
  incidenciasAbiertas: AttentionItemType[]
}

export function DashboardPage({ incidenciasAbiertas }: DashboardPageProps) {
  return (
    <main className="flex-1 px-3 py-4">
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Button
            asChild
            className="h-24 flex flex-col items-center justify-center p-6 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Link
              to="/dashboard/nuevo-registro/contador"
              className="no-underline hover:no-underline font-bold text-center flex flex-col items-center gap-2"
            >
              <Droplets className="h-6 w-6" />
              <span>
                Registrar Lectura <br /> de contadores
              </span>
            </Link>
          </Button>
          <Button
            asChild
            className="h-24 flex flex-col items-center justify-center p-6 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Link
              to="/dashboard/nuevo-registro/analitica"
              className="no-underline hover:no-underline font-bold text-center flex flex-col items-center gap-2"
            >
              <FlaskConical className="h-6 w-6" />
              <span>Registrar Analítica</span>
            </Link>
          </Button>
          <Button
            asChild
            className="h-24 flex flex-col items-center justify-center p-6 bg-green-500 hover:bg-green-600 text-white"
          >
            <Link
              to="/dashboard/nuevo-registro/mantenimiento"
              className="no-underline hover:no-underline font-bold text-center flex flex-col items-center gap-2"
            >
              <Wrench className="h-6 w-6" />
              <span>Registrar Mantenimiento</span>
            </Link>
          </Button>

          <Button
            asChild
            className="h-24 flex flex-col items-center justify-center p-6 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Link
              to="/dashboard/nuevo-registro/incidencia"
              className="no-underline hover:no-underline font-bold text-center flex flex-col items-center gap-2"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Registrar Incidencia</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Requiere Atención</h2>
            <span className="text-sm text-gray-500">{incidenciasAbiertas.length} elementos</span>
          </div>
          <div className="space-y-2">
            {incidenciasAbiertas.map((e: AttentionItemType) => (
              <AttentionItem key={`${e.id}`} item={e} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
