import type { Issue, WaterZone } from 'features'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Link as UILink } from '@/components/ui/link'
import { Page } from '@/src/core/components/page'
import { IssueItemCard } from '@/src/features/issue/delivery/issue-item-card'

export const IssuesPage: FC<{ issues: Issue[]; zones?: WaterZone[] }> = ({ issues, zones }) => {
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.toDto().id, z.toDto().name]))

  // sort by startAt descending
  issues.sort(
    (a, b) => new Date(b.toDto().startAt).getTime() - new Date(a.toDto().startAt).getTime()
  )

  return (
    <Page>
      <div className="px-3 py-4">
        <div className="mb-6">
          <div className="mb-4">
            <UILink
              to="/dashboard/registros"
              type="invisible"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="p-2 hover:bg-gray-100 rounded-lg">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </span>
              <span className="text-sm">Volver</span>
            </UILink>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
              <p className="text-gray-600">Historial de incidencias reportadas y su resolución</p>
            </div>
            <Button className="flex items-center gap-2" variant="default">
              <Link href="/dashboard/nuevo-registro/incidencia" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {issues?.map((i) => {
            const dto = i.toDto()
            return (
              <IssueItemCard
                key={dto.id}
                dto={dto}
                waterZoneName={zoneById.get(dto.waterZoneId) ?? ''}
                variant="detailed"
              />
            )
          })}
        </div>
      </div>
    </Page>
  )
}
