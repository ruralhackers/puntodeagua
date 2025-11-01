'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalysisCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header con icono, titulo y badge */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" /> {/* TestTube icon */}
            <Skeleton className="h-5 w-40" /> {/* Analysis type title */}
            <Skeleton className="h-5 w-24 rounded-full" /> {/* Analyst badge */}
          </div>

          {/* Grid con 3 columnas (sm:grid-cols-3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {/* Fecha */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" /> {/* Label "Fecha" */}
              <Skeleton className="h-4 w-24" /> {/* Date value */}
            </div>

            {/* Mediciones */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label "Mediciones" */}
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" /> {/* pH value */}
                <Skeleton className="h-3 w-28" /> {/* Chlorine value */}
                <Skeleton className="h-3 w-32" /> {/* Turbidity value */}
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label "Ubicación" */}
              <Skeleton className="h-3 w-36" /> {/* Location value */}
            </div>
          </div>

          {/* Descripción (opcional) */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label "Descripción" */}
            <Skeleton className="h-3 w-full" /> {/* Description line 1 */}
            <Skeleton className="h-3 w-3/4" /> {/* Description line 2 */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

