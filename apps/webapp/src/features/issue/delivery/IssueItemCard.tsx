import type { IssueSchema } from 'features'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, toTitle } from '@/src/features/analysis/delivery/analysis.utils'

type IssueItemCardProps = {
  dto: IssueSchema
  waterZoneName: string
  variant?: 'simple' | 'detailed'
}

export default function IssueItemCard({ dto, waterZoneName }: IssueItemCardProps) {
  return (
    <div>
      <Card key={dto.id} className="bg-white gap-3 py-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-base">{toTitle(dto.title)}</CardTitle>
              <CardDescription>
              <div className="flex items-center gap-2">
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
              </div>
              <div className="block mt-3">{dto.description ?? '-'}</div>
              </CardDescription>
            </div>
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
        </CardHeader>

        <CardContent className="pt-0 pb-2 space-y-1">
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
