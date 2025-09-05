import { Button } from '@/components/ui/button'

export default function IssueItemCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* <div className="text-red-600 mt-1">
                  {getTipoIcon(item.tipo)}
                </div> */}
          <div className="flex-1">
            <div className="mb-2">
              <div className="flex gap-2 mb-2">
                {/* <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}
                >
                  {item.estado}
                </span> */}
                {/* <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(item.prioridad)}`}
                >
                  {item.prioridad}
                </span> */}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fuga en tubería principal</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Punto de agua:</span>
                <span>Red Distribución Este</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Ubicación:</span>
                <span>Calle Principal 3</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Fecha reporte:</span>
                <span>2024-06-10</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Fecha resolución:</span>
                <span>2024-06-12</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Reportado por:</span>
                <span>Carlos Rodríguez (+58 412-1234567)</span>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Descripción:</span> Fuga importante en la tubería
              principal que afecta el suministro
            </div>

            {/* {item.solucion && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Solución:</span> Reparación de tubería y reemplazo de
                sección dañada
              </div>
            )} */}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 ml-4">
          <Button>Editar</Button>
          <Button>Borrar</Button>
        </div>
      </div>
    </div>
  )
}
