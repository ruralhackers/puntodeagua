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

// interface AnalysisItemCardProps = {
//     dto:
//     alert:
//     zoneById:
// }

export default function AnalysisItemCard({ dto, alert, zoneById }) {
  return (
    <Card key={dto.id} className="bg-white gap-3 py-4">
      <CardHeader>
        <Link href={`/dashboard/registros/analiticas/${dto.id}`} className="block">
          <CardTitle className="text-base">
            {toTitle(dto.analysisType)}{' '}
            {alert && (
              <span aria-hidden="true" className="inline-flex align-middle ml-1 text-red-600">
                ⚠️
              </span>
            )}
          </CardTitle>
          <CardDescription>{formatDate(dto.analyzedAt)}</CardDescription>
          <CardAction>
            <span className="text-gray-400">›</span>
          </CardAction>
        </Link>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="text-sm text-gray-600">
          {zoneById.get(dto.waterZoneId) ?? `Zona #${dto.waterZoneId}`}
        </div>
      </CardContent>
    </Card>
  )
}
