import { useCallback, useState } from 'react'
import { useAuthHttpClient } from '../../auth/hooks/use-auth-http-client'

export interface UpdateWaterMeterData {
  name: string
  measurementUnit: string
  waterZoneId?: string
  images?: string[]
}

export function useUpdateWaterMeter() {
  const authHttpClient = useAuthHttpClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateWaterMeter = useCallback(
    async (id: string, data: UpdateWaterMeterData) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authHttpClient.put(`water-meter/${id}`, data)
        return response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el contador'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [authHttpClient]
  )

  return {
    updateWaterMeter,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
