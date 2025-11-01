'use client'

import { Filter, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { api } from '@/trpc/react'
import { MeterReplacementFilters } from './_components/meter-replacement-filters'
import MeterReplacementForm from './_components/meter-replacement-form'

export default function MeterReplacementPage() {
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [nameFilter, setNameFilter] = useState<string>('')
  const [showOnlyExcess, setShowOnlyExcess] = useState<boolean>(false)

  const { data: meters, isLoading } =
    api.waterAccount.getActiveWaterMetersOrderedByLastReading.useQuery({
      zoneIds: selectedZones
    })

  // Filter meters locally by name and excess
  const filteredMeters = useMemo(() => {
    if (!meters) return []

    return meters.filter((meter) => {
      // Filter by name (search in account name, water point name, and location)
      if (nameFilter && nameFilter.length >= 3) {
        const searchLower = nameFilter.toLowerCase()
        const matchesName =
          meter.waterAccountName.toLowerCase().includes(searchLower) ||
          meter.waterPoint.name.toLowerCase().includes(searchLower) ||
          meter.waterPoint.location.toLowerCase().includes(searchLower)

        if (!matchesName) return false
      }

      // Filter by excess
      if (showOnlyExcess && !meter.lastReadingExcessConsumption) {
        return false
      }

      return true
    })
  }, [meters, nameFilter, showOnlyExcess])

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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Cambio de Contador</h1>
            <p className="text-muted-foreground">Selecciona el contador que deseas reemplazar</p>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Barra de búsqueda siempre visible */}
        <div className="w-full max-w-md">
          <SearchInput
            value={nameFilter}
            onChange={setNameFilter}
            placeholder="Buscar por nombre o dirección..."
            minChars={3}
          />
        </div>

        {showFilters && (
          <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200 shadow-lg shadow-blue-100/50">
            <MeterReplacementFilters
              selectedZones={selectedZones}
              onZonesChange={setSelectedZones}
              showOnlyExcess={showOnlyExcess}
              onShowOnlyExcessChange={setShowOnlyExcess}
            />
          </Card>
        )}

        <div className="grid gap-3">
          {filteredMeters?.map((meter) => (
            <Card
              key={meter.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedMeterId(meter.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{meter.waterAccountName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {meter.waterPoint.name} - {meter.waterPoint.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Última lectura: {meter.lastReadingNormalizedValue || 'N/A'} L
                      {meter.lastReadingDate &&
                        ` - ${new Date(meter.lastReadingDate).toLocaleDateString('es-ES')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {meter.measurementUnit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedMeterId && (
          <MeterReplacementForm
            meterId={selectedMeterId}
            onClose={() => setSelectedMeterId(null)}
            onSuccess={() => {
              setSelectedMeterId(null)
            }}
          />
        )}
      </div>
    </PageContainer>
  )
}
