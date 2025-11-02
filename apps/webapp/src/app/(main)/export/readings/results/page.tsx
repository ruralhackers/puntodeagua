'use client'

import { AlertTriangle, ArrowLeft, Download, FileText, Gauge } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useReadingsPDFGenerator } from '../../_hooks/use-readings-pdf-generator'

export default function ReadingsExportResultsPage() {
  const searchParams = useSearchParams()
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Hook para generar PDF
  const {
    generatePDF,
    isGenerating,
    error: pdfError,
    realData,
    isLoading: apiLoading
  } = useReadingsPDFGenerator({
    startDate,
    endDate
  })

  // Usar solo datos reales de la API
  const displayData = realData || []
  const isDataLoading = apiLoading

  // Filtrar para mostrar solo contadores con datos suficientes en el preview
  const metersToDisplay = displayData.filter((meter) => meter.readings.length >= 2)

  // Parsear parámetros desde URL y establecer fechas por defecto si no hay parámetros
  useEffect(() => {
    if (startDateParam && endDateParam) {
      // Si hay parámetros en la URL, usarlos
      setStartDate(startDateParam)
      setEndDate(endDateParam)
    } else {
      // Si no hay parámetros, establecer fechas por defecto
      const today = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(today.getFullYear() - 1)

      const defaultEndDate = today.toISOString().split('T')[0] || ''
      const defaultStartDate = oneYearAgo.toISOString().split('T')[0] || ''

      setEndDate(defaultEndDate)
      setStartDate(defaultStartDate)
    }
  }, [startDateParam, endDateParam])

  const handleGeneratePDF = () => {
    generatePDF()
  }

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Fecha no válida'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'Fecha no válida'
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calcular estadísticas
  const totalMeters = displayData.length
  const metersWithReadings = displayData.filter((meter) => meter.readings.length >= 2).length
  const metersWithInsufficientData = displayData.filter((meter) => meter.readings.length < 2).length

  // Para calcular excesos necesitamos revisar cada contador
  const metersWithExcess = displayData.filter((meter) => {
    if (meter.readings.length < 2) return false

    const lastReading = meter.readings[meter.readings.length - 1]
    const firstReading = meter.readings[0]

    if (!lastReading || !firstReading) return false

    const consumption = lastReading.normalizedReading - firstReading.normalizedReading
    const days = Math.floor(
      (new Date(lastReading.readingDate).getTime() - new Date(firstReading.readingDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (days <= 0) return false

    const pax = meter.waterPoint.fixedPopulation + meter.waterPoint.floatingPopulation
    let maxAllowed = 0

    if (meter.waterLimitRule.type === 'PERSON_BASED') {
      maxAllowed = days * pax * meter.waterLimitRule.value
    } else if (meter.waterLimitRule.type === 'HOUSEHOLD_BASED') {
      maxAllowed = days * meter.waterLimitRule.value
    }

    return consumption > maxAllowed
  }).length

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/export" className="hover:text-foreground">
            Exportar Datos
          </Link>
          <span>/</span>
          <Link href="/export/readings" className="hover:text-foreground">
            Lecturas
          </Link>
          <span>/</span>
          <span className="text-foreground">Resultados</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Resultados de Exportación</h1>
          <p className="text-muted-foreground">Vista previa de las lecturas a exportar</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Contadores</p>
                  <p className="text-2xl font-bold">{totalMeters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Con Datos</p>
                  <p className="text-2xl font-bold text-green-600">{metersWithReadings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Con Exceso</p>
                  <p className="text-2xl font-bold text-red-600">{metersWithExcess}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Sin Datos</p>
                  <p className="text-2xl font-bold text-gray-600">{metersWithInsufficientData}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generar Exportación</CardTitle>
            <CardDescription>
              Período:{' '}
              {startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                : 'Cargando fechas...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/export/readings">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Link>
              </Button>

              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating || isDataLoading || displayData.length === 0}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
            {pdfError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{pdfError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa de Datos</CardTitle>
            <CardDescription>
              {isDataLoading
                ? 'Cargando lecturas...'
                : `${metersToDisplay.length} contadores con datos suficientes (de ${displayData.length} totales)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2">Cargando datos...</span>
              </div>
            ) : metersToDisplay.length === 0 ? (
              <div className="text-center py-8">
                <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No se encontraron contadores con datos suficientes (2+ lecturas)
                </p>
                {displayData.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Hay {displayData.length} contador{displayData.length > 1 ? 'es' : ''} sin datos
                    suficientes que se incluirá{displayData.length > 1 ? 'n' : ''} en el PDF
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {metersToDisplay.slice(0, 10).map((meter) => {
                  const readingsCount = meter.readings.length

                  return (
                    <div
                      key={meter.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {meter.waterAccountName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Punto: {meter.waterPoint.name}</span>
                            <span>Zona: {meter.communityZone.name}</span>
                            <span>Lecturas: {readingsCount}</span>
                          </div>
                        </div>
                        <Badge variant="default">Con lecturas</Badge>
                      </div>
                    </div>
                  )
                })}
                {metersToDisplay.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Mostrando 10 de {metersToDisplay.length} contadores con datos suficientes.
                      {displayData.length > metersToDisplay.length &&
                        ` El PDF también incluirá ${displayData.length - metersToDisplay.length} contador${displayData.length - metersToDisplay.length > 1 ? 'es' : ''} sin datos suficientes.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
