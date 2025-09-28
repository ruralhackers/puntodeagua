'use client'

import type { IssueDto } from '@pda/registers/domain/entities/issue.dto'
import { Calendar, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IssueCardProps {
  issue: IssueDto
}

export default function IssueCard({ issue }: IssueCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive'
      case 'closed':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLocationText = () => {
    if (issue.waterPointId) return 'Punto de Agua'
    if (issue.waterDepositId) return 'Depósito de Agua'
    if (issue.waterZoneId) return 'Zona de Agua'
    return 'Comunidad'
  }

  return (
    <Link href={`/issues/${issue.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
            <Badge variant={getStatusVariant(issue.status)} className="ml-2">
              {issue.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>{issue.reporterName}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Iniciado: {formatDate(issue.startAt)}</span>
            {issue.endAt && <span className="ml-4">Finalizado: {formatDate(issue.endAt)}</span>}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{getLocationText()}</span>
          </div>

          {issue.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
