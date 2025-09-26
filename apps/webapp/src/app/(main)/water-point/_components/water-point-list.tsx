'use client'

import { FileText, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={`loading-skeleton-${Date.now()}-${i}`} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error al cargar los puntos de agua: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (filteredWaterPoints.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            {nameFilter
              ? `No se encontraron puntos de agua que coincidan con "${nameFilter}"`
              : 'No hay puntos de agua disponibles en la zona seleccionada'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredWaterPoints.map((waterPoint) => (
        <Card key={waterPoint.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{waterPoint.name}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {waterPoint.location}
                </div>
              </div>
              <Badge variant="outline">{waterPoint.cadastralReference}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Population Info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Población fija:</span>
                <span>{waterPoint.fixedPopulation}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-green-500" />
                <span className="font-medium">Población flotante:</span>
                <span>{waterPoint.floatingPopulation}</span>
              </div>
            </div>

            {/* Notes */}
            {waterPoint.notes && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{waterPoint.notes}</p>
              </div>
            )}

            {/* Action Button - placeholder for future functionality */}
            <div className="pt-2">
              <Link
                href={`/water-point/${waterPoint.id}`}
                className="text-sm text-primary hover:underline hover:cursor-pointer"
              >
                Ver contador →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
