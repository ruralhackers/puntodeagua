import type { Analysis, WaterZone } from 'features'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Link as UILink } from '@/components/ui/link'
import { Page } from '../../../core/components/page'
import AnalysisItemCard from './AnalysisItemCard'

export const AnalysesPage: FC<{ analysis: Analysis[]; zones?: WaterZone[] }> = ({
  analysis,
  zones
}) => {
  const zoneById = new Map<number, string>(
    (zones ?? []).map((z) => [Number(z.toDto().id), z.toDto().name])
  )

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
        <div className="mb-6">
          <div className="mb-4">
            <UILink
              to="/dashboard/registros"
              type="invisible"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="p-2 hover:bg-gray-100 rounded-lg">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </span>
              <span className="text-sm">Volver</span>
            </UILink>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analíticas</h1>
              <p className="text-gray-600">Análisis de calidad del agua</p>
            </div>
            <Button className="flex items-center gap-2" variant="default">
              <Link href="/dashboard/analiticas/nueva" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {analysis.map((a) => {
            const dto = a.toDto()
            const alert = hasAlert(a)
            const transformedDto = {
              ...dto,
              analysisType: dto.analysisType as 'chlorine' | 'turbidity' | 'hardness' | 'complete',
              analyzedAt: new Date(dto.analyzedAt),
              waterZoneId: Number(dto.waterZoneId),
              chlorine: dto.chlorine ? Number(dto.chlorine) : undefined,
              ph: dto.ph ? Number(dto.ph) : undefined,
              turbidity: dto.turbidity ? Number(dto.turbidity) : undefined
            }
            return (
              <AnalysisItemCard
                key={dto.id}
                dto={transformedDto}
                alert={alert}
                zoneById={zoneById}
              />
            )
          })}
        </div>
      </div>
    </Page>
  )
}

export { AnalysesPage as AnalysisPage }
