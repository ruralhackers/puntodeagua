'use client'

import type { MaintenanceSchema, WaterZoneDto } from 'features'
import { Calendar, Clock, Edit3, FileText, MapPin, Trash2, User } from 'lucide-react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type DetailMaintenancePageProps = {
  maintenance: MaintenanceSchema
  waterZone: WaterZoneDto
}

function formatDate(date?: Date) {
  try {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })
  } catch {
    return '—'
  }
}

function getStatus(
  executionDate?: Date,
  scheduledDate?: Date
): {
  label: string
  classes: string
} {
  if (executionDate) {
    return { label: 'Completado', classes: 'bg-green-100 text-green-800' }
  }
  if (scheduledDate && new Date(scheduledDate) > new Date()) {
    return { label: 'Programado', classes: 'bg-yellow-100 text-yellow-800' }
  }
  return { label: 'Pendiente', classes: 'bg-gray-100 text-gray-800' }
}

export const DetailMaintenancePage: NextPage<DetailMaintenancePageProps> = ({
  maintenance,
  waterZone
}) => {
  const router = useRouter()
  const status = getStatus(maintenance.executionDate, maintenance.scheduledDate)

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
          <h1 className="text-2xl font-bold text-gray-900">{maintenance.name}</h1>
          <p className="text-gray-600">Detalles del mantenimiento</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.classes}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Objeto del Mantenimiento</div>
                <p className="text-gray-900 mt-1">{maintenance.name}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fecha Programada
                </div>
                <p className="text-gray-900 mt-1">{formatDate(maintenance.scheduledDate)}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Responsable
                </div>
                <p className="text-gray-900 mt-1">{maintenance.responsible}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Zona de Agua
                </div>
                <p className="text-gray-900 mt-1">{waterZone.name}</p>
              </div>
              {maintenance.executionDate && (
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Fecha de Ejecución
                  </div>
                  <p className="text-gray-900 mt-1">{formatDate(maintenance.executionDate)}</p>
                </div>
              )}
              {maintenance.duration && (
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duración
                  </div>
                  <p className="text-gray-900 mt-1">{maintenance.duration} horas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {maintenance.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">{maintenance.description}</p>
          </div>
        )}

        {/* Observaciones */}
        {maintenance.observations && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
            <p className="text-gray-700 leading-relaxed">{maintenance.observations}</p>
          </div>
        )}

        {/* Próximo Mantenimiento */}
        {maintenance.nextMaintenanceDate && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximo Mantenimiento</h2>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900">{formatDate(maintenance.nextMaintenanceDate)}</span>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
          <div className="flex gap-3">
            <Link href={`/dashboard/registros/mantenimiento/${maintenance.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editar Mantenimiento
              </Button>
            </Link>
            <Button variant="destructive" className="flex items-center gap-2" disabled>
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
