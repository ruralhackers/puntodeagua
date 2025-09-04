import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { webAppContainer } from '../../core/di/webapp.container'
import { GetAnalysesQry } from '../../features/analysis/application/get-analyses.qry'
import { AnalysisPage } from '../../features/analysis/delivery/analyses.page'

const Page: NextPage = async () => {
  const analysis = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetAnalysesQry)

  return <AnalysisPage analysis={analysis} />
}
export default Page
