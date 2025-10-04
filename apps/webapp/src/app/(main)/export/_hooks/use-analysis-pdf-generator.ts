import { useState } from 'react'
import { api } from '@/trpc/react'
import { generateAnalysisPDF } from '../_utils/generate-pdf'

/**
 * Hook específico para generar PDFs de análisis de calidad del agua
 * Maneja la obtención de datos de la API y la generación del PDF
 */

interface UseAnalysisPDFGeneratorProps {
  selectedTypes: string[]
  startDate: string
  endDate: string
}

export function useAnalysisPDFGenerator({
  selectedTypes,
  startDate,
  endDate
}: UseAnalysisPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Query para obtener datos reales de la API
  const {
    data: realData,
    isLoading,
    error: apiError
  } = api.registers.exportAnalyses.useQuery(
    {
      analysisTypes: selectedTypes,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    },
    {
      enabled: selectedTypes.length > 0 && !!startDate && !!endDate
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
      const blob = await generateAnalysisPDF({
        data: dataToUse,
        selectedTypes,
        startDate,
        endDate,
        generatedAt
      })

      // Crear nombre de archivo con fecha
      const fileName = `analisis-export-${new Date().toISOString().split('T')[0]}.pdf`

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
