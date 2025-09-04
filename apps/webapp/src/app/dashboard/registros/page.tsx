'use client'

import { Link } from '@/components/ui/link'

export default function RegistrosPage() {
  const categorias = [
    {
      id: 'contadores',
      titulo: 'Contadores',
      descripcion: 'Gestión de contadores, lecturas y consumos por zonas',
      icono: (
        <svg
          aria-hidden="true"
          focusable="false"
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      color: 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm',
      iconColor: 'text-purple-600',
      count: 100
    },
    {
      id: 'analiticas',
      titulo: 'Analíticas',
      descripcion: 'Registros de análisis de calidad del agua y parámetros',
      icono: (
        <svg
          aria-hidden="true"
          focusable="false"
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm',
      iconColor: 'text-green-600',
      count: 28
    },
    {
      id: 'incidencias',
      titulo: 'Incidencias',
      descripcion: 'Historial de incidencias reportadas y su resolución',
      icono: (
        <svg
          aria-hidden="true"
          focusable="false"
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      color: 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm',
      iconColor: 'text-red-600',
      count: 15
    },
    {
      id: 'mantenimiento',
      titulo: 'Mantenimiento',
      descripcion: 'Registros de mantenimiento preventivo y correctivo',
      icono: (
        <svg
          aria-hidden="true"
          focusable="false"
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      color: 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm',
      iconColor: 'text-orange-600',
      count: 22
    }
  ]

  const toHref = (categoriaId: string) => `/dashboard/registros/${categoriaId}`

  return (
    <div className="px-3 py-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Registros</h1>
        <p className="text-gray-600">Visualiza y gestiona todos los registros del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categorias.map((categoria) => (
          <Link
            key={categoria.id}
            to={toHref(categoria.id)}
            type="invisible"
            className={`block p-6 border-2 rounded-lg transition-all ${categoria.color}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`${categoria.iconColor}`}>{categoria.icono}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{categoria.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-3">{categoria.descripcion}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {categoria.count} registros
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
