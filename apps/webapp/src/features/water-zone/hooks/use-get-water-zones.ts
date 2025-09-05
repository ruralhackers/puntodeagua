import { useCallback, useEffect, useState } from 'react'
import { useAuthHttpClient } from '../../auth/hooks/use-auth-http-client'
import { WaterZoneAuthApiRestRepository } from '../infrastructure/water-zone.auth-api-rest-repository'

export function useGetWaterZones() {
  const authHttpClient = useAuthHttpClient()
  const [waterZones, setWaterZones] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getWaterZones = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const repository = new WaterZoneAuthApiRestRepository(authHttpClient)
      const zones = await repository.findAll()
      setWaterZones(zones)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener las zonas de agua'
      setError(errorMessage)
      console.error('Error fetching water zones:', err)
    } finally {
      setIsLoading(false)
    }
  }, [authHttpClient])

  useEffect(() => {
    getWaterZones()
  }, [getWaterZones])

  return {
    waterZones,
    isLoading,
    error,
    refetch: getWaterZones
  }
}
