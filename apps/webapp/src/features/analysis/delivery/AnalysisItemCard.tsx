import Link from 'next/link'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
            {toTitle(dto.analysisType)}
            {alert && (
              <span aria-hidden="true" className="inline-flex align-middle ml-1 text-red-600">
                ⚠️
              </span>
            )}
          </CardTitle>
          <CardDescription>{formatDate(dto.analyzedAt)}</CardDescription>
          {!showDetails && (
            <CardAction>
              <span className="text-gray-400">›</span>
            </CardAction>
          )}
        </Link>
      </CardHeader>

      <CardContent className="pt-0 pb-2 space-y-1">
        {/* <div className="text-sm text-gray-600">
          Zona: {zoneById.get(dto.waterZoneId) ?? `Zona #${dto.waterZoneId}`}
        </div> */}
        {/* Información extra solo en detailed */}
        {showDetails && (
          <div className="text-sm text-gray-600 mt-1">
            {dto.chlorine && (
              <p>
                Cloro: {dto.chlorine} - Ph {dto.ph}{' '}
              </p>
            )}
            {dto.turbidity && <p>Turbidez: {dto.turbidity}</p>}
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
