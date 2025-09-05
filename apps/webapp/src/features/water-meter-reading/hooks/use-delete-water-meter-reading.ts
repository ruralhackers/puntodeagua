import { useCallback } from 'react'
import { useAuthHttpClient } from '../../auth/hooks/use-auth-http-client'
import { DeleteWaterMeterReadingCmd } from '../application/delete-water-meter-reading.cmd'
import { WaterMeterReadingAuthApiRestRepository } from '../infrastructure/water-meter-reading.auth-api-rest-repository'

export function useDeleteWaterMeterReading() {
  const authHttpClient = useAuthHttpClient()

  const deleteWaterMeterReading = useCallback(
    async (id: string) => {
      const repository = new WaterMeterReadingAuthApiRestRepository(authHttpClient)
      const command = new DeleteWaterMeterReadingCmd(repository)
      return await command.handle({ id })
    },
    [authHttpClient]
  )

  return { deleteWaterMeterReading }
}
