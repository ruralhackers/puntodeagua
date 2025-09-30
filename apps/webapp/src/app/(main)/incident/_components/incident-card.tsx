'use client'

import type { IncidentDto } from '@pda/registers/domain/entities/incident.dto'
import { Calendar, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IncidentCardProps {
  incident: IncidentDto
}

export default function IncidentCard({ incident }: IncidentCardProps) {
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
    if (incident.waterPointId) return 'Punto de Agua'
    if (incident.waterDepositId) return 'Depósito de Agua'
    if (incident.waterZoneId) return 'Zona de Agua'
    return 'Comunidad'
  }

  return (
    <Link href={`/incident/${incident.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{incident.title}</CardTitle>
            <Badge variant={getStatusVariant(incident.status)} className="ml-2">
              {incident.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>{incident.reporterName}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Iniciado: {formatDate(incident.startAt)}</span>
            {incident.endAt && (
              <span className="ml-4">Finalizado: {formatDate(incident.endAt)}</span>
            )}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{getLocationText()}</span>
          </div>

          {incident.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
