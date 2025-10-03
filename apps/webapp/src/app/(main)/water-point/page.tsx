'use client'

import { Filter, Search } from 'lucide-react'
import { useId, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
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
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const zones = useCommunityZonesStore((state) => state.zones)

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Contadores - Lecturas</h1>
            <p className="text-muted-foreground">
              Selecciona un contador para registrar una nueva lectura
            </p>
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

        {/* Filters and Search */}
        {showFilters && (
          <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200 shadow-lg shadow-blue-100/50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Filtros y Búsqueda
              </CardTitle>
              <CardDescription className="text-blue-600">
                Encuentra rápidamente el contador que necesitas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-semibold text-blue-700">
                  Buscar por nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Buscar contador por nombre..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-10 bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Zone Filter */}
              <div className="space-y-2">
                <label htmlFor={zoneFilterId} className="text-sm font-semibold text-blue-700">
                  Filtrar por zona de agua
                </label>
                <Select onValueChange={setSelectedZone} value={selectedZone}>
                  <SelectTrigger
                    id={zoneFilterId}
                    className="w-full max-w-xs bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  >
                    <SelectValue placeholder="Todas las zonas" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                    <SelectItem value="all" className="focus:bg-blue-50">
                      Todas las zonas
                    </SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id} className="focus:bg-blue-50">
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Water Points List */}
        <WaterPointList selectedZone={selectedZone} nameFilter={nameFilter} />
      </div>
    </PageContainer>
  )
}
