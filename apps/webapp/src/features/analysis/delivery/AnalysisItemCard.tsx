import { Calendar, FlaskConical } from 'lucide-react'
import Link from 'next/link'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, toTitle } from './analysis.utils'

type AnalysisItemCardProps = {
  dto: {
    id: string
    analysisType: 'chlorine' | 'turbidity' | 'hardness' | 'complete'
    analyzedAt: Date
    waterZoneId: number
    chlorine?: number
    ph?: number
    turbidity?: number
    hardnessDocAttached?: boolean
  }
  alert?: boolean
  zoneById: Map<number, string>
  variant?: 'simple' | 'detailed'
}

export default function AnalysisItemCard({
  dto,
  alert,
  zoneById,
  variant = 'detailed'
}: AnalysisItemCardProps) {
  const showDetails = variant === 'detailed'

  return (
    <Card key={dto.id} className="bg-white gap-3 py-4">
      <CardHeader>
        <Link href={`/dashboard/registros/analiticas/${dto.id}`} className="block">
          <CardTitle className="text-base">
            <h3 className="font-semibold text-lg truncate">
              {toTitle(dto.analysisType)}
              {alert && (
                <span aria-hidden="true" className="inline-flex align-middle ml-1 text-red-600">
                  ⚠️
                </span>
              )}
            </h3>
          </CardTitle>
        </Link>
        {!showDetails && (
          <CardAction>
            <span className="text-gray-400">›</span>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="pt-0 pb-2 space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Fecha reporte:</span>
          <span className="font-medium">{formatDate(dto.analyzedAt)}</span>
        </div>
        {/* <div className="text-sm text-gray-600">
          Zona: {zoneById.get(dto.waterZoneId) ?? `Zona #${dto.waterZoneId}`}
        </div> */}
        {/* Información extra solo en detailed */}
        {showDetails && (
          <div className="text-sm">
            {dto.chlorine && (
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Cloro:</span>
                  <span className="font-medium">{dto.chlorine}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FlaskConical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">pH:</span>
                  <span className="font-medium">{dto.ph}</span>
                </div>
              </div>
            )}
            {dto.turbidity && (
              <div className="flex items-center gap-2 text-sm">
                <FlaskConical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Turbidez:</span>
                <span className="font-medium">{dto.turbidity}</span>
              </div>
            )}
            {dto.analysisType === 'complete' ||
              (dto.analysisType === 'hardness' && (
                <p>Consultar los resultados de este análisis en el documento correspondiente</p>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
