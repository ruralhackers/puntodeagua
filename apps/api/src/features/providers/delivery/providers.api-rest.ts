import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { providerSchema } from 'features/providers/schemas/provider.schema'
import { apiContainer } from '../../../api.container'
import { CreateProviderCmd } from '../application/create-provider.cmd'
import { GetProvidersQry } from '../application/get-providers.qry'

export const providersApiRest = new Elysia()
  .get('/providers', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const providers = await useCaseService.execute(GetProvidersQry)
    return providers.map((x) => x.toDto())
  })
  .post('/providers', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const createSchema = providerSchema.omit({ id: true })
    const dto = createSchema.parse(body)
    await useCaseService.execute(CreateProviderCmd, dto)
    return
  })
