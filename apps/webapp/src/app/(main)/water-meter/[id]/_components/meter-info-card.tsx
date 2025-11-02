import { Droplets } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LastReadingSection } from './last-reading-section'
import { MeterImageSection } from './meter-image-section'
import { TechnicalInfoSection } from './technical-info-section'
import { WaterPointSection } from './water-point-section'

interface MeterInfoCardProps {
  lastReadingDate: Date | null
  lastReadingNormalizedValue: number | null
  lastReadingExcessConsumption: boolean | null
  waterPoint: {
    id: string
    name: string
    location: string
    fixedPopulation: number
    floatingPopulation: number
  }
  measurementUnit: string
  isActive: boolean
  waterMeterImage:
    | {
        url: string
        fileName: string
        fileSize: number
        uploadedAt: Date
      }
    | null
    | undefined
  onRecalculate: () => void
  isRecalculating: boolean
  onViewImage: () => void
  onEditImage: () => void
}

export function MeterInfoCard({
  lastReadingDate,
  lastReadingNormalizedValue,
  lastReadingExcessConsumption,
  waterPoint,
  measurementUnit,
  isActive,
  waterMeterImage,
  onRecalculate,
  isRecalculating,
  onViewImage,
  onEditImage
}: MeterInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-600" />
          Información del Contador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LastReadingSection
            lastReadingDate={lastReadingDate}
            lastReadingNormalizedValue={lastReadingNormalizedValue}
            lastReadingExcessConsumption={lastReadingExcessConsumption}
            onRecalculate={onRecalculate}
            isRecalculating={isRecalculating}
          />
          <WaterPointSection waterPoint={waterPoint} />
          <TechnicalInfoSection measurementUnit={measurementUnit} isActive={isActive} />
          <MeterImageSection
            waterMeterImage={waterMeterImage}
            onViewImage={onViewImage}
            onEditImage={onEditImage}
          />
        </div>
      </CardContent>
    </Card>
  )
}
