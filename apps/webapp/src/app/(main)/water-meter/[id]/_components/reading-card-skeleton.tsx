'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ReadingCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Información principal */}
        <div className="flex-1 space-y-2">
          {/* Fecha con icono Calendar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" /> {/* Calendar icon */}
              <Skeleton className="h-6 w-28" /> {/* Fecha */}
            </div>
          </div>

          {/* Información con iconos Droplets */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" /> {/* Droplets icon */}
              <Skeleton className="h-4 w-20" /> {/* Label "Lectura:" */}
              <Skeleton className="h-4 w-16" /> {/* Reading value */}
            </div>
            <Skeleton className="h-4 w-1 hidden sm:inline" /> {/* Separator */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" /> {/* Droplets icon */}
              <Skeleton className="h-4 w-28" /> {/* Normalized value */}
            </div>
          </div>

          {/* Notas (opcional) */}
          <div className="flex items-start gap-2 text-sm">
            <Skeleton className="h-3 w-3 rounded mt-0.5" /> {/* FileText icon */}
            <Skeleton className="h-4 w-64" /> {/* Notes text */}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 shrink-0" /> {/* Ver foto button */}
          <Skeleton className="h-9 w-20 shrink-0" /> {/* Editar button */}
        </div>
      </div>
    </Card>
  )
}
