'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function WaterMeterListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, index) => `skeleton-${index}`).map((id) => (
        <button
          key={id}
          type="button"
          className="block w-full text-left py-4 px-4 border-b border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 hover:shadow-sm transition-all duration-200 last:border-b-0 cursor-pointer rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Nombre del medidor y badge de estado */}
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-[28px] w-48" /> {/* Nombre (font-medium text-lg) */}
                <Skeleton className="h-[20px] w-16 rounded-sm" /> {/* Badge (text-xs) */}
              </div>

              {/* Información con separadores • */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Skeleton className="h-4 w-36" /> {/* Punto: [nombre] */}
                <span className="text-muted-foreground">•</span>
                <Skeleton className="h-4 w-28" /> {/* Ubicación */}
                <span className="text-muted-foreground">•</span>
                <Skeleton className="h-4 w-40" /> {/* Última lectura: ... */}
                <span className="hidden md:inline text-muted-foreground">•</span>
                <Skeleton className="h-4 w-24 hidden md:inline" /> {/* 1,234 L */}
              </div>
            </div>

            {/* Información de población - solo visible en md+ */}
            <div className="text-right text-sm text-muted-foreground hidden md:block">
              <Skeleton className="h-4 w-28 ml-auto" /> {/* Población: 12 */}
              <Skeleton className="h-3 w-24 ml-auto mt-1" /> {/* Referencia catastral */}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
