import type { WaterMeterReadingImageDto } from '@pda/water-account'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReadingCard } from './reading-card'
import { ReadingCardSkeleton } from './reading-card-skeleton'

interface ReadingsHistoryCardProps {
  readings:
    | {
        id: string
        reading: string
        readingDate: Date
        normalizedReading: number
        notes?: string | null
        waterMeterReadingImage?: WaterMeterReadingImageDto | null
      }[]
    | undefined
  isLoading: boolean
  error: unknown
  onViewImage: (image: WaterMeterReadingImageDto) => void
  onEdit: (reading: {
    id: string
    reading: string
    notes: string | null
    waterMeterReadingImage?: WaterMeterReadingImageDto | null
  }) => void
}

export function ReadingsHistoryCard({
  readings,
  isLoading,
  error,
  onViewImage,
  onEdit
}: ReadingsHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Historial de Lecturas ({readings?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReadingCardSkeleton key={`reading-skeleton-loading-${Date.now()}-${i}`} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-4">
            <p>Error al cargar las lecturas: {String(error)}</p>
          </div>
        ) : !readings || readings.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin lecturas registradas</h3>
            <p className="text-gray-500">Este contador aún no tiene lecturas en su historial.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {readings.map((reading, index) => (
              <ReadingCard
                key={reading.id}
                reading={reading}
                index={index}
                onViewImage={onViewImage}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
