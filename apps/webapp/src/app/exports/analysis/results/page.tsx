'use client'

import { ArrowLeft, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ANALYSIS_TYPE_OPTIONS } from '@/constants/analysis-types'
import { usePDFGenerator } from '../../_hooks/use-pdf-generator'

// Mock data para desarrollo - será reemplazado por datos reales de la API
const mockAnalysisData = [
  {
    id: '1',
    analysisType: 'chlorine_ph',
    analyst: 'Juan Pérez',
    analyzedAt: '2024-01-15T10:30:00Z',
    communityName: 'Comunidad Anceu',
    zoneName: 'Zona Norte',
    depositName: 'Depósito Principal',
    ph: 7.2,
    chlorine: 0.5,
    turbidity: undefined,
    description: 'Análisis rutinario de calidad'
  },
  {
    id: '2',
    analysisType: 'turbidity',
    analyst: 'María García',
    analyzedAt: '2024-01-20T14:15:00Z',
    communityName: 'Comunidad Anceu',
    zoneName: 'Zona Sur',
    depositName: undefined,
    ph: undefined,
    chlorine: undefined,
    turbidity: 2.1,
    description: 'Verificación de turbidez post-lluvia'
  },
  {
    id: '3',
    analysisType: 'complete',
    analyst: 'Carlos López',
    analyzedAt: '2024-02-01T09:45:00Z',
    communityName: 'Comunidad Anceu',
    zoneName: 'Zona Centro',
    depositName: 'Depósito Secundario',
    ph: 6.8,
    chlorine: 0.3,
    turbidity: 1.5,
    description: 'Análisis completo mensual'
  }
]

export default function ExportResultsPage() {
  const searchParams = useSearchParams()
  const selectedTypesParam = searchParams.get('types')
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [analysisData] = useState(mockAnalysisData)

  // Hook para generar PDF
  const {
    generatePDF,
    isGenerating,
    error: pdfError
  } = usePDFGenerator({
    data: analysisData,
    selectedTypes,
    startDate,
    endDate
  })

  // Parsear parámetros desde URL
  useEffect(() => {
    if (selectedTypesParam) {
      const types = selectedTypesParam.split(',')
      setSelectedTypes(types)
    }
    if (startDateParam) setStartDate(startDateParam)
    if (endDateParam) setEndDate(endDateParam)
  }, [selectedTypesParam, startDateParam, endDateParam])

  const handleGeneratePDF = () => {
    generatePDF()
  }

  const handleNewExport = () => {
    window.location.href = '/exports'
  }

  const selectedTypesOptions = selectedTypes
    .map((type) => ANALYSIS_TYPE_OPTIONS.find((opt) => opt.value.toString() === type))
    .filter(Boolean)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAnalysisTypeLabel = (type: string) => {
    const option = ANALYSIS_TYPE_OPTIONS.find((opt) => opt.value.toString() === type)
    return option ? `${option.icon} ${option.label}` : type
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/exports" className="hover:text-foreground">
            Exportar Datos
          </Link>
          <span>/</span>
          <Link href="/exports/analysis" className="hover:text-foreground">
            Análisis
          </Link>
          <span>/</span>
          <Link href="/exports/analysis/dates" className="hover:text-foreground">
            Fechas
          </Link>
          <span>/</span>
          <span className="text-foreground">Resultados</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Resultados de Exportación</h1>
          <p className="text-muted-foreground">
            Análisis encontrados según los criterios seleccionados
          </p>
        </div>

        {/* Export Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumen de la Exportación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Tipos de Análisis</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTypesOptions.map((option) => (
                    <Badge
                      key={option?.value?.toString() || 'unknown'}
                      variant="secondary"
                      className="text-xs"
                    >
                      {option?.icon} {option?.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Período</h4>
                <p className="text-sm text-muted-foreground">
                  {startDate && endDate && (
                    <>
                      {new Date(startDate).toLocaleDateString('es-ES')} -{' '}
                      {new Date(endDate).toLocaleDateString('es-ES')}
                    </>
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Total de Registros</h4>
                <p className="text-2xl font-bold text-primary">{analysisData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Datos Exportados</CardTitle>
                <CardDescription>Datos exportados listos para descargar en PDF</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating || analysisData.length === 0}
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analysisData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No se encontraron análisis para los criterios seleccionados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse export-results-table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">ID</th>
                      <th className="text-left p-2 font-semibold">Tipo</th>
                      <th className="text-left p-2 font-semibold">Analista</th>
                      <th className="text-left p-2 font-semibold">Fecha</th>
                      <th className="text-left p-2 font-semibold">Comunidad</th>
                      <th className="text-left p-2 font-semibold">Zona</th>
                      <th className="text-left p-2 font-semibold">Depósito</th>
                      <th className="text-left p-2 font-semibold">pH</th>
                      <th className="text-left p-2 font-semibold">Cloro</th>
                      <th className="text-left p-2 font-semibold">Turbidez</th>
                      <th className="text-left p-2 font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.map((analysis) => (
                      <tr key={analysis.id} className="border-b">
                        <td className="p-2 text-sm">{analysis.id}</td>
                        <td className="p-2 text-sm">
                          {getAnalysisTypeLabel(analysis.analysisType)}
                        </td>
                        <td className="p-2 text-sm">{analysis.analyst}</td>
                        <td className="p-2 text-sm">{formatDate(analysis.analyzedAt)}</td>
                        <td className="p-2 text-sm">{analysis.communityName}</td>
                        <td className="p-2 text-sm">{analysis.zoneName || '-'}</td>
                        <td className="p-2 text-sm">{analysis.depositName || '-'}</td>
                        <td className="p-2 text-sm">{analysis.ph || '-'}</td>
                        <td className="p-2 text-sm">{analysis.chlorine || '-'}</td>
                        <td className="p-2 text-sm">{analysis.turbidity || '-'}</td>
                        <td className="p-2 text-sm">{analysis.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {pdfError && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-sm">{pdfError}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/exports/analysis/dates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>

          <Button onClick={handleNewExport}>
            <Download className="mr-2 h-4 w-4" />
            Nueva Exportación
          </Button>
        </div>
      </div>
    </div>
  )
}
