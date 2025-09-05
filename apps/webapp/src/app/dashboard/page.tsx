'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

const incidenciasAbiertas = [
  {
    id: 1,
    titulo: 'Fuga en tubería principal',
    ubicacion: 'Sector Norte',
    prioridad: 'Alta',
    fecha: '2024-01-15',
    tipo: 'incidencia'
  },
  {
    id: 2,
    titulo: 'Presión baja en zona residencial',
    ubicacion: 'Sector Sur',
    prioridad: 'Media',
    fecha: '2024-01-14',
    tipo: 'incidencia'
  }
]

const recordatoriosVencidos = [
  {
    id: 1,
    titulo: 'Lectura mensual de contadores',
    tipoRegistro: 'contador',
    fechaVencimiento: '2024-01-18',
    tipo: 'recordatorio',
    periodicidad: 'mensual'
  },
  {
    id: 2,
    titulo: 'Análisis de calidad del agua',
    tipoRegistro: 'analitica',
    fechaVencimiento: '2024-01-19',
    tipo: 'recordatorio',
    periodicidad: 'semanal'
  }
]

const elementosAtencion = [...incidenciasAbiertas, ...recordatoriosVencidos]

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex-1 px-3 py-4">
      {/* Botón principal */}
      <div className="mb-6">
        <Button asChild className="w-full">
          <Link
            to="/dashboard/nuevo-registro"
            className="no-underline hover:no-underline font-bold"
          >
            Nuevo registro
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Requiere Atención */}
        <div className="bg-white rounded-lg border p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Requiere Atención</h2>
            <span className="text-sm text-gray-500">{elementosAtencion.length} elementos</span>
          </div>
          <div className="space-y-2">
            {elementosAtencion.slice(0, 2).map((e) => (
              <div
                key={`${e.tipo}-${e.id}`}
                className={`p-3 ${e.tipo === 'incidencia' ? 'bg-orange-50' : 'bg-white'} border rounded-md hover:bg-gray-50 transition-colors shadow-sm`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          e.tipo === 'incidencia'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {e.tipo === 'incidencia' ? 'Incidencia' : 'Recordatorio Vencido'}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm">{e.titulo}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {e.tipo === 'incidencia'
                        ? 'ubicacion' in e
                          ? e.ubicacion
                          : ''
                        : 'fechaVencimiento' in e
                          ? `Vencía: ${e.fechaVencimiento}`
                          : ''}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <span
                    className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 ml-auto"
                    onClick={() => {
                      if (e.tipo === 'incidencia') {
                        const params = new URLSearchParams({
                          descripcion: e.titulo || '',
                          estado: 'abierta',
                          zona: 'ubicacion' in e ? e.ubicacion : '',
                          fechaApertura:
                            'fecha' in e ? (e as any).fecha : new Date().toISOString().split('T')[0]
                        })
                        router.push(`/dashboard/nuevo-registro/incidencia?${params.toString()}`)
                      } else if (e.tipo === 'recordatorio' && 'tipoRegistro' in e) {
                        const t = (e as any).tipoRegistro
                        if (t === 'contador') router.push('/dashboard/nuevo-registro/contador')
                        else if (t === 'analitica')
                          router.push('/dashboard/nuevo-registro/analitica')
                        else if (t === 'mantenimiento')
                          router.push('/dashboard/nuevo-registro/mantenimiento')
                      }
                    }}
                  >
                    {e.tipo === 'incidencia' ? 'Ver Incidencia' : 'Añadir Registro'}
                  </span>
                </div>
              </div>
            ))}
            {elementosAtencion.length > 2 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                {elementosAtencion.length - 2} elementos más requieren atención
              </div>
            )}
          </div>
          <a
            href="/dashboard/atencion"
            className="block w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium text-center"
          >
            Ver todos los elementos
          </a>
        </div>
      </div>

      {/* <TaskList /> // ...existing code... (opcional, retirado en la unificación) */}
    </main>
  )
}
