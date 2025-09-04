import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetMaintenancesQry } from '../application/get-maintenances.qry'

export const maintenanceApiRest = new Elysia({ prefix: '/maintenances' }).get('/', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const maintenances = await useCaseService.execute(GetMaintenancesQry)
  return maintenances.map((m) => m.toDto())
})
