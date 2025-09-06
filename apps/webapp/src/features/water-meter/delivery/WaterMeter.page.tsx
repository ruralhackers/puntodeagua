'use client'
import type { HolderDto, WaterMeterDto, WaterPointDto, WaterZoneDto } from 'features'
import { Droplets, Filter, Plus, Search, Upload } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PageHeader } from '@/src/components/shared-data/page-header'
import WaterMeterCard from './components/WaterMeterCard'

type Props = {
  waterMeters: WaterMeterDto[]
  waterZones: WaterZoneDto[]
  holders: HolderDto[]
  waterPoints: WaterPointDto[]
  cardTo: 'detail' | 'new'
}

export default function WaterMeterPage({
  waterMeters,
  waterZones,
  holders,
  waterPoints,
  cardTo
}: Props) {
  const zoneFilterId = useId()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [nameFilter, setNameFilter] = useState<string>('')
  const [showZoneFilter, setShowZoneFilter] = useState<boolean>(false)

  const getHolderById = (holderId: string) => {
    return holders.find((holder) => holder.id === holderId)
  }

  const getWaterPointById = (waterPointId: string) => {
    return waterPoints.find((point) => point.id === waterPointId)
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Contadores"
        subtitle={
          cardTo === 'detail'
            ? 'Gestiona los contadores y puntos de agua de la comunidad'
            : 'Selecciona un contador para registrar una nueva lectura'
        }
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {cardTo === 'detail' && (
          <div className="flex gap-2 flex-shrink-0 hover:cursor-pointer">
            <Button
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap"
              disabled
            >
              <Upload className="h-4 w-4" />
              Importar CSV
            </Button>
            <Link href="#">
              <Button className="flex items-center gap-2 whitespace-nowrap" disabled>
                <Plus className="h-4 w-4" />
                Nuevo Contador
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contadores</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waterMeters.length}</div>
          </CardContent>
        </Card>
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
            <WaterMeterCard
              key={meter.id}
              meter={meter}
              holder={getHolderById(meter.holderId)}
              waterPoint={getWaterPointById(meter.waterPointId)}
              onClickLink={
                cardTo === 'detail'
                  ? `/dashboard/registros/contadores/${meter.id}`
                  : `/dashboard/nuevo-registro/contador/${meter.id}`
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
