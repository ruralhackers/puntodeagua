'use client'

import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ANALYSIS_TYPE_OPTIONS } from '@/constants/analysis-types'

export default function DateRangeSelectorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTypesParam = searchParams.get('types')

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Calcular fechas por defecto (último año)
  useEffect(() => {
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)

    setEndDate(today.toISOString().split('T')[0] || '')
    setStartDate(oneYearAgo.toISOString().split('T')[0] || '')
  }, [])

  // Parsear tipos seleccionados desde URL
  useEffect(() => {
    if (selectedTypesParam) {
      const types = selectedTypesParam.split(',')
      setSelectedTypes(types)
    }
  }, [selectedTypesParam])

  const handleContinue = () => {
    if (!startDate || !endDate) return

    // Validar que endDate >= startDate
    if (new Date(endDate) < new Date(startDate)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    // Construir query string con todos los parámetros
    const queryString = new URLSearchParams({
      types: selectedTypes.join(','),
      startDate,
      endDate
    }).toString()

    // Navegar al siguiente paso
    router.push(`/export/analysis/results?${queryString}`)
  }

  const selectedTypesOptions = selectedTypes
    .map((type) => ANALYSIS_TYPE_OPTIONS.find((opt) => opt.value.toString() === type))
    .filter(Boolean)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/export" className="hover:text-foreground">
            Exportar Datos
          </Link>
          <span>/</span>
          <Link href="/export/analysis" className="hover:text-foreground">
            Análisis
          </Link>
          <span>/</span>
          <span className="text-foreground">Fechas</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Rango de Fechas</h1>
          <p className="text-muted-foreground">
            Selecciona el período de tiempo para la exportación
          </p>
        </div>

        {/* Selected Types Summary */}
        {selectedTypesOptions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Análisis Seleccionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedTypesOptions.map((option) => (
                  <Badge
                    key={option?.value?.toString() || 'unknown'}
                    variant="secondary"
                    className="text-sm"
                  >
                    {option?.icon} {option?.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Range Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Tiempo
            </CardTitle>
            <CardDescription>
              Por defecto se selecciona el último año. Puedes modificar estas fechas según tus
              necesidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Date Range Info */}
            {startDate && endDate && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Período seleccionado:</strong> Desde el{' '}
                  {new Date(startDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}{' '}
                  hasta el{' '}
                  {new Date(endDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/export/analysis">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>

          <Button onClick={handleContinue} disabled={!startDate || !endDate}>
            Generar Exportación
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Validation Message */}
        {(!startDate || !endDate) && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">Selecciona ambas fechas para continuar</p>
          </div>
        )}
      </div>
    </div>
  )
}
