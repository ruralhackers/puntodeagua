import type { Issue, WaterZone } from 'features'
import type { FC } from 'react'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { Page } from '@/src/core/components/page'
import { IssueItemCard } from '@/src/features/issue/delivery/issue-item-card'

export const IssuesPage: FC<{ issues: Issue[]; zones?: WaterZone[] }> = ({ issues, zones }) => {
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.toDto().id, z.toDto().name]))

  return (
    <Page>
      <div className="px-3 py-4">
        <PageHeader
          title="Incidencias"
          subtitle="Historial de incidencias reportadas y su resolución"
        />
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
