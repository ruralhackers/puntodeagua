import { Calendar, FlaskConical } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
  variant = 'detailed'
}: AnalysisItemCardProps) {
  const showDetails = variant === 'detailed'

  return (
    <Link href={`/dashboard/registros/analiticas/${dto.id}`} className="block">
      <Card key={dto.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="font-semibold text-lg truncate">
                  {toTitle(dto.analysisType)}
                  {alert && (
                    <span aria-hidden="true" className="inline-flex align-middle ml-1 text-red-600">
                      ⚠️
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Fecha reporte: {formatDate(dto.analyzedAt)}</span>
                </div>
                {showDetails && dto.chlorine && (
                  <div className="flex items-center gap-1">
                    <FlaskConical className="h-4 w-4 flex-shrink-0" />
                    <span>Cloro: {dto.chlorine}</span>
                  </div>
                )}
                {showDetails && dto.ph && (
                  <div className="flex items-center gap-1">
                    <FlaskConical className="h-4 w-4 flex-shrink-0" />
                    <span>pH: {dto.ph}</span>
                  </div>
                )}
                {showDetails && dto.turbidity && (
                  <div className="flex items-center gap-1">
                    <FlaskConical className="h-4 w-4 flex-shrink-0" />
                    <span>Turbidez: {dto.turbidity}</span>
                  </div>
                )}
              </div>
              {showDetails &&
                (dto.analysisType === 'complete' || dto.analysisType === 'hardness') && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Consultar los resultados de este análisis en el documento correspondiente
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
