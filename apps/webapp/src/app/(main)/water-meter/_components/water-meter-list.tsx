'use client'

import { AlertTriangle, CheckCircle, Clock, Droplets, Eye, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCommunityZonesStore } from '@/stores/community/community-zones-provider'
import { api } from '@/trpc/react'

interface WaterMeterListProps {
  selectedZone: string
  nameFilter: string
  showOnlyExcess: boolean
}

export default function WaterMeterList({
  selectedZone,
  nameFilter,
  showOnlyExcess
}: WaterMeterListProps) {
  const zones = useCommunityZonesStore((state) => state.zones)

  const zoneIds = useMemo(() => {
    if (selectedZone === 'all') {
      return zones.map((zone) => zone.id)
    }
    return [selectedZone]
  }, [selectedZone, zones])

  const {
    data: waterMeters,
    isLoading,
    error
  } = api.waterAccount.getActiveWaterMetersOrderedByLastReading.useQuery(
    { zoneIds },
    { enabled: zoneIds.length > 0 }
  )

  // Filtrar por nombre y exceso
  const filteredWaterMeters = useMemo(() => {
    if (!waterMeters) return []

    let filtered = waterMeters

    // Filter by name
    if (nameFilter.trim()) {
      const searchTerm = nameFilter.toLowerCase().trim()
      filtered = filtered.filter(
        (meter) =>
          meter.waterAccountName.toLowerCase().includes(searchTerm) ||
          meter.waterPoint.name.toLowerCase().includes(searchTerm) ||
          meter.waterPoint.location.toLowerCase().includes(searchTerm)
      )
    }

    // Filter by excess
    if (showOnlyExcess) {
      filtered = filtered.filter((meter) => meter.lastReadingExcessConsumption === true)
    }

    return filtered
  }, [waterMeters, nameFilter, showOnlyExcess])

  const getStatusBadge = (waterMeter: {
    lastReadingDate: Date | null
    lastReadingExcessConsumption: boolean | null
  }) => {
    if (!waterMeter.lastReadingDate) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Sin lectura
        </Badge>
      )
    }

    if (waterMeter.lastReadingExcessConsumption) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Exceso
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Normal
      </Badge>
    )
  }

  const formatLastReading = (date: Date | null) => {
    if (!date) return 'Sin lecturas'

    const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))

    if (daysAgo === 0) return 'Hoy'
    if (daysAgo === 1) return 'Ayer'
    return `Hace ${daysAgo} días`
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={`loading-skeleton-${Date.now()}-${i}`} className="p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-700">Error al cargar contadores</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (filteredWaterMeters.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Droplets className="h-12 w-12 text-gray-400" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">No se encontraron contadores</h3>
            <p className="text-gray-500">
              {nameFilter || showOnlyExcess
                ? 'No hay contadores que coincidan con los filtros aplicados'
                : 'No hay contadores disponibles en la zona seleccionada'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredWaterMeters.map((waterMeter) => (
        <Card
          key={waterMeter.id}
          className="p-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Información principal */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href={`/water-meter/${waterMeter.id}`}
                  className="font-semibold text-lg hover:text-blue-600 hover:underline transition-colors"
                >
                  {waterMeter.waterAccountName}
                </Link>
                {getStatusBadge(waterMeter)}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium">{waterMeter.waterPoint.name}</span>
                  {waterMeter.lastReadingNormalizedValue && (
                    <>
                      <span className="sm:inline">•</span>
                      <Droplets className="h-3 w-3" />
                      <span className="font-semibold text-blue-600">
                        {waterMeter.lastReadingNormalizedValue.toLocaleString('es-ES')} L
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Ultima lectura: {formatLastReading(waterMeter.lastReadingDate)}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button size="sm" asChild className="flex-1 sm:flex-none">
                <Link href={`/water-meter/${waterMeter.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver detalle
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
