import { Calendar, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '../../analysis/delivery/analysis.utils'

type MaintenanceItemCardProps = {
  dto: {
    id: string
    name: string
    scheduledDate?: Date
    executionDate?: Date
    responsible?: string
    duration?: number
    description?: string
    observations?: string
    nextMaintenanceDate?: Date
  }
  status?: { label: string; classes: string }
  type?: { label: string; classes: string }
  variant?: 'simple' | 'detailed'
}

export default function MaintenanceItemCard({
  dto,
  status,
  type,
  variant = 'detailed'
}: MaintenanceItemCardProps) {
  const showDetails = variant === 'detailed'

  return (
    <Link href={`/dashboard/registros/mantenimiento/${dto.id}`} className="block">
      <Card key={dto.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="font-semibold text-lg truncate">
                  {dto.name}
                  {status && (
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${status.classes}`}
                    >
                      {status.label}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Programado: {dto.scheduledDate ? formatDate(dto.scheduledDate) : '—'}</span>
                </div>
                {showDetails && dto.executionDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Ejecutado: {formatDate(dto.executionDate)}</span>
                  </div>
                )}
                {showDetails && dto.responsible && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>Responsable: {dto.responsible}</span>
                  </div>
                )}
                {showDetails && dto.duration && (
                  <div className="flex items-center gap-1">
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span>Duración: {dto.duration}h</span>
                  </div>
                )}
              </div>
              {showDetails && type && (
                <div className="text-sm text-muted-foreground mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.classes}`}>
                    {type.label}
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
