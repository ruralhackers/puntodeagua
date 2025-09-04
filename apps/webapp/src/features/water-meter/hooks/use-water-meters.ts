import { UseCaseService } from 'core'
import { WaterMeter } from 'features/entities/water-meter'
import { useEffect, useState } from 'react'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetWaterMetersQry } from '../application/get-water-meters.qry'

export function useWaterMeters() {
  const [meters, setMeters] = useState<WaterMeter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeters = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
        const waterMeters = await useCaseService.execute(GetWaterMetersQry)

        setMeters(waterMeters)
      } catch (err) {
        setError('Error fetching water meters')
        console.error('Error fetching water meters:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeters()
  }, [])

  return { meters, isLoading, error }
}
