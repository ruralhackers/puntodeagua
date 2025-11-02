import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WaterMeterDetailSkeleton() {
  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left side: Info */}
        <div className="space-y-1 min-w-0 flex-1">
          <Skeleton className="h-8 w-64" /> {/* Title */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" /> {/* Water point name */}
            <Skeleton className="h-4 w-1" /> {/* Separator */}
            <Skeleton className="h-6 w-28 rounded-full" /> {/* Status badge */}
          </div>
        </div>
        {/* Right side: Action button */}
        <Skeleton className="h-9 w-36" /> {/* Nueva Lectura button */}
      </div>

      {/* Water Meter Info Card skeleton */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" /> {/* Droplets icon */}
            <Skeleton className="h-6 w-48" /> {/* Title */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Last Reading */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" /> {/* Label */}
              <Skeleton className="h-8 w-28" /> {/* Value */}
              <Skeleton className="h-4 w-24" /> {/* Date */}
              <Skeleton className="h-9 w-36 mt-2" /> {/* Recalcular button */}
            </div>

            {/* Water Point */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" /> {/* Label */}
              <Skeleton className="h-5 w-40" /> {/* Name */}
              <Skeleton className="h-4 w-36" /> {/* Location */}
              <Skeleton className="h-4 w-24" /> {/* Population */}
              <Skeleton className="h-9 w-28 mt-2" /> {/* Ver Punto button */}
            </div>

            {/* Technical Info */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-36" /> {/* Label */}
              <Skeleton className="h-4 w-28" /> {/* Unit */}
              <Skeleton className="h-4 w-20" /> {/* Status */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readings History Card skeleton */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" /> {/* FileText icon */}
            <Skeleton className="h-6 w-48" /> {/* Title */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={`reading-skeleton-${Date.now()}-${i}`} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-32" /> {/* Date */}
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-28" /> {/* Reading */}
                      <Skeleton className="h-4 w-24" /> {/* Normalized */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" /> {/* Ver foto button */}
                    <Skeleton className="h-9 w-20" /> {/* Editar button */}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
