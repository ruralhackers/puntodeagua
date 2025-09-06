import type { HolderDto, WaterMeterDto, WaterPointDto } from 'features'
import { Droplets, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  calculateExistingReadingsConsumption,
  getConsumptionStatusMessage,
  getConsumptionTextClasses
} from '@/src/features/water-meter-reading/hooks/use-water-meter-consumption'

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

  // Create a default water point if not provided
  const defaultWaterPoint: WaterPointDto = {
    id: '',
    communityId: '',
    name: '',
    location: '',
    fixedPopulation: 0,
    floatingPopulation: 0
  }

  // Calculate consumption between the two last readings
  const consumptionData = calculateExistingReadingsConsumption(
    meter.readings || [],
    meter,
    waterPoint || defaultWaterPoint
  )

  const handleCardClick = () => {
    router.push(onClickLink || `/dashboard/registros/contadores/${meter.id}`)
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h3 className="font-semibold text-lg truncate">
                {holder?.name} • {meter.name}
              </h3>
              {/* <p className="text-sm text-muted-foreground">
                {holder?.nationalId && `DNI: ${holder.nationalId}`}
              </p> */}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {/* {waterPoint?.location && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{waterPoint.location}</span>
                </div>
              )} */}
              {waterPoint && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {waterPoint?.fixedPopulation + waterPoint?.floatingPopulation} personas
                  </span>
                </div>
              )}
              {consumptionData && (
                <div className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 flex-shrink-0" />
                  <span>{consumptionData.differenceInLiters.toFixed(1)} litros</span>
                </div>
              )}
            </div>
            {consumptionData &&
              (consumptionData.isHighConsumption || consumptionData.isNegativeConsumption) && (
                <div
                  className={`text-sm font-medium mt-2 ${getConsumptionTextClasses(consumptionData)}`}
                >
                  {getConsumptionStatusMessage(consumptionData)}
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
