'use client'

import type { WaterMeterDto } from 'features'
import { AlertTriangle, ArrowLeft, Camera, Droplets, Edit, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import WaterMeterReadingHistory from './components/WaterMeterReadingHistory'

interface WaterMeterDetailPageProps {
  waterMeter: WaterMeterDto
  waterMeterId: string
}

export default function WaterMeterDetailPage({
  waterMeter: initialWaterMeter,
  waterMeterId
}: WaterMeterDetailPageProps) {
  const [waterMeter, setWaterMeter] = useState<WaterMeterDto>(initialWaterMeter)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<WaterMeterDto>(waterMeter)
  const getWaterMeterQry = useUseCase(GetWaterMeterQry)
  const nameInputId = useId()
  const waterZoneInputId = useId()

  const refreshWaterMeter = async () => {
    try {
      const updatedWaterMeter = await getWaterMeterQry.execute(waterMeterId)
      if (updatedWaterMeter) {
        const dto = updatedWaterMeter.toDto()
        setWaterMeter(dto as WaterMeterDto)
        setEditData(dto as WaterMeterDto)
      }
    } catch (error) {
      console.error('Error refreshing water meter:', error)
    }
  }

  const handleEdit = () => {
    setEditData({ ...waterMeter })
    setIsEditing(true)
  }

  const handleSave = () => {
    setWaterMeter(editData)
    setIsEditing(false)
    // TODO: Implementar guardado en backend
    alert('Contador actualizado exitosamente')
  }

  const handleCancel = () => {
    setEditData({ ...waterMeter })
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof WaterMeterDto, value: string | string[]) => {
    setEditData({ ...editData, [field]: value })
  }

  const displayData = isEditing ? editData : waterMeter

  // Función para formatear la fecha
  const formatDate = (date?: Date) => {
    if (!date) return 'No disponible'
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  // Función para formatear el valor de lectura
  const formatReadingValue = (value?: string) => {
    if (!value) return 'No disponible'
    return `${value} L`
  }

  // Función para obtener la última lectura
  const getLastReading = () => {
    if (!waterMeter.readings || waterMeter.readings.length === 0) {
      return null
    }
    // Ordenar por fecha descendente y tomar la primera
    return waterMeter.readings.sort(
      (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
    )[0]
  }

  const lastReading = getLastReading()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
          <Link href="/dashboard/contadores">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate">
              {displayData?.name}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Detalles del contador • ID: {displayData?.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="whitespace-nowrap">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="whitespace-nowrap">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="whitespace-nowrap">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Última Lectura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Última Lectura
            </CardTitle>
            <CardDescription>Información de la última medición registrada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {lastReading ? formatReadingValue(lastReading.reading) : 'No disponible'}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    {lastReading ? formatDate(lastReading.readingDate) : 'No disponible'}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="p-3 rounded-lg">
                  {lastReading?.['excess-consumption'] ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Consumo excesivo detectado</span>
                    </div>
                  ) : lastReading ? (
                    <div className="text-green-600 text-sm font-medium">Normal</div>
                  ) : (
                    <div className="text-gray-500 text-sm font-medium">Sin lecturas</div>
                  )}
                </div>
              </div>
            </div>

            {/* Información adicional de consumo */}
            {lastReading && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Consumo</Label>
                    <div className="text-lg font-semibold text-gray-700">
                      {lastReading.consumption ? `${lastReading.consumption} L` : 'No calculado'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Normalizado</Label>
                    <div className="text-sm text-gray-600 font-mono">
                      {lastReading.normalizedReading
                        ? `${lastReading.normalizedReading} L`
                        : 'No disponible'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Datos del Contador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Datos del Contador
            </CardTitle>
            <CardDescription>Información técnica del contador de agua</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={nameInputId}>Nombre del Contador</Label>
                {isEditing ? (
                  <Input
                    id={nameInputId}
                    value={editData?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-muted rounded">{displayData?.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurementUnit">Unidad de Medida</Label>
                {isEditing ? (
                  <Select
                    value={editData?.measurementUnit || 'litros'}
                    onValueChange={(value) => handleInputChange('measurementUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="litros">Litros</SelectItem>
                      <SelectItem value="m3">Metros cúbicos (m³)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-muted rounded">
                    {displayData?.measurementUnit === 'm3' ? 'Metros cúbicos (m³)' : 'Litros'}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Todos los valores se convierten a litros internamente
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={waterZoneInputId}>Zona de Agua</Label>
                {isEditing ? (
                  <Input
                    id={waterZoneInputId}
                    value={editData?.waterZoneName || ''}
                    onChange={(e) => handleInputChange('waterZoneName', e.target.value)}
                    placeholder="Nombre de la zona de agua"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded">
                    {displayData?.waterZoneName || 'No especificada'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderId">ID del Titular</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm">
                  {displayData?.holderId}
                </div>
                <p className="text-xs text-muted-foreground">
                  Identificador del titular del contador
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fotos del Contador</Label>
              <div className="space-y-2">
                {displayData?.images && displayData.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {displayData.images.map((image) => (
                      <div key={image} className="flex items-center gap-3 p-3 bg-muted rounded">
                        <Camera className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{image}</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Disponible
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">No hay fotos disponibles</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Fotos de referencia del contador (formatos: JPG, PNG, máx. 5MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Historial de Lecturas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Historial de Lecturas
            </CardTitle>
            <CardDescription>
              Registro histórico de todas las mediciones del contador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WaterMeterReadingHistory
              readings={
                waterMeter.readings?.map((reading, index) => ({
                  ...reading,
                  id: `reading-${index}` // Generar ID temporal para compatibilidad
                })) ?? []
              }
              onReadingDeleted={refreshWaterMeter}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
