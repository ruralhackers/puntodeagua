import type { HolderDto, WaterMeterDto, WaterPointDto } from 'features'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WaterMeterCardProps {
  meter: WaterMeterDto
  holder?: HolderDto
  waterPoint?: WaterPointDto
}

export default function WaterMeterCard({ meter, holder, waterPoint }: WaterMeterCardProps) {
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

  // date difference in days
  const dateDifference =
    lastReading?.readingDate && secondLastReading?.readingDate
      ? Math.abs(
          new Date(lastReading.readingDate).getTime() -
            new Date(secondLastReading.readingDate).getTime()
        )
      : 0
  const daysDifference = dateDifference / (1000 * 60 * 60 * 24)

  return (
    <Link href={`/dashboard/registros/contadores/${meter.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="gap-1">
          <CardTitle className="flex justify-between items-start">
            <span>
              {meter.name} ({meter.waterZoneName})
            </span>
            <Button asChild size="sm" className="text-xs" onClick={(e) => e.stopPropagation()}>
              <Link href={`/dashboard/nuevo-registro/contador/${meter.id}`}>Nueva Lectura</Link>
            </Button>
          </CardTitle>
          {meter.readings &&
            meter.readings.length > 0 &&
            meter.readings[0]['excess-consumption'] && (
              <div className="text-red-600 text-sm font-medium">⚠️ Consumo anómalo detectado</div>
            )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Holder Information */}
            {holder && (
              <div className="border-b pb-2">
                <p className="text-sm font-medium text-gray-900">Titular</p>
                <p className="text-sm text-gray-600">{holder.name}</p>
              </div>
            )}

            {/* Water Point Information */}
            {waterPoint && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-600">{waterPoint.name}</p>
                <p className="text-xs text-gray-500">{waterPoint.location}</p>
                <p className="text-xs text-gray-500">
                  Población: {waterPoint.fixedPopulation + waterPoint.floatingPopulation} personas
                </p>
              </div>
            )}

            {/* Reading Information */}
            <div>
              <p className="text-sm text-gray-600">
                {meter.readings && meter.readings.length > 0
                  ? `Último consumo: ${Number(consumption).toFixed(2)} litros en ${Number(daysDifference).toFixed(0)} días`
                  : 'Sin lecturas registradas'}
              </p>
              {meter.lastReadingDate && (
                <p className="text-xs text-gray-500">
                  {new Date(meter.lastReadingDate).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
