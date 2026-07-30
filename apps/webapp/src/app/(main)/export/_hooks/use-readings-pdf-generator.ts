import { useState } from 'react'
import { api } from '@/trpc/react'
import { generateReadingsPDF } from '../_utils/generate-readings-pdf'

interface UseReadingsPDFGeneratorProps {
  startDate: string
  endDate: string
  communityId?: string
  communityZoneId?: string
  waterMeterId?: string
}

export function useReadingsPDFGenerator({
  startDate,
  endDate,
  communityId,
  communityZoneId,
  waterMeterId
}: UseReadingsPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    data: realData,
    isLoading,
    error: apiError
  } = api.waterAccount.exportWaterMeterReadings.useQuery(
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      communityId,
      communityZoneId: communityZoneId || undefined,
      waterMeterId: waterMeterId || undefined
    },
    {
      enabled: !!startDate && !!endDate
    }
  )

  const generatePDF = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      const generatedAt = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const dataToUse = realData || []

      const blob = await generateReadingsPDF({
        data: dataToUse,
        startDate,
        endDate,
        generatedAt,
        waterMeterId: waterMeterId || undefined,
        zoneName: communityZoneId ? dataToUse[0]?.communityZone.name : undefined
      })

      const today = new Date().toISOString().split('T')[0]
      const fileName = waterMeterId
        ? `lecturas-contador-${today}.pdf`
        : communityZoneId
          ? `lecturas-zona-${today}.pdf`
          : `lecturas-export-${today}.pdf`

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generando PDF:', err)
      setError('Error al generar el PDF. Por favor, inténtalo de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generatePDF,
    isGenerating,
    error: error || apiError?.message,
    realData,
    isLoading: isLoading || isGenerating
  }
}
