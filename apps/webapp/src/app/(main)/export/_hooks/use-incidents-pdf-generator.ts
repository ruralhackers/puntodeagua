import { useState } from 'react'
import { api } from '@/trpc/react'
import { generateIncidentsPDF } from '../_utils/generate-incidents-pdf'

interface UseIncidentsPDFGeneratorProps {
  startDate: string
  endDate: string
  status: 'all' | 'open' | 'closed'
}

export function useIncidentsPDFGenerator({
  startDate,
  endDate,
  status
}: UseIncidentsPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Query para obtener datos reales de la API
  const {
    data: realData,
    isLoading,
    error: apiError
  } = api.incidents.exportIncidents.useQuery(
    {
      startDate,
      endDate,
      status
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

      // Usar solo datos reales de la API
      const dataToUse = realData || []

      // Crear el PDF con los datos
      const blob = await generateIncidentsPDF({
        data: dataToUse,
        startDate,
        endDate,
        status,
        generatedAt
      })

      // Crear nombre de archivo con fecha
      const fileName = `incidencias-export-${new Date().toISOString().split('T')[0]}.pdf`

      // Descargar el archivo
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
