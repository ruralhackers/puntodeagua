'use client'

import { Eye, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
        {/* Header skeleton */}
        <div className="grid grid-cols-4 gap-4 py-3 px-4 bg-gray-50 border-b border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
        {/* Rows skeleton */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`loading-skeleton-${Date.now()}-${i}`}
            className="grid grid-cols-4 gap-4 py-3 px-4 border-b border-gray-200 animate-pulse last:border-b-0"
          >
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
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
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 font-semibold text-green-800">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Punto de Agua
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Ubicación
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Población
        </div>
        <div className="text-center">Acciones</div>
      </div>

      {/* Rows */}
      {filteredWaterPoints.map((waterPoint) => (
        <div
          key={waterPoint.id}
          className="grid grid-cols-4 gap-4 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0"
        >
          {/* Punto de Agua */}
          <div className="flex flex-col">
            <div className="font-medium text-gray-900">{waterPoint.name}</div>
            <div className="text-xs text-gray-500">ID: {waterPoint.id.slice(-8)}</div>
          </div>

          {/* Ubicación */}
          <div className="flex flex-col">
            <div className="text-sm text-gray-600">{waterPoint.location}</div>
            <div className="text-xs text-gray-500">{waterPoint.cadastralReference}</div>
          </div>

          {/* Población */}
          <div className="flex items-center">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {waterPoint.fixedPopulation + waterPoint.floatingPopulation} personas
              </div>
              <div className="text-xs text-gray-500">
                Fija: {waterPoint.fixedPopulation} • Flotante: {waterPoint.floatingPopulation}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/water-point/${waterPoint.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
