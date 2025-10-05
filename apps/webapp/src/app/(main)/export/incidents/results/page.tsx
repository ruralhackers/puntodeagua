'use client'

import { AlertTriangle, ArrowLeft, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useIncidentsPDFGenerator } from '../../_hooks/use-incidents-pdf-generator'

export default function IncidentsExportResultsPage() {
  const searchParams = useSearchParams()
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')
  const statusParam = searchParams.get('status')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all')

  // Hook para generar PDF
  const {
    generatePDF,
    isGenerating,
    error: pdfError,
    realData,
    isLoading: apiLoading
  } = useIncidentsPDFGenerator({
    startDate,
    endDate,
    status
  })

  // Usar solo datos reales de la API
  const displayData = realData || []
  const isDataLoading = apiLoading

  // Debug: log current state

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

    if (statusParam && ['all', 'open', 'closed'].includes(statusParam)) {
      setStatus(statusParam as 'all' | 'open' | 'closed')
    }
  }, [startDateParam, endDateParam, statusParam])

  const handleGeneratePDF = () => {
    generatePDF()
  }

  const handleNewExport = () => {
    window.location.href = '/export/incidents'
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

  const getStatusText = (status: string) => {
    return status === 'open' ? 'Abierta' : 'Cerrada'
  }

  const getStatusVariant = (status: string) => {
    return status === 'open' ? 'destructive' : 'default'
  }

  const getStatusFilterText = () => {
    switch (status) {
      case 'open':
        return 'Solo incidencias abiertas'
      case 'closed':
        return 'Solo incidencias cerradas'
      default:
        return 'Todas las incidencias'
    }
  }

  const openCount = displayData.filter((incident) => incident.status === 'open').length
  const closedCount = displayData.filter((incident) => incident.status === 'closed').length

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/export/incidents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Resultados de Exportación</h1>
            <p className="text-muted-foreground">Vista previa de las incidencias a exportar</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Incidencias</p>
                  <p className="text-2xl font-bold">{displayData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Abiertas</p>
                  <p className="text-2xl font-bold text-red-600">{openCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Cerradas</p>
                  <p className="text-2xl font-bold text-green-600">{closedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Período</p>
                  <p className="text-sm text-gray-600">
                    {startDate && endDate
                      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                      : 'Cargando...'}
                  </p>
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
              Configuración: {getStatusFilterText()}
              {startDate && endDate
                ? ` del ${formatDate(startDate)} al ${formatDate(endDate)}`
                : ' - Cargando fechas...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating || isDataLoading || displayData.length === 0}
                className="flex-1"
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
              <Button variant="outline" onClick={handleNewExport}>
                Nueva Exportación
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
                ? 'Cargando incidencias...'
                : `${displayData.length} incidencias encontradas`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2">Cargando datos...</span>
              </div>
            ) : displayData.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No se encontraron incidencias con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayData.slice(0, 10).map((incident) => (
                  <div
                    key={incident.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{incident.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Reportero: {incident.reporterName}</span>
                          <span>Inicio: {formatDate(incident.startAt)}</span>
                          {incident.endAt && <span>Fin: {formatDate(incident.endAt)}</span>}
                        </div>
                        {incident.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {incident.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={getStatusVariant(incident.status)}>
                        {getStatusText(incident.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {displayData.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Mostrando 10 de {displayData.length} incidencias. El PDF completo incluirá
                      todas las incidencias.
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
