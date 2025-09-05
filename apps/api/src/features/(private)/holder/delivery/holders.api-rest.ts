import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { holderSchema } from 'features/schemas/holder.schema'
import { apiContainer } from '../../../../api.container'
import { CreateHolderCmd } from '../application/create-holder.cmd'
import { DeleteHolderCmd } from '../application/delete-holder.cmd'
import { EditHolderCmd } from '../application/edit-holder.cmd'
import { GetHolderQry } from '../application/get-holder.qry'
import { GetHoldersQry } from '../application/get-holders.qry'

export const holdersApiRest = new Elysia()
  .get('/holders', async ({ set }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const holders = await useCaseService.execute(GetHoldersQry)
    return holders.map((x) => x.toDto())
  })
  .get('/holders/:id', async ({ params, set }) => {
    console.log('entra ids', { params })
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const holder = await useCaseService.execute(GetHolderQry, { id: params.id })
    return holder ? holder.toDto() : { error: 'Holder not found' }
  })
  .post('/holders', async ({ body, set }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const dto = holderSchema.omit({ id: true }).parse(body)
    await useCaseService.execute(CreateHolderCmd, dto)
    return
  })
  .post('/holders/:id', async ({ body, params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const dto = holderSchema.parse(body)
    await useCaseService.execute(EditHolderCmd, dto)
    return
  })
  .delete('/holders/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    await useCaseService.execute(DeleteHolderCmd, Id.create(params.id))
    return
  })
