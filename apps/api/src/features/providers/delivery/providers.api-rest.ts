import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetProvidersQry } from '../application/get-providers.qry'

export const providersApiRest = new Elysia().get('/providers', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const providers = await useCaseService.execute(GetProvidersQry)
  return providers.map((x) => x.toDto())
})
