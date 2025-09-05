'use client'
import type { HolderDto, WaterMeterDto, WaterPointDto, WaterZoneDto } from 'features'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import WaterMeterCard from './components/WaterMeterCard'

type Props = {
  waterMeters: WaterMeterDto[]
  waterZones: WaterZoneDto[]
  holders: HolderDto[]
  waterPoints: WaterPointDto[]
}

export default function WaterMeterPage({ waterMeters, waterZones, holders, waterPoints }: Props) {
  const zoneFilterId = useId()
  const nameFilterId = useId()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [nameFilter, setNameFilter] = useState<string>('')

  console.log({ holders, waterPoints })

  // Filter water meters based on selected zone and name
  const filteredWaterMeters = waterMeters.filter((meter) => {
    const matchesZone = selectedZone === 'all' || meter.waterZoneId.toString() === selectedZone
    const matchesName = !nameFilter || meter.name.toLowerCase().includes(nameFilter.toLowerCase())
    return matchesZone && matchesName
  })

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Link href={'/dashboard'}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Contadores</h1>
      </div>

      <p className="text-gray-600 mb-6">Gestión de contadores y control de consumos</p>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor={zoneFilterId} className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por zona de agua
            </label>
            <Select onValueChange={setSelectedZone} value={selectedZone}>
              <SelectTrigger id={zoneFilterId} className="w-full">
                <SelectValue placeholder="Todas las zonas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las zonas</SelectItem>
                {waterZones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor={nameFilterId} className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nombre
            </label>
            <Input
              id={nameFilterId}
              type="search"
              placeholder="Buscar por nombre..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredWaterMeters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron contadores con los filtros aplicados
          </div>
        ) : (
          filteredWaterMeters.map((meter) => <WaterMeterCard key={meter.id} meter={meter} />)
        )}
      </div>
    </div>
  )
}
