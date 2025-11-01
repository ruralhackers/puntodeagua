'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WaterMeterCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Información principal */}
        <div className="flex-1 space-y-2">
          {/* Nombre y Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <Skeleton className="h-7 w-48" /> {/* Nombre del medidor */}
            <Skeleton className="h-6 w-24 rounded-full" /> {/* Badge de estado */}
          </div>

          {/* Información con iconos (MapPin, Droplets) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" /> {/* Icono MapPin */}
              <Skeleton className="h-4 w-32" /> {/* Nombre del punto */}
              {/* Consumo en Litros */}
              <span className="sm:inline hidden">
                <Skeleton className="h-4 w-1 mx-2" /> {/* Separador */}
              </span>
              <Skeleton className="h-3 w-3 rounded hidden sm:inline" /> {/* Icono Droplets */}
              <Skeleton className="h-4 w-24 hidden sm:inline" /> {/* Valor en L */}
            </div>
          </div>

          {/* Última lectura con Clock icon */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" /> {/* Icono Clock */}
              <Skeleton className="h-4 w-40" /> {/* Última lectura: ... */}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Skeleton className="h-9 w-32" /> {/* Botón "Ver detalle" */}
        </div>
      </div>
    </Card>
  )
}
