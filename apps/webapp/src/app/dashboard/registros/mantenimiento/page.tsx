import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetMaintenancesQry } from '@/src/features/maintenance/application/get-maintenances.qry'
import { MaintenancesPage } from '@/src/features/maintenance/delivery/maintenances.page'

const Page: NextPage = async () => {
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const maintenances = await useCaseService.execute(GetMaintenancesQry)
  return <MaintenancesPage maintenances={maintenances} />
}

export default Page
