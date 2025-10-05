'use client'

import { AlertTriangle, CheckCircle, Clock, Droplets, Eye, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCommunityZonesStore } from '@/stores/community/community-zones-provider'
import { api } from '@/trpc/react'

interface WaterMeterListProps {
  selectedZone: string
  nameFilter: string
}

export default function WaterMeterList({ selectedZone, nameFilter }: WaterMeterListProps) {
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

  // Filtrar por nombre si hay filtro de texto
  const filteredWaterMeters = useMemo(() => {
    if (!waterMeters) return []

    return waterMeters.filter(
      (waterMeter) =>
        waterMeter.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        waterMeter.waterPoint.name.toLowerCase().includes(nameFilter.toLowerCase())
    )
  }, [waterMeters, nameFilter])

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

  if (isLoading) {
    return (
      <div className="space-y-0">
        {/* Header skeleton */}
        <div className="grid grid-cols-6 gap-4 py-3 px-4 bg-gray-50 border-b border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
        {/* Rows skeleton */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`loading-skeleton-${Date.now()}-${i}`}
            className="grid grid-cols-6 gap-4 py-3 px-4 border-b border-gray-200 animate-pulse last:border-b-0"
          >
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
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
              {nameFilter
                ? `No hay contadores que coincidan con "${nameFilter}"`
                : 'No hay contadores disponibles en la zona seleccionada'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-6 gap-4 py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 font-semibold text-blue-800">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4" />
          Contador
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Punto de Agua
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Última Lectura
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4" />
          Valor (L)
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Estado
        </div>
        <div className="text-center">Acciones</div>
      </div>

      {/* Rows */}
      {filteredWaterMeters.map((waterMeter) => (
        <div
          key={waterMeter.id}
          className="grid grid-cols-6 gap-4 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0"
        >
          {/* Contador */}
          <div className="flex flex-col">
            <Link
              href={`/water-meter/${waterMeter.id}`}
              className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
            >
              {waterMeter.name}
            </Link>
            <div className="text-xs text-gray-500">ID: {waterMeter.id.slice(-8)}</div>
          </div>

          {/* Punto de Agua */}
          <div className="flex flex-col">
            <div className="font-medium text-gray-900">{waterMeter.waterPoint.name}</div>
            <div className="text-sm text-gray-600">{waterMeter.waterPoint.location}</div>
          </div>

          {/* Última Lectura */}
          <div className="flex flex-col">
            {waterMeter.lastReadingDate ? (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(waterMeter.lastReadingDate).toLocaleDateString('es-ES')}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(waterMeter.lastReadingDate).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 italic">Sin lecturas</div>
            )}
          </div>

          {/* Valor */}
          <div className="flex items-center">
            {waterMeter.lastReadingNormalizedValue ? (
              <div className="text-lg font-bold text-blue-600">
                {waterMeter.lastReadingNormalizedValue.toLocaleString()} L
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">N/A</div>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center">{getStatusBadge(waterMeter)}</div>

          {/* Acciones */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/water-point/${waterMeter.waterPoint.id}`}>
                <MapPin className="h-3 w-3 mr-1" />
                Punto de agua
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/water-meter/${waterMeter.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                Ver detalle
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
