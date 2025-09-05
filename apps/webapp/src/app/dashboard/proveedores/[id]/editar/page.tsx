import { UseCaseService } from 'core'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetProviderQry } from '@/src/features/providers/application/get-provider.qry'
import { EditProviderPage } from '../../../../../features/providers/delivery/edit-provider.page'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  const provider = await useCaseService.execute(GetProviderQry, id)

  if (!provider) {
    return <div>Provider not found</div>
  }

  return <EditProviderPage provider={provider.toDto()} />
}

export default Page
