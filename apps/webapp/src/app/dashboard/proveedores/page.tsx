import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { webAppContainer } from '../../../core/di/webapp.container'
import { GetProvidersQry } from '../../../features/providers/application/get-providers.qry'
import { ProvidersPage } from '../../../features/providers/delivery/providers.page'

const Page: NextPage = async () => {
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const providers = await useCaseService.execute(GetProvidersQry)

  return <ProvidersPage providers={providers} />
}
export default Page
