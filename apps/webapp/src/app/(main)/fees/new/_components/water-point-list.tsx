'use client'

import { useMemo } from 'react'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import { WaterPointItem } from './water-point-item'

interface WaterPointListProps {
  nameFilter: string
}

export function WaterPointList({ nameFilter }: WaterPointListProps) {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id

  const {
    data: waterPoints = [],
    isLoading,
    error
  } = api.community.getWaterPointsByCommunityWithAccount.useQuery(
    { communityId: communityId || '' },
    { enabled: !!communityId }
  )

  const filteredPoints = useMemo(() => {
    if (!nameFilter.trim()) return waterPoints

    const searchTerm = nameFilter.toLowerCase().trim()
    return waterPoints.filter(
      (point) =>
        point.name.toLowerCase().includes(searchTerm) ||
        point.location?.toLowerCase().includes(searchTerm) ||
        point.connectionNumber?.toLowerCase().includes(searchTerm) ||
        point.waterAccountName?.toLowerCase().includes(searchTerm)
    )
  }, [waterPoints, nameFilter])

  if (!communityId) {
    return (
      <div className="text-center py-8 text-destructive">
        No se pudo determinar la comunidad del usuario
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Cargando puntos de agua...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error al cargar los puntos: {error.message}</p>
      </div>
    )
  }

  if (filteredPoints.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {waterPoints.length === 0
            ? 'No hay puntos de agua en la comunidad'
            : 'No se encontraron puntos que coincidan con la búsqueda'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredPoints.map((point) => (
        <WaterPointItem
          key={point.id}
          id={point.id}
          name={point.name}
          location={point.location}
          connectionNumber={point.connectionNumber}
          waterAccountName={point.waterAccountName}
        />
      ))}
    </div>
  )
}
