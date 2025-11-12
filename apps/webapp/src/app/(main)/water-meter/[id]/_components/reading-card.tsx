import type { WaterMeterReadingImageDto } from '@pda/water-account'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Camera, Droplets, Edit, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ReadingCardProps {
  reading: {
    id: string
    reading: string
    readingDate: Date
    normalizedReading: number
    notes?: string | null
    waterMeterReadingImage?: WaterMeterReadingImageDto | null
  }
  index: number
  onViewImage: (image: WaterMeterReadingImageDto) => void
  onEdit: (reading: {
    id: string
    reading: string
    notes: string | null
    waterMeterReadingImage?: WaterMeterReadingImageDto | null
  }) => void
  onDelete: (readingId: string) => void
}

export function ReadingCard({ reading, index, onViewImage, onEdit, onDelete }: ReadingCardProps) {
  return (
    <Card className="p-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Información principal */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-lg">
                {format(new Date(reading.readingDate), 'dd/MM/yyyy', {
                  locale: es
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              <span className="font-medium">Lectura: </span>
              <span className="font-mono">{reading.reading}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-600" />
              <span className="font-semibold text-blue-600">
                {reading.normalizedReading.toLocaleString('es-ES')} L
              </span>
            </div>
          </div>

          {reading.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <FileText className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{reading.notes}</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {/* Botón de ver foto - siempre visible si hay imagen */}
          {reading.waterMeterReadingImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (reading.waterMeterReadingImage) {
                  onViewImage(reading.waterMeterReadingImage)
                }
              }}
              className="shrink-0"
            >
              <Camera className="h-4 w-4 mr-1" />
              Ver foto
            </Button>
          )}

          {/* Botón de editar solo para las dos primeras lecturas */}
          {(index === 0 || index === 1) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onEdit({
                  id: reading.id,
                  reading: reading.reading,
                  notes: reading.notes ?? null,
                  waterMeterReadingImage: reading.waterMeterReadingImage ?? null
                })
              }
              className="shrink-0"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          )}

          {/* Botón de borrar solo para la última lectura */}
          {index === 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(reading.id)}
              className="shrink-0"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Borrar
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
