import type { Analysis, WaterZone } from 'features'
import { AlertTriangle, Calendar, CheckCircle2, MapPin, Pencil, Trash, User } from 'lucide-react'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
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
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{toTitle(dto.analysisType)}</h1>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/analysis/edit/${dto.id}`} type="invisible">
                <Pencil className="size-4" aria-hidden="true" />
                <span className="sr-only">Editar</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Trash className="size-4" aria-hidden="true" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>
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
