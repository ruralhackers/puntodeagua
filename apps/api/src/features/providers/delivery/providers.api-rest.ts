import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { providerSchema } from 'features/providers/schemas/provider.schema'
import { apiContainer } from '../../../api.container'
import { CreateProviderCmd } from '../application/create-provider.cmd'
import { GetProviderQry } from '../application/get-provider.qry'
import { GetProvidersQry } from '../application/get-providers.qry'
import { SaveProviderCmd } from '../application/save-provider.cmd'

export const providersApiRest = new Elysia()
  .get('/providers', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const providers = await useCaseService.execute(GetProvidersQry)
    return providers.map((x) => x.toDto())
  })
  .get('/providers/:id', async ({ params, set }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const provider = await useCaseService.execute(GetProviderQry, Id.create(params.id))
    if (!provider) {
      set.status = 404
      return { message: 'Provider not found' }
    }
    return provider.toDto()
  })
  .post('/providers', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const createSchema = providerSchema.omit({ id: true })
    const dto = createSchema.parse(body)
    await useCaseService.execute(CreateProviderCmd, dto)
    return
  })
  .post('/providers/:id', async ({ body }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const schema = providerSchema
    const dto = schema.parse(body)
    await useCaseService.execute(SaveProviderCmd, dto)
    return
  })
