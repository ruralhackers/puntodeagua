'use client'

import { AlertTriangle, Clock, Droplets, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useCommunityZonesStore } from '@/stores/community/community-zones-provider'
import { api } from '@/trpc/react'
import { formatLastReading } from './format-last-reading'
import { WaterMeterCardSkeleton } from './water-meter-card-skeleton'
import { WaterMeterStatusBadge } from './water-meter-status-badge'

interface WaterMeterListProps {
  selectedZone: string
  nameFilter: string
  showOnlyExcess: boolean
  showInactive: boolean
}

export default function WaterMeterList({
  selectedZone,
  nameFilter,
  showOnlyExcess,
  showInactive
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
    {
      zoneIds,
      includeInactive: showInactive
    },
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <WaterMeterCardSkeleton key={`loading-skeleton-${Date.now()}-${i}`} />
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
        <Link key={waterMeter.id} href={`/water-meter/${waterMeter.id}`}>
          <Card
            className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
              !waterMeter.isActive ? 'opacity-60 border-gray-300' : ''
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Información principal */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-lg">{waterMeter.waterAccountName}</h3>
                  {!waterMeter.isActive && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                      Inactivo
                    </Badge>
                  )}
                  <WaterMeterStatusBadge
                    lastReadingDate={waterMeter.lastReadingDate}
                    lastReadingExcessConsumption={waterMeter.lastReadingExcessConsumption}
                    variant="compact"
                  />
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
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
