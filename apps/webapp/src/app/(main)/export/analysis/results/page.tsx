'use client'

import { ArrowLeft, Download, FileText, TestTube } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ANALYSIS_TYPE_OPTIONS } from '@/constants/analysis-types'
import { useAnalysisPDFGenerator } from '../../_hooks/use-analysis-pdf-generator'

export default function ExportResultsPage() {
  const searchParams = useSearchParams()
  const selectedTypesParam = searchParams.get('types')
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Hook para generar PDF
  const {
    generatePDF,
    isGenerating,
    error: pdfError,
    realData,
    isLoading: apiLoading
  } = useAnalysisPDFGenerator({
    selectedTypes,
    startDate,
    endDate
  })

  // Usar solo datos reales de la API
  const displayData = realData || []
  const isDataLoading = apiLoading

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
    window.location.href = '/export'
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('es-ES', {
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

  // Calcular estadí  sticas por tipo de análisis
  const chlorinePhCount = displayData.filter(
    (analysis) => analysis.analysisType === 'chlorine_ph'
  ).length
  const turbidityCount = displayData.filter(
    (analysis) => analysis.analysisType === 'turbidity'
  ).length
  const hardnessCount = displayData.filter(
    (analysis) => analysis.analysisType === 'hardness'
  ).length
  const completeCount = displayData.filter(
    (analysis) => analysis.analysisType === 'complete'
  ).length

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/export/analysis/dates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Resultados de Exportación</h1>
            <p className="text-muted-foreground">Vista previa de los análisis a exportar</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Análisis</p>
                  <p className="text-2xl font-bold">{displayData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Cloro y pH</p>
                  <p className="text-2xl font-bold text-green-600">{chlorinePhCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Turbidez</p>
                  <p className="text-2xl font-bold text-blue-500">{turbidityCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Dureza</p>
                  <p className="text-2xl font-bold text-purple-600">{hardnessCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Completos</p>
                  <p className="text-2xl font-bold text-orange-600">{completeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Datos Exportados</CardTitle>
                <CardDescription>
                  {displayData.length} análisis encontrados para el período seleccionado
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating || displayData.length === 0}
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Cargando datos...</p>
              </div>
            ) : displayData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No se encontraron análisis para los criterios seleccionados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayData.slice(0, 10).map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">Análisis </h3>
                          <Badge variant="secondary" className="text-xs">
                            {getAnalysisTypeLabel(analysis.analysisType)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          <span>
                            <strong>Analista:</strong> {analysis.analyst}
                          </span>
                          <span>
                            <strong>Fecha:</strong> {formatDate(analysis.analyzedAt)}
                          </span>
                          <span>
                            <strong>Comunidad:</strong> {analysis.communityName}
                          </span>
                          {analysis.zoneName && (
                            <span>
                              <strong>Zona:</strong> {analysis.zoneName}
                            </span>
                          )}
                          {analysis.depositName && (
                            <span>
                              <strong>Depósito:</strong> {analysis.depositName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          {analysis.ph && (
                            <span>
                              <strong>pH:</strong> {analysis.ph}
                            </span>
                          )}
                          {analysis.chlorine && (
                            <span>
                              <strong>Cloro:</strong> {analysis.chlorine}
                            </span>
                          )}
                          {analysis.turbidity && (
                            <span>
                              <strong>Turbidez:</strong> {analysis.turbidity}
                            </span>
                          )}
                        </div>
                        {analysis.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {analysis.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {displayData.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Mostrando 10 de {displayData.length} análisis. El PDF completo incluirá todos
                      los análisis.
                    </p>
                  </div>
                )}
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
            <Link href="/export/analysis/dates">
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
