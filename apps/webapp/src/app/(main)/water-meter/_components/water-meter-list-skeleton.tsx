'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function WaterMeterListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, index) => `skeleton-${index}`).map((id) => (
        <div
          key={id}
          className="block py-4 px-4 border-b border-gray-200 last:border-b-0 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
