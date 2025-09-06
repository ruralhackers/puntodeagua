'use client'
import type { AnalysisDto, WaterZoneDto } from 'features'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FlaskConical,
  MapPin,
  Pencil,
  Trash,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
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
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          aria-label="Volver"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            aria-hidden="true"
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
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{toTitle(dto.analysisType)}</h1>
          <p className="text-gray-600">Detalles del análisis</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fecha del Análisis
                </div>
                <p className="text-gray-900 mt-1">{formatDate(new Date(dto.analyzedAt))}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Realizada por
                </div>
                <p className="text-gray-900 mt-1">{dto.analyst || '—'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Zona de medición
                </div>
                <p className="text-gray-900 mt-1">{zoneName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parámetros */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            Parámetros
          </h2>
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
        {dto.description && dto.description.trim().length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{dto.description}</p>
          </div>
        )}

        {/* Archivos adjuntos */}
        {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Archivos adjuntos</h2>
          <div className="text-sm text-gray-500 italic">Sin archivos adjuntos</div>
        </div> */}

        {/* Acciones */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
          <div className="flex gap-3">
            <Link href={`/dashboard/registros/analiticas/${dto.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Editar Análisis
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={handleDelete}
            >
              <Trash className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
