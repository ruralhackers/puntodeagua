import type { IssueSchema } from 'features'
import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
    <Link href={`/dashboard/registros/incidencias/${dto.id}`} className="block">
      <Card key={dto.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="font-semibold text-lg truncate">
                  {toTitle(dto?.title ?? '')}
                  {dto?.status === 'closed' ? (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Resuelta
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      En Proceso
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Reporte: {formatDate(new Date(dto.startAt))}</span>
                </div>
                {showDetails && dto.endAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Resolución: {formatDate(new Date(dto.endAt))}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Zona: {waterZoneName}</span>
                </div>
              </div>
              {showDetails && !dto.endAt && (
                <div className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium text-red-600">
                    {daysSinceIssueOpened} días abierta
                  </span>
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
