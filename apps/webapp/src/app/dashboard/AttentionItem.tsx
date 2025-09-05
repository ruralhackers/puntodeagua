'use client'

import { useRouter } from 'next/navigation'

interface AttentionItemProps {
  item: {
    id: string | number
    titulo: string
    ubicacion?: string
    fecha?: string
    tipo: 'incidencia' | 'recordatorio'
    tipoRegistro?: string
    fechaVencimiento?: string
  }
}

export function AttentionItem({ item: e }: AttentionItemProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/dashboard/registros/incidencias/${e.id}/editar`)
  }

  return (
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
              ? e.ubicacion || ''
              : e.fechaVencimiento
                ? `Vencía: ${e.fechaVencimiento}`
                : ''}
          </p>
        </div>
      </div>
      <div className="flex">
        <span
          className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 ml-auto"
          onClick={handleClick}
        >
          Ver Incidencia
        </span>
      </div>
    </div>
  )
}
