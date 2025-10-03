'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useCommunityZonesStore } from '@/stores/community/community-zones-provider'
import { api } from '@/trpc/react'

interface WaterPointListProps {
  selectedZone: string
  nameFilter: string
}

export default function WaterPointList({ selectedZone, nameFilter }: WaterPointListProps) {
  const zones = useCommunityZonesStore((state) => state.zones)

  const zoneIds = useMemo(() => {
    if (selectedZone === 'all') {
      return zones.map((zone) => zone.id)
    }
    return [selectedZone]
  }, [selectedZone, zones])

  const {
    data: waterPoints,
    isLoading,
    error
  } = api.community.getWaterPoints.useQuery({ zoneIds }, { enabled: zoneIds.length > 0 })

  // Filtrar por nombre si hay filtro de texto
  const filteredWaterPoints = useMemo(() => {
    if (!waterPoints) return []

    return waterPoints.filter((waterPoint) =>
      waterPoint.name.toLowerCase().includes(nameFilter.toLowerCase())
    )
  }, [waterPoints, nameFilter])

  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`loading-skeleton-${Date.now()}-${i}`}
            className="py-3 px-4 border-b border-gray-200 animate-pulse last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 px-3 text-center text-destructive">
        Error al cargar los puntos de agua: {error.message}
      </div>
    )
  }

  if (filteredWaterPoints.length === 0) {
    return (
      <div className="py-4 px-3 text-center text-muted-foreground">
        {nameFilter
          ? `No se encontraron puntos de agua que coincidan con "${nameFilter}"`
          : 'No hay puntos de agua disponibles en la zona seleccionada'}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {filteredWaterPoints.map((waterPoint) => (
        <Link
          key={waterPoint.id}
          href={`/water-point/${waterPoint.id}`}
          className="block py-3 px-4 border-b border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 hover:shadow-sm transition-all duration-200 last:border-b-0"
        >
          <div className="flex items-center justify-between">
            <div className="font-medium">{waterPoint.name}</div>
            <div className="text-sm text-muted-foreground">{waterPoint.location}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
