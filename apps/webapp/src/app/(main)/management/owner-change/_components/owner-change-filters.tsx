'use client'

import { X } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useCommunityZonesStore } from '@/stores/community/community-zones-provider'

interface OwnerChangeFiltersProps {
  selectedZones: string[]
  onZonesChange: (zones: string[]) => void
}

export function OwnerChangeFilters({ selectedZones, onZonesChange }: OwnerChangeFiltersProps) {
  const zoneFilterId = useId()
  const zones = useCommunityZonesStore((state) => state.zones)

  const handleClearFilters = () => {
    onZonesChange([])
  }

  const hasActiveFilters = selectedZones.length > 0

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>
      )}
    </div>
  )
}
