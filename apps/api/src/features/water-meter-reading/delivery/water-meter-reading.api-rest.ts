import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { GetWaterMeterReadingsQry } from '../application/get-water-meter-readings.qry'

export const waterMeterReadingApiRest = new Elysia().get('/water-meter-readings', async () => {
  const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
  const waterMeterReadings = await useCaseService.execute(GetWaterMeterReadingsQry)
  return waterMeterReadings
})
