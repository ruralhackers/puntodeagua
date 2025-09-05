'use client'
import type { HolderDto, WaterMeterDto, WaterZoneDto } from 'features'
import { ArrowLeft, Calendar, Filter, Search } from 'lucide-react'
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
import WaterMeterCardForReadings from './components/WaterMeterCardForReadings'
import { getDaysSinceLastReading } from './utils/reading-utils'

type Props = {
  waterMeters: WaterMeterDto[]
  waterZones: WaterZoneDto[]
  holders: HolderDto[]
}

export default function WaterMeterForReadingsPage({ waterMeters, waterZones, holders }: Props) {
  const zoneFilterId = useId()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [nameFilter, setNameFilter] = useState<string>('')
  const [showZoneFilter, setShowZoneFilter] = useState<boolean>(false)

  const getHolderById = (holderId: string) => {
    return holders.find((holder) => holder.id === holderId)
  }

  // Filter water meters based on selected zone and search term
  const filteredWaterMeters = waterMeters.filter((meter) => {
    const matchesZone = selectedZone === 'all' || meter.waterZoneId.toString() === selectedZone

    if (!nameFilter) return matchesZone

    const searchTerm = nameFilter.toLowerCase()
    const holder = getHolderById(meter.holderId)

    const matchesName = meter.name.toLowerCase().includes(searchTerm)
    const matchesHolderName = holder?.name.toLowerCase().includes(searchTerm)
    const matchesHolderDni = holder?.nationalId.toLowerCase().includes(searchTerm)
    const matchesMeterId = meter.id.toLowerCase().includes(searchTerm)

    return matchesZone && (matchesName || matchesHolderName || matchesHolderDni || matchesMeterId)
  })

  // Calcular estadísticas específicas para lecturas
  const metersWithoutReadings = waterMeters.filter(
    (meter) => !meter.readings || meter.readings.length === 0
  ).length
  const metersWithOldReadings = waterMeters.filter((meter) => {
    const days = getDaysSinceLastReading(meter.lastReadingDate)
    return days !== null && days > 90
  }).length
  const totalMeters = waterMeters.length
  const metersWithReadings = totalMeters - metersWithoutReadings

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-4">
        <Button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Link href={'/dashboard'}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">Contadores - Lecturas</h1>
          <p className="text-muted-foreground">
            Selecciona un contador para registrar una nueva lectura
          </p>
        </div>
      </div>

      {/* Barra de búsqueda y filtro */}
      <div className="flex gap-3 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowZoneFilter(!showZoneFilter)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, DNI o ID contador..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtro por zona - solo se muestra cuando showZoneFilter es true */}
      {showZoneFilter && (
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
      )}

      {/* Lista de contadores */}
      <div className="space-y-3">
        {filteredWaterMeters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron contadores</p>
          </div>
        ) : (
          filteredWaterMeters.map((meter) => (
            <WaterMeterCardForReadings
              key={meter.id}
              meter={meter}
              holder={getHolderById(meter.holderId)}
              onClickLink={`/dashboard/nuevo-registro/contador/${meter.id}`}
            />
          ))
        )}
      </div>
    </div>
  )
}
