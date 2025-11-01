'use client'

import { Filter } from 'lucide-react'
import { useId, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Checkbox } from '../../../components/ui/checkbox'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui/select'
import { useCommunityZonesStore } from '../../../stores/community/community-zones-provider'
import WaterMeterList from './_components/water-meter-list'

export default function WaterMeterListPage() {
  const zoneFilterId = useId()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [nameFilter, setNameFilter] = useState<string>('')
  const [showOnlyExcess, setShowOnlyExcess] = useState<boolean>(false)
  const [showInactive, setShowInactive] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const zones = useCommunityZonesStore((state) => state.zones)

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Contadores de Agua</h1>
            <p className="text-muted-foreground">
              Gestiona la información y configuración de los contadores de agua activos
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

        {/* Barra de búsqueda siempre visible */}
        <div className="w-full max-w-md">
          <SearchInput
            value={nameFilter}
            onChange={setNameFilter}
            placeholder="Buscar por nombre o ubicación..."
            minChars={3}
          />
        </div>

        {/* Filtros colapsables */}
        {showFilters && (
          <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200 shadow-lg shadow-blue-100/50">
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">Filtros</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zone Filter */}
                <div className="space-y-2">
                  <Label htmlFor={zoneFilterId} className="text-sm font-medium">
                    Zona
                  </Label>
                  <Select onValueChange={setSelectedZone} value={selectedZone}>
                    <SelectTrigger id={zoneFilterId} className="w-full">
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

                {/* Excess Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="excess-only"
                        checked={showOnlyExcess}
                        onCheckedChange={(checked) => setShowOnlyExcess(checked === true)}
                      />
                      <Label htmlFor="excess-only" className="text-sm font-normal cursor-pointer">
                        Solo contadores con exceso
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-inactive"
                        checked={showInactive}
                        onCheckedChange={(checked) => setShowInactive(checked === true)}
                      />
                      <Label htmlFor="show-inactive" className="text-sm font-normal cursor-pointer">
                        Mostrar contadores inactivos
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <WaterMeterList
          selectedZone={selectedZone}
          nameFilter={nameFilter}
          showOnlyExcess={showOnlyExcess}
          showInactive={showInactive}
        />
      </div>
    </PageContainer>
  )
}
