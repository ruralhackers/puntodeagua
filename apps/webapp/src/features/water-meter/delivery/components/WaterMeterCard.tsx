import type { HolderDto, WaterMeterDto, WaterPointDto } from 'features'
import { Droplets, MapPin, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

interface WaterMeterCardProps {
  meter: WaterMeterDto
  holder?: HolderDto
  waterPoint?: WaterPointDto
  onClickLink?: string
}

export default function WaterMeterCard({
  meter,
  holder,
  waterPoint,
  onClickLink
}: WaterMeterCardProps) {
  const router = useRouter()

  // we calculate the consumption of the 2 last readings.
  const lastReadings = meter.readings?.sort(
    (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
  )
  const lastReading = lastReadings?.[0]
  const secondLastReading = lastReadings?.[1]

  const consumption =
    lastReading?.normalizedReading && secondLastReading?.normalizedReading
      ? Number(lastReading.normalizedReading) - Number(secondLastReading.normalizedReading)
      : 0

  const handleCardClick = () => {
    router.push(onClickLink || `/dashboard/registros/contadores/${meter.id}`)
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h3 className="font-semibold text-lg truncate">
                {holder?.name} • {meter.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {holder?.nationalId && `DNI: ${holder.nationalId}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {waterPoint?.location && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{waterPoint.location}</span>
                </div>
              )}
              {waterPoint && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>{waterPoint.fixedPopulation + waterPoint.floatingPopulation} personas</span>
                </div>
              )}
              {meter.readings && meter.readings.length > 0 && (
                <div className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 flex-shrink-0" />
                  <span>{Number(consumption).toFixed(2)} litros</span>
                </div>
              )}
            </div>
            {meter.readings &&
              meter.readings.length > 0 &&
              meter.readings[0]?.['excess-consumption'] && (
                <div className="text-red-600 text-sm font-medium mt-2">
                  ⚠️ Consumo anómalo detectado
                </div>
              )}
          </div>
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
