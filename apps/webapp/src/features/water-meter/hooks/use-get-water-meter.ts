import { useCallback } from 'react'
import { useAuthHttpClient } from '../../auth/hooks/use-auth-http-client'
import { GetWaterMeterQry } from '../application/get-water-meter.qry'
import { WaterMeterAuthApiRestRepository } from '../infrastructure/water-meter.auth-api-rest-repository'

export function useGetWaterMeter() {
  const authHttpClient = useAuthHttpClient()

  const getWaterMeter = useCallback(
    async (id: string) => {
      const repository = new WaterMeterAuthApiRestRepository(authHttpClient)
      const query = new GetWaterMeterQry(repository)
      return await query.handle(id)
    },
    [authHttpClient]
  )

  return { getWaterMeter }
}
