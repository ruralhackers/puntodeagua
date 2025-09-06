import type { IssueSchema } from 'features'
import {Calendar, Edit, MapPin} from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate, toTitle } from '@/src/features/analysis/delivery/analysis.utils'

type IssueItemCardProps = {
  dto: IssueSchema
  waterZoneName: string
  variant?: 'simple' | 'detailed'
}

export const IssueItemCard: FC<IssueItemCardProps> = ({ dto, waterZoneName, variant }) => {
  const showDetails = variant === 'detailed'

  const now = new Date()
  const diffInMs = now.getTime() - new Date(dto.startAt).getTime()
  const daysSinceIssueOpened = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  return (
    <div>
      <Card key={dto.id} className="bg-white gap-3 py-4">
        <CardHeader>
          {showDetails && (
            <div className="flex justify-between items-center gap-2">
              {dto?.status === 'closed' ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Resuelta
                  </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    En Proceso
                  </span>
              )}

              <Link href={`/dashboard/registros/incidencias/${dto.id}/editar`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap hover:cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          )}

          <h3 className="font-semibold text-lg truncate">
            {toTitle(dto?.title ?? '')}
          </h3>
        </CardHeader>

        <CardContent className="pt-0 pb-2 space-y-1">
          {!dto.endAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Fecha reporte:</span>
              <span>{formatDate(dto.startAt)}</span>
              {showDetails && (
                <span className="flex items-center gap-2">
                  <span>&middot;</span>
                  <span className="font-medium text-red-600">{daysSinceIssueOpened} días</span>
                </span>
              )}
            </div>
          )}

          {(showDetails || dto.endAt) && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Fecha resolución:</span>
              <span>{dto.endAt ? formatDate(dto.endAt) : '-'}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Zona:</span>
            <span className="font-medium">{waterZoneName}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
