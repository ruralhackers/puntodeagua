import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { getHoldersFiltersSchema } from 'features'
import { apiContainer } from '../../../../api.container'
import { GetHolderQry } from '../application/get-holder.qry'
import { GetHoldersQry } from '../application/get-holders.qry'

export const holderApiRest = new Elysia({ prefix: '/holders' })
  .get('/', async ({ query }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const filters = getHoldersFiltersSchema.parse(query)

    const holders = await useCaseService.execute(GetHoldersQry, filters)
    return holders.map((x) => x.toDto())
  })
  .get('/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    const holder = await useCaseService.execute(GetHolderQry, {
      id: params.id
    })

    if (!holder) {
      return { error: 'Holder not found' }
    }

    return holder.toDto()
  })
