import type { Analysis, WaterZone } from 'features'
import type { FC } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Page } from '../../../core/components/page'
import { formatDate, toTitle } from './analysis.utils'

export const AnalysisDetailPage: FC<{ analysis: Analysis; zones?: WaterZone[] }> = ({
  analysis,
  zones
}) => {
  const dto = analysis.toDto()
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.toDto().id, z.toDto().name]))

  const zoneName = zoneById.get(dto.waterZoneId) ?? `Zona #${dto.waterZoneId}`

  return (
    <Page>
      <div className="px-3 py-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl">{toTitle(dto.analysisType)}</CardTitle>
            <CardDescription>{formatDate(dto.analyzedAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Zona</div>
              <div className="text-base text-gray-900">{zoneName}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {dto.ph !== undefined && dto.ph !== '' && (
                <div>
                  <div className="text-sm text-gray-500">pH</div>
                  <div className="text-base text-gray-900">{dto.ph}</div>
                </div>
              )}
              {dto.chlorine !== undefined && dto.chlorine !== '' && (
                <div>
                  <div className="text-sm text-gray-500">Cloro</div>
                  <div className="text-base text-gray-900">{dto.chlorine}</div>
                </div>
              )}
              {dto.turbidity !== undefined && dto.turbidity !== '' && (
                <div>
                  <div className="text-sm text-gray-500">Turbidez</div>
                  <div className="text-base text-gray-900">{dto.turbidity}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Analista</div>
                <div className="text-base text-gray-900">{dto.analyst}</div>
              </div>
            </div>

            {dto.description && dto.description.trim().length > 0 && (
              <div>
                <div className="text-sm text-gray-500">Descripción</div>
                <div className="text-base text-gray-900 whitespace-pre-line">{dto.description}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-gray-500">Identificador</div>
              <div className="text-xs text-gray-600">{dto.id}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
