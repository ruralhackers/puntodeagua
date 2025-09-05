import { IssueDto, WaterZone } from 'features'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'
import { formatDate, toTitle } from '@/src/features/analysis/delivery/analysis.utils'

type IssueItemCardProps = {
  dto: IssueDto
  waterZoneName: string
  variant?: 'simple' | 'detailed'
}

export default function IssueItemCard({ dto, waterZoneName }: IssueItemCardProps) {
  return (
    <div>
      <Card key={dto.id} className="bg-white gap-3 py-4">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-base">{toTitle(dto.title)}</CardTitle>
            <CardDescription className="flex items-center gap-2 m-t-1">
              {dto.status === 'closed' ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Resuelta
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  En Proceso
                </span>
              )}
              {waterZoneName}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Descripción:</span>
            <span>{dto.description ?? '-'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Zona:</span>
            <span>{waterZoneName}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Persona que firma:</span>
            <span>{dto.reporterName}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Fecha reporte:</span>
            <span>{formatDate(dto.startAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Fecha resolución:</span>
            <span>{dto.endAt ? formatDate(dto.endAt) : '-'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
