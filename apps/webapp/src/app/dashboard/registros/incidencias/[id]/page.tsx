// import type { Issue } from 'features' // TODO: Uncomment when needed
import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetIssueByIdQry } from '@/src/features/issue/application/get-issue-by-id.qry'
import { IssueDetailPage } from '@/src/features/issue/delivery/issue-detail.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

interface PageProps {
  params: Promise<{ id: string }>
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params

  const getIssueByIdQry = getUseCase(GetIssueByIdQry)
  const getWaterZonesQry = getUseCase(GetWaterZonesQry)

  const [issue, waterZones] = await Promise.all([
    getIssueByIdQry.execute(id as any), // TODO: Fix type when Id type is properly defined
    getWaterZonesQry.execute()
  ])

  if (!issue) {
    return <div>Incidencia no encontrada</div>
  }

  return <IssueDetailPage issue={issue.toDto()} zones={waterZones.map((x) => x.toDto())} />
}

export default Page
