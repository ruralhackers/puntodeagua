'use client'

import { useMemo } from 'react'
import { api } from '@/trpc/react'
import { WaterMeterItem } from './water-meter-item'
import { WaterMeterListSkeleton } from './water-meter-list-skeleton'

interface WaterMeterListProps {
  selectedZones: string[]
  nameFilter: string
  showOnlyExcess: boolean
}

export function WaterMeterList({ selectedZones, nameFilter, showOnlyExcess }: WaterMeterListProps) {
  const {
    data: waterMeters,
    isLoading,
    error
  } = api.waterAccount.getActiveWaterMetersOrderedByLastReading.useQuery({
    zoneIds: selectedZones
  })

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

    // Filter by excess consumption
    if (showOnlyExcess) {
      filtered = filtered.filter((meter) => meter.lastReadingExcessConsumption === true)
    }

    return filtered
  }, [waterMeters, nameFilter, showOnlyExcess])

  if (isLoading) {
    return <WaterMeterListSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error al cargar los contadores: {error.message}</p>
      </div>
    )
  }

  if (filteredWaterMeters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {waterMeters?.length === 0
            ? 'No hay contadores activos en las zonas seleccionadas'
            : 'No se encontraron contadores que coincidan con los filtros'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredWaterMeters.map((waterMeter) => (
        <WaterMeterItem key={waterMeter.id} waterMeter={waterMeter} />
      ))}
    </div>
  )
}
