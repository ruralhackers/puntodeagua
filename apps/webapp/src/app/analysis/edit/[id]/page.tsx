import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { webAppContainer } from '../../../../core/di/webapp.container'
import { GetAnalysisQry } from '../../../../features/analysis/application/get-analysis.qry'
import { EditAnalysisPage } from '../../../../features/analysis/delivery/edit-analysis.page'

const Page: NextPage = async () => {
  const analysis = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetAnalysisQry)

  if (!analysis) {
    return <div>Analysis not found</div>
  }

  return <EditAnalysisPage analysis={analysis} />
}
export default Page
