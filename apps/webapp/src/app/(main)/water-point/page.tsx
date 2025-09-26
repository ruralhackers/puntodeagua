'use client'

import { Search } from 'lucide-react'
import { useId, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useCommunityZonesStore } from '@/stores/community/community-zones-provider'
import WaterPointList from './_components/water-point-list'

export default function Page() {
  const zoneFilterId = useId()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [nameFilter, setNameFilter] = useState<string>('')

  const zones = useCommunityZonesStore((state) => state.zones)

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Contadores - Lecturas</h1>
          <p className="text-muted-foreground">
            Selecciona un contador para registrar una nueva lectura
          </p>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros y Búsqueda</CardTitle>
            <CardDescription>Encuentra rápidamente el contador que necesitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Buscar por nombre
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar contador por nombre..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Zone Filter */}
            <div className="space-y-2">
              <label htmlFor={zoneFilterId} className="text-sm font-medium">
                Filtrar por zona de agua
              </label>
              <Select onValueChange={setSelectedZone} value={selectedZone}>
                <SelectTrigger id={zoneFilterId} className="w-full max-w-xs">
                  <SelectValue placeholder="Todas las zonas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Water Points List */}
        <WaterPointList selectedZone={selectedZone} nameFilter={nameFilter} />
      </div>
    </PageContainer>
  )
}
