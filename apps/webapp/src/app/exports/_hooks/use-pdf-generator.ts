import { useState } from 'react'
import { generateAnalysisPDF } from '../_utils/generate-pdf'

interface AnalysisData {
  id: string
  analysisType: string
  analyst: string
  analyzedAt: string
  communityName: string
  zoneName?: string
  depositName?: string
  ph?: number
  chlorine?: number
  turbidity?: number
  description?: string
}

interface UsePDFGeneratorProps {
  data: AnalysisData[]
  selectedTypes: string[]
  startDate: string
  endDate: string
}

export function usePDFGenerator({ data, selectedTypes, startDate, endDate }: UsePDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      // Crear el PDF con los datos proporcionados
      const blob = await generateAnalysisPDF({
        data,
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
    error
  }
}
