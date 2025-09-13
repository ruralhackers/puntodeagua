import { ReadingAgeThreshold } from 'core'
import type { HolderDto, WaterMeterDto } from 'features'
import { Calendar, Droplets, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatDaysSinceReading,
  getDaysSinceLastReading,
  getLastNormalizedReading
} from '../utils/reading-utils'

interface WaterMeterCardForReadingsProps {
  meter: WaterMeterDto
  holder?: HolderDto
  onClickLink?: string
}

export default function WaterMeterCardForReadings({
  meter,
  holder,
  onClickLink
}: WaterMeterCardForReadingsProps) {
  const router = useRouter()

  // Calcular días desde la última lectura
  const daysSinceLastReading = getDaysSinceLastReading(meter.lastReadingDate)
  const formattedDays = formatDaysSinceReading(daysSinceLastReading)

  // Obtener normalized reading de la última lectura
  const lastNormalizedReading = getLastNormalizedReading(meter.waterMeterReadings)

  const handleCardClick = () => {
    router.push(onClickLink || `/dashboard/registros/contadores/${meter.id}`)
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer p-2"
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Nombre persona y nombre contador */}
            <div className="mb-2">
              <h3 className="font-semibold text-base truncate">
                {holder?.name || 'Sin titular'} • {meter.name}
              </h3>
            </div>

            {/* Información de lecturas */}
            <div className="space-y-1.5">
              {/* Fecha última lectura */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Última lectura:</span>
                <span
                  className={`font-medium ${
                    daysSinceLastReading === null
                      ? 'text-red-600'
                      : ReadingAgeThreshold.isOldReading(daysSinceLastReading)
                        ? 'text-orange-600'
                        : 'text-green-600'
                  }`}
                >
                  {formattedDays}
                </span>
              </div>

              {/* Normalized reading */}
              {lastNormalizedReading && (
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Última lectura en litros:</span>
                  <span className="font-medium text-blue-600">
                    {Number(lastNormalizedReading).toFixed(0)} Litros
                  </span>
                </div>
              )}

              {/* Water zone */}
              {meter.waterZoneName && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Zona:</span>
                  <span className="font-medium">{meter.waterZone.name}</span>
                </div>
              )}
            </div>

            {/* Indicador de estado */}
            {daysSinceLastReading === null && (
              <div className="text-red-600 text-xs font-medium mt-1.5">
                ⚠️ Sin lecturas registradas
              </div>
            )}
            {ReadingAgeThreshold.isOldReading(daysSinceLastReading) && (
              <div className="text-orange-600 text-xs font-medium mt-1.5">⚠️ Lectura antigua</div>
            )}
          </div>

          {/* Flecha de navegación */}
          <div className="flex items-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Ver detalles</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
