import { DateTime } from 'core/date-time/date-time'
import type { Analysis, WaterZone } from 'features'
import type { FC } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Page } from '../../../core/components/page'

export const AnalysisPage: FC<{ analysis: Analysis[]; zones?: WaterZone[] }> = ({
  analysis,
  zones
}) => {
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.toDto().id, z.toDto().name]))

  function formatDate(date: Date) {
    try {
      return DateTime.fromDate(date).format("d 'de' LLLL 'de' yyyy", { locale: 'es' })
    } catch {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      })
    }
  }

  function toTitle(analysisType: string) {
    if (analysisType === 'chlorine_ph') return 'Cloro/pH'
    if (analysisType === 'turbidity') return 'Turbidez'
    if (analysisType === 'hardness') return 'Dureza'
    if (analysisType === 'complete') return 'Completo'
    return analysisType
  }

  function hasAlert(a: Analysis) {
    const dto = a.toDto()
    const ph = dto.ph ? Number(dto.ph) : undefined
    const chlorine = dto.chlorine ? Number(dto.chlorine) : undefined
    const alerts: boolean[] = []
    if (ph !== undefined) alerts.push(ph < 6.5 || ph > 8.5)
    if (chlorine !== undefined) alerts.push(chlorine < 0.2 || chlorine > 0.5)
    return alerts.some(Boolean)
  }

  return (
    <Page>
      <div className="px-3 py-4">
        <div className="flex flex-col gap-3">
          {analysis.map((a) => {
            const dto = a.toDto()
            const alert = hasAlert(a)
            return (
              <Card key={dto.id} className="bg-white">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">
                    {toTitle(dto.analysisType)}{' '}
                    {alert && (
                      <span
                        aria-hidden="true"
                        className="inline-flex align-middle ml-1 text-red-600"
                      >
                        ⚠️
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{formatDate(dto.analyzedAt)}</CardDescription>
                  <CardAction>
                    <span className="text-gray-400">›</span>
                  </CardAction>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="text-sm text-gray-600">
                    {zoneById.get(dto.waterZoneId) ?? `Zona #${dto.waterZoneId}`}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </Page>
  )
}
