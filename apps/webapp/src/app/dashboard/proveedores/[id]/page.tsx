import { UseCaseService } from 'core'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetProviderQry } from '@/src/features/providers/application/get-provider.qry'
import { ProviderDetailPage } from '@/src/features/providers/delivery/provider.page'

const PageComponent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const provider = await useCaseService.execute(GetProviderQry, id)

  if (!provider) {
    return <div className="px-3 py-4">Proveedor no encontrado</div>
  }

  const dto = provider.toDto()

  return <ProviderDetailPage provider={dto} />
}

export default PageComponent
