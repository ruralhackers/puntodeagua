import { Id, UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { maintenanceSchema } from 'features/maintenance/schemas/maintenance.schema'
import { z } from 'zod'
import { apiContainer } from '../../../../api.container'
import { GetMaintenanceQry } from '../application/get-maintenance.qry'
import { GetMaintenancesQry } from '../application/get-maintenances.qry'
import { SaveMaintenanceCmd } from '../application/save-maintenance.cmd'

export const maintenanceApiRest = new Elysia({ prefix: '/maintenances' })
  .get('/', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const maintenances = await useCaseService.execute(GetMaintenancesQry)
    return maintenances.map((m) => m.toDto())
  })
  .get('/:id', async ({ params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const maintenance = await useCaseService.execute(GetMaintenanceQry, Id.create(params.id))
    return maintenance?.toDto() ?? null
  })
  .post('/:id', async ({ body, params }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const schema = maintenanceSchema.extend({
      scheduledDate: z.coerce.date(),
      executionDate: z.coerce.date().optional(),
      nextMaintenanceDate: z.coerce.date().optional()
    })
    const base = body as Record<string, unknown>
    const dto = schema.parse({ ...base, id: params.id })
    await useCaseService.execute(SaveMaintenanceCmd, dto)
    return
  })
