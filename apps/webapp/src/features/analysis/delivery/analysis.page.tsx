'use client'
import type { AnalysisDto, WaterZoneDto } from 'features'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  EllipsisVertical,
  MapPin,
  Pencil,
  Trash,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { Page } from '../../../core/components/page'
import { useUseCase } from '../../../core/use-cases/use-use-case'
import { DeleteAnalysisCmd } from '../application/delete-analysis.cmd'
import { formatDate, toTitle } from './analysis.utils'

export const AnalysisDetailPage: FC<{ analysis: AnalysisDto; zones?: WaterZoneDto[] }> = ({
  analysis,
  zones
}) => {
  const router = useRouter()
  const deleteAnalysisCommand = useUseCase(DeleteAnalysisCmd)

  const dto = analysis
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.id, z.name]))

  const zoneName = zoneById.get(dto.waterZoneId) ?? `Zona #${dto.waterZoneId}`

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este análisis?')) {
      await deleteAnalysisCommand.execute(dto.id)
      router.push(`/dashboard/registros/analiticas`)
    }
  }

  return (
    <Page>
      <div className="px-3 py-4">
        {/* Header */}
        <PageHeader title="Análisis" subtitle="Registros de análisis de calidad del agua" />

        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{toTitle(dto.analysisType)}</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" aria-label="Acciones">
                <EllipsisVertical className="size-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1">
              <div className="flex flex-col">
                <Link
                  to={`/dashboard/registros/analiticas/${dto.id}/edit`}
                  type="invisible"
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent hover:text-accent-foreground"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  <span>Editar</span>
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-red-600 disabled:opacity-60 text-left"
                >
                  <Trash className="size-4" aria-hidden="true" />
                  <span>Eliminar</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-6">
          {/* Información principal */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="size-4 text-gray-400" aria-hidden="true" />
                  Fecha
                </div>
                <div className="text-base text-gray-900">{formatDate(dto.analyzedAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="size-4 text-gray-400" aria-hidden="true" />
                  Zona de medición
                </div>
                <div className="text-base text-gray-900">{zoneName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <User className="size-4 text-gray-400" aria-hidden="true" />
                  Realizada por
                </div>
                <div className="text-base text-gray-900">{dto.analyst || '—'}</div>
              </div>
            </div>
          </div>

          {/* Parámetros */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="mb-3">
              <h2 className="text-sm font-medium text-gray-900">Parámetros</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {dto.chlorine !== undefined && dto.chlorine !== '' && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Cloro</div>
                      <div className="text-lg font-semibold text-gray-900">{dto.chlorine} mg/L</div>
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${Number(dto.chlorine) >= 0.3 && Number(dto.chlorine) <= 2 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {Number(dto.chlorine) >= 0.3 && Number(dto.chlorine) <= 2 ? (
                        <>
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          <span>Dentro de parámetros</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-4" aria-hidden="true" />
                          <span>Fuera de parámetros</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {dto.ph !== undefined && dto.ph !== '' && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">pH</div>
                      <div className="text-lg font-semibold text-gray-900">{dto.ph}</div>
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${Number(dto.ph) >= 6.5 && Number(dto.ph) <= 8.5 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {Number(dto.ph) >= 6.5 && Number(dto.ph) <= 8.5 ? (
                        <>
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          <span>Dentro de parámetros</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-4" aria-hidden="true" />
                          <span>Fuera de parámetros</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {dto.turbidity !== undefined && dto.turbidity !== '' && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Turbidez</div>
                      <div className="text-lg font-semibold text-gray-900">{dto.turbidity} NTU</div>
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${Number(dto.turbidity) <= 4 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {Number(dto.turbidity) <= 4 ? (
                        <>
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          <span>Dentro de parámetros</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-4" aria-hidden="true" />
                          <span>Fuera de parámetros</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="mb-2">
              <h2 className="text-sm font-medium text-gray-900">Observaciones</h2>
            </div>
            {dto.description && dto.description.trim().length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-sm text-gray-700 whitespace-pre-line">{dto.description}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Sin observaciones</div>
            )}
          </div>

          {/* Archivos adjuntos */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="mb-2">
              <h2 className="text-sm font-medium text-gray-900">Archivos adjuntos</h2>
            </div>
            <div className="text-sm text-gray-500 italic">Sin archivos adjuntos</div>
          </div>
        </div>
      </div>
    </Page>
  )
}
