'use client'

import { ArrowLeft, Calendar, Filter } from 'lucide-react'
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

  const handleBack = () => {
    router.push('/export')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Exportar Incidencias</h1>
            <p className="text-muted-foreground">
              Configura los filtros para exportar las incidencias
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Exportación
            </CardTitle>
            <CardDescription>
              Por defecto se selecciona el último año. Puedes modificar estas fechas y el estado
              según tus necesidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Label className="text-base font-medium">Rango de Fechas</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado de las Incidencias</Label>
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

            {/* Export Button */}
            <div className="pt-4">
              <Button onClick={handleExport} className="w-full" size="lg">
                <Filter className="h-4 w-4 mr-2" />
                Generar Exportación
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
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
