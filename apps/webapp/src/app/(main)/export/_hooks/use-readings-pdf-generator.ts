import { useState } from 'react'
import { api } from '@/trpc/react'
import { generateReadingsPDF } from '../_utils/generate-readings-pdf'

interface UseReadingsPDFGeneratorProps {
  startDate: string
  endDate: string
  communityId?: string
  waterMeterId?: string
}

export function useReadingsPDFGenerator({
  startDate,
  endDate,
  communityId,
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
        waterMeterId: waterMeterId || undefined
      })

      const fileName = waterMeterId
        ? `lecturas-contador-${new Date().toISOString().split('T')[0]}.pdf`
        : `lecturas-export-${new Date().toISOString().split('T')[0]}.pdf`

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
