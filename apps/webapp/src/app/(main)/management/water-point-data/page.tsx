'use client'

import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import WaterPointDataForm from './_components/water-point-data-form'

export default function WaterPointDataPage() {
  const [selectedWaterPointId, setSelectedWaterPointId] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState<string>('')

  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id || ''

  const { data: waterPoints, isLoading } =
    api.community.getWaterPointsByCommunityWithAccount.useQuery(
      { communityId },
      { enabled: !!communityId }
    )

  // Filter water points locally by name
  const filteredWaterPoints = useMemo(() => {
    if (!waterPoints) return []

    return waterPoints.filter((waterPoint) => {
      // Filter by name (search in name, location, and cadastral reference)
      if (nameFilter && nameFilter.length >= 3) {
        const searchLower = nameFilter.toLowerCase()
        const matchesName =
          waterPoint.name.toLowerCase().includes(searchLower) ||
          waterPoint.location.toLowerCase().includes(searchLower) ||
          waterPoint.cadastralReference.toLowerCase().includes(searchLower) ||
          waterPoint.waterAccountName?.toLowerCase().includes(searchLower)

        if (!matchesName) return false
      }

      return true
    })
  }, [waterPoints, nameFilter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Cambiar Datos de Casa</h1>
          <p className="text-muted-foreground">Selecciona la casa que deseas editar</p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-md">
          <SearchInput
            value={nameFilter}
            onChange={setNameFilter}
            placeholder="Buscar por nombre, dirección o referencia..."
            minChars={3}
          />
        </div>

        <div className="grid gap-3">
          {filteredWaterPoints?.map((waterPoint) => (
            <Card
              key={waterPoint.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedWaterPointId(waterPoint.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{waterPoint.name}</h3>
                    {waterPoint.waterAccountName && (
                      <p className="text-sm text-muted-foreground font-medium">
                        Titular: {waterPoint.waterAccountName}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{waterPoint.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref. Catastral: {waterPoint.cadastralReference}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Población: {waterPoint.fixedPopulation} fija, {waterPoint.floatingPopulation}{' '}
                      flotante
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      Casa
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedWaterPointId && (
          <WaterPointDataForm
            waterPointId={selectedWaterPointId}
            communityId={communityId}
            onClose={() => setSelectedWaterPointId(null)}
            onSuccess={() => {
              setSelectedWaterPointId(null)
            }}
          />
        )}
      </div>
    </PageContainer>
  )
}
