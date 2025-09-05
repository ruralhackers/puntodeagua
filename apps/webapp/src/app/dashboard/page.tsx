import { UseCaseService } from 'core'
import { Issue } from 'features/issues/entities/issue'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetOpenIssuesQry } from '@/src/features/issue/application/get-open-issues.qry'
import { AttentionItem } from './AttentionItem'

type AttentionItemType = {
  id: string
  titulo: string
  ubicacion: string
  fecha: string
}

export default async function Home() {
  const service = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const openIssues = await service.execute(GetOpenIssuesQry)

  const incidenciasAbiertas = openIssues.map((issue: Issue) => ({
    id: issue.id.toString(),
    titulo: issue.title,
    ubicacion: issue.reporterName || 'Sin especificar',
    fecha: issue.startAt.format('DD/MM/YYYY')
  }))

  const elementosAtencion = incidenciasAbiertas

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
            <span className="text-sm text-gray-500">{elementosAtencion.length} elementos</span>
          </div>
          <div className="space-y-2">
            {elementosAtencion.slice(0, 2).map((e: AttentionItemType) => (
              <AttentionItem key={`${e.id}`} item={e} />
            ))}
            {elementosAtencion.length > 2 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                {elementosAtencion.length - 2} elementos más requieren atención
              </div>
            )}
          </div>
          <a
            href="/dashboard/registros/incidencias"
            className="block w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium text-center"
          >
            Ver todos los elementos
          </a>
        </div>
      </div>
    </main>
  )
}
