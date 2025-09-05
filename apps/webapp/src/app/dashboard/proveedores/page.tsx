import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { webAppContainer } from '../../../core/di/webapp.container'
import { GetProvidersQry } from '../../../features/providers/application/get-providers.qry'

const Page: NextPage = async () => {
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const providers = await useCaseService.execute(GetProvidersQry)

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Proveedores</h1>
      <ul className="list-disc pl-5 space-y-1">
        {providers.map((p) => (
          <li key={p.id} className="text-sm">
            {p.id}
          </li>
        ))}
      </ul>
    </div>
  )
}
export default Page
