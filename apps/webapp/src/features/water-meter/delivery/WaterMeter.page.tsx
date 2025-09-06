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
import { calculateExistingReadingsConsumption } from '@/src/features/water-meter-reading/hooks/use-water-meter-consumption'
import WaterMeterCard from './components/WaterMeterCard'

type Props = {
  waterMeters: WaterMeterDto[]
  waterZones: WaterZoneDto[]
  holders: HolderDto[]
  waterPoints: WaterPointDto[]
}

export default function WaterMeterPage({ waterMeters, waterZones, holders, waterPoints }: Props) {
  const zoneFilterId = useId()
  const consumptionFilterId = useId()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedConsumption, setSelectedConsumption] = useState<string>('all')
  const [nameFilter, setNameFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const getHolderById = (holderId: string) => {
    return holders.find((holder) => holder.id === holderId)
  }

  const getWaterPointById = (waterPointId: string) => {
    return waterPoints.find((point) => point.id === waterPointId)
  }

  // Función para obtener el estado de consumo de un contador
  const getConsumptionStatus = (meter: WaterMeterDto) => {
    const waterPoint = getWaterPointById(meter.waterPoint.id)
    if (!waterPoint) return 'no-data'

    const consumptionData = calculateExistingReadingsConsumption(
      meter.waterMeterReadings || [],
      meter,
      waterPoint
    )

    if (!consumptionData) return 'no-readings'
    if (consumptionData.isNegativeConsumption) return 'negative'
    if (consumptionData.isHighConsumption) return 'high'
    return 'normal'
  }

  // Filter water meters based on selected zone, consumption status and search term
  const filteredWaterMeters = waterMeters.filter((meter) => {
    const matchesZone = selectedZone === 'all' || meter.waterZoneId.toString() === selectedZone
    const matchesConsumption =
      selectedConsumption === 'all' || getConsumptionStatus(meter) === selectedConsumption

    if (!nameFilter) return matchesZone && matchesConsumption

    const searchTerm = nameFilter.toLowerCase()
    const holder = getHolderById(meter.holderId)

    const matchesName = meter.name.toLowerCase().includes(searchTerm)
    const matchesHolderName = holder?.name.toLowerCase().includes(searchTerm)
    const matchesHolderDni = holder?.nationalId.toLowerCase().includes(searchTerm)
    const matchesMeterId = meter.id.toLowerCase().includes(searchTerm)

    return (
      matchesZone &&
      matchesConsumption &&
      (matchesName || matchesHolderName || matchesHolderDni || matchesMeterId)
    )
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Contadores"
        subtitle={'Gestiona los contadores y puntos de agua de la comunidad'}
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex gap-2 flex-shrink-0 hover:cursor-pointer">
          <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap" disabled>
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
      </div>

      {/* Estadísticas rápidas */}
      {/* Desktop: Cards separadas */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contadores</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waterMeters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Elevado</CardTitle>
            <Droplets className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {waterMeters.filter((meter) => getConsumptionStatus(meter) === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturas Negativas</CardTitle>
            <Droplets className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {waterMeters.filter((meter) => getConsumptionStatus(meter) === 'negative').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Lecturas</CardTitle>
            <Droplets className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {waterMeters.filter((meter) => getConsumptionStatus(meter) === 'no-readings').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: Una sola card dividida en 4 cuadrículas */}
      <div className="md:hidden">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Total Contadores */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                </div>
                <div className="text-2xl font-bold">{waterMeters.length}</div>
              </div>

              {/* Consumo Elevado */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-muted-foreground">Elevado</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {waterMeters.filter((meter) => getConsumptionStatus(meter) === 'high').length}
                </div>
              </div>

              {/* Lecturas Negativas */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">Negativas</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {waterMeters.filter((meter) => getConsumptionStatus(meter) === 'negative').length}
                </div>
              </div>

              {/* Sin Lecturas */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-muted-foreground">Sin Datos</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {
                    waterMeters.filter((meter) => getConsumptionStatus(meter) === 'no-readings')
                      .length
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtro */}
      <div className="flex gap-3 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
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

      {/* Filtros - solo se muestran cuando showFilters es true */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label
              htmlFor={consumptionFilterId}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filtrar por estado de consumo
            </label>
            <Select onValueChange={setSelectedConsumption} value={selectedConsumption}>
              <SelectTrigger id={consumptionFilterId} className="w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="normal">Consumo normal</SelectItem>
                <SelectItem value="high">Consumo elevado</SelectItem>
                <SelectItem value="negative">Lecturas negativas</SelectItem>
                <SelectItem value="no-readings">Sin lecturas suficientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              onClickLink={`/dashboard/registros/contadores/${meter.id}`}
            />
          ))
        )}
      </div>
    </div>
  )
}
