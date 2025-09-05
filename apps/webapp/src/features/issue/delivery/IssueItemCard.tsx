import {IssueDto, WaterZone} from "features";
import { Button } from '@/components/ui/button'
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {formatDate, toTitle} from "@/src/features/analysis/delivery/analysis.utils";

type IssueItemCardProps = {
  dto: IssueDto,
  waterZoneName: string,
  variant?: 'simple' | 'detailed'
}

export default function IssueItemCard({ dto, waterZoneName }: IssueItemCardProps) {
  return (
    <div>
      <Card key={dto.id} className="bg-white gap-3 py-4">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-base">
              {toTitle(dto.title)}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 m-t-1">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Resuelta</span>
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-1">
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{dto.title}</h3>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Zona:</span>
                  <span>{waterZoneName}</span>
                </div>


                <div className="flex items-center gap-2">
                  <span className="font-medium">Reportado por:</span>
                  <span>Carlos Rodríguez (+58 412-1234567)</span>
                </div>

                {/* Fecha de resolución visible en ambas versiones */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Fecha resolución:</span>
                  <span>2024-06-12</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Descripción:</span> Fuga importante en la tubería
                principal que afecta el suministro
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">Solución:</span> Reparación de tubería y reemplazo de
                sección dañada
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button>Editar</Button>
            <Button>Borrar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
