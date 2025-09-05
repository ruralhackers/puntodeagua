import type { Issue, WaterZone } from 'features'
import type { FC } from 'react'
import { Link } from '@/components/ui/link'
import { Page } from '@/src/core/components/page'
import { IssueItemCard } from '@/src/features/issue/delivery/issue-item-card'

export const IssuesPage: FC<{ issues: Issue[]; zones?: WaterZone[] }> = ({ issues, zones }) => {
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.toDto().id, z.toDto().name]))

  return (
    <Page>
      <div className="px-3 py-4">
        <div className="mb-6">
          <div className="mb-4">
            <Link
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
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-gray-600">Historial de incidencias reportadas y su resolución</p>
        </div>
        <div className="flex flex-col gap-3">
          {issues.map((i) => {
            const dto = i.toDto()
            return (
              <IssueItemCard
                key={dto.id}
                dto={dto}
                waterZoneName={zoneById.get(dto.waterZoneId) ?? ''}
              />
            )
          })}
        </div>
      </div>
    </Page>
  )
}
