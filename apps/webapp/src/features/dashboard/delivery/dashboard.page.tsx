'use client'

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
        <Button asChild className="w-full">
          <Link
            to="/dashboard/nuevo-registro"
            className="no-underline hover:no-underline font-bold"
          >
            Nuevo registro
          </Link>
        </Button>
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
