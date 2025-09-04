import { UseCaseService } from 'core'
import { webAppContainer } from '../../../../core/di/webapp.container'
import { GetAnalysisQry } from '../../../../features/analysis/application/get-analysis.qry'
import { EditAnalysisPage } from '../../../../features/analysis/delivery/edit-analysis.page'

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = params
  console.log({ id })
  const analysis = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetAnalysisQry, { id })

  console.log(analysis)

  if (!analysis) {
    return <div>Analysis not found</div>
  }

  return <EditAnalysisPage analysis={analysis.toDto()} />
}
export default Page
