import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'
import { webAppContainer } from '../../../../core/di/webapp.container'
import { GetIssuesQry } from '../../../../features/issue/application/get-issues.qry'
import { GetOpenIssuesQry } from '@/src/features/issue/application/get-open-issues.qry'
import { IssuesPage } from '../../../../features/issue/delivery/issues.page'

const Page: NextPage = async () => {
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const [issues, zones] = await Promise.all([
    useCaseService.execute(GetOpenIssuesQry),
    useCaseService.execute(GetWaterZonesQry)
  ])

  return <IssuesPage issues={issues} zones={zones} />
}
export default Page
