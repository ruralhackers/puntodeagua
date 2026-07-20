'use client'

import type { CommunityZoneDto } from '@pda/community'
import { ArrowLeft, ArrowRight, Calendar, Gauge } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
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
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'

const ALL_METERS = '__all__'

export default function ReadingsExportPage() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id || ''

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [waterMeterId, setWaterMeterId] = useState(ALL_METERS)
  const [meterSearch, setMeterSearch] = useState('')
  const [isNavigating, setIsNavigating] = useState(false)

  const { data: zones } = api.community.getCommunityZones.useQuery(
    { id: communityId },
    { enabled: !!communityId }
  )

  const zoneIds = useMemo(
    () => (zones as CommunityZoneDto[] | undefined)?.map((zone) => zone.id) ?? [],
    [zones]
  )

  const { data: meters } = api.waterAccount.getActiveWaterMetersOrderedByLastReading.useQuery(
    { zoneIds },
    { enabled: zoneIds.length > 0 }
  )

  const filteredMeters = useMemo(() => {
    if (!meters) return []
    const q = meterSearch.trim().toLowerCase()
    if (!q) return meters
    return meters.filter((meter) => {
      const haystack = [
        meter.waterAccountName,
        meter.waterPoint.name,
        meter.waterPoint.connectionNumber ?? ''
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [meters, meterSearch])

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

    setIsNavigating(true)

    const params = new URLSearchParams({
      startDate,
      endDate
    })
    if (waterMeterId && waterMeterId !== ALL_METERS) {
      params.set('waterMeterId', waterMeterId)
    }

    router.push(`/export/readings/results?${params.toString()}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/export" className="hover:text-foreground">
            Exportar Datos
          </Link>
          <span>/</span>
          <span className="text-foreground">Lecturas</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Filtros de Lecturas</h1>
          <p className="text-muted-foreground">
            Configura el período y, opcionalmente, un contador concreto
          </p>
        </div>

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

            <div className="space-y-2">
              <Label htmlFor="meterSearch">Contador (opcional)</Label>
              <Input
                id="meterSearch"
                placeholder="Buscar por titular, casa o nº enganche..."
                value={meterSearch}
                onChange={(e) => setMeterSearch(e.target.value)}
              />
              <Select value={waterMeterId} onValueChange={setWaterMeterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los contadores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_METERS}>Todos los contadores</SelectItem>
                  {filteredMeters.map((meter) => (
                    <SelectItem key={meter.id} value={meter.id}>
                      {[
                        meter.waterPoint.connectionNumber,
                        meter.waterPoint.name,
                        meter.waterAccountName
                      ]
                        .filter(Boolean)
                        .join(' — ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Si eliges un contador, el PDF listará todas sus lecturas del período con consumo
                total y medio.
              </p>
            </div>

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

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/export">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>

          <Button onClick={handleExport} disabled={!startDate || !endDate || isNavigating}>
            {isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Cargando...
              </>
            ) : (
              <>
                Generar Exportación
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Información de la Exportación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Sin contador: PDF comunitario con todos los contadores activos (primera/última
                lectura y consumo total)
              </p>
              <p>
                • Con contador: PDF detallado con todas las lecturas del período, consumo total y
                consumo medio (L/día)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
