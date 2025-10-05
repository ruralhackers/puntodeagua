'use client'

import { ArrowLeft, ArrowRight, Calendar, Filter } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export default function IncidentsExportPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all')

  // Calcular fechas por defecto (último año)
  useEffect(() => {
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)

    setEndDate(today.toISOString().split('T')[0] || '')
    setStartDate(oneYearAgo.toISOString().split('T')[0] || '')
  }, [])

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecciona un rango de fechas')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin')
      return
    }

    // Navigate to results page with parameters
    const params = new URLSearchParams({
      startDate,
      endDate,
      status
    })

    router.push(`/export/incidents/results?${params.toString()}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/export" className="hover:text-foreground">
            Exportar Datos
          </Link>
          <span>/</span>
          <span className="text-foreground">Incidencias</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Filtros de Incidencias</h1>
          <p className="text-muted-foreground">
            Configura los filtros para exportar las incidencias
          </p>
        </div>

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

        {/* Status Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Estado de las Incidencias
            </CardTitle>
            <CardDescription>
              Selecciona qué tipo de incidencias deseas incluir en la exportación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value: 'all' | 'open' | 'closed') => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las incidencias</SelectItem>
                  <SelectItem value="open">Solo incidencias abiertas</SelectItem>
                  <SelectItem value="closed">Solo incidencias cerradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/export">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>

          <Button onClick={handleExport} disabled={!startDate || !endDate}>
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

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Información de la Exportación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • La exportación incluirá todas las incidencias dentro del rango de fechas
                seleccionado
              </p>
              <p>• Se generará un archivo PDF con los detalles de cada incidencia</p>
              <p>
                • El archivo incluirá información como título, reportero, fechas, estado y
                descripción
              </p>
              <p>• Las incidencias se ordenarán por fecha de inicio (más recientes primero)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
