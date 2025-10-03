'use client'

import { Search, X } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useCommunityZonesStore } from '@/stores/community/community-zones-provider'

interface WaterMeterFiltersProps {
  selectedZones: string[]
  onZonesChange: (zones: string[]) => void
  nameFilter: string
  onNameFilterChange: (filter: string) => void
  showOnlyExcess: boolean
  onShowOnlyExcessChange: (show: boolean) => void
}

export function WaterMeterFilters({
  selectedZones,
  onZonesChange,
  nameFilter,
  onNameFilterChange,
  showOnlyExcess,
  onShowOnlyExcessChange
}: WaterMeterFiltersProps) {
  const [localNameFilter, setLocalNameFilter] = useState(nameFilter)
  const zoneFilterId = useId()
  const zones = useCommunityZonesStore((state) => state.zones)

  const handleSearch = () => {
    onNameFilterChange(localNameFilter)
  }

  const handleClearFilters = () => {
    setLocalNameFilter('')
    onNameFilterChange('')
    onZonesChange([])
    onShowOnlyExcessChange(false)
  }

  const hasActiveFilters = selectedZones.length > 0 || nameFilter.trim() || showOnlyExcess

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Zone Filter */}
        <div className="space-y-2">
          <Label htmlFor={zoneFilterId} className="text-sm font-medium">
            Zona
          </Label>
          <Select
            value={selectedZones.length === 0 ? 'all' : selectedZones[0]}
            onValueChange={(value) => onZonesChange(value === 'all' ? [] : [value])}
          >
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

        {/* Name Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Buscar</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o dirección..."
                value={localNameFilter}
                onChange={(e) => setLocalNameFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} size="sm">
              Buscar
            </Button>
          </div>
        </div>

        {/* Excess Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Estado</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="excess-only"
              checked={showOnlyExcess}
              onCheckedChange={(checked) => onShowOnlyExcessChange(checked === true)}
            />
            <Label htmlFor="excess-only" className="text-sm font-normal cursor-pointer">
              Solo contadores con exceso
            </Label>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedZones.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Zonas: {selectedZones.length} seleccionada{selectedZones.length > 1 ? 's' : ''}
              </div>
            )}
            {nameFilter.trim() && (
              <div className="text-sm text-muted-foreground">Búsqueda: "{nameFilter}"</div>
            )}
            {showOnlyExcess && <div className="text-sm text-muted-foreground">Solo con exceso</div>}
          </div>
        </div>
      )}
    </div>
  )
}
