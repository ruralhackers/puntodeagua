'use client'

import Link from 'next/link'

type WaterPointItemProps = {
  id: string
  name: string
  location?: string
  connectionNumber?: string | null
  waterAccountName?: string | null
}

export function WaterPointItem({
  id,
  name,
  location,
  connectionNumber,
  waterAccountName
}: WaterPointItemProps) {
  return (
    <Link
      href={`/fees/new/${id}`}
      className="block w-full text-left py-4 px-4 border-b border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 hover:shadow-sm transition-all duration-200 last:border-b-0 cursor-pointer rounded-lg"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-lg truncate">
            {waterAccountName || 'Sin titular'}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1">
            <span className="truncate">{name}</span>
            {connectionNumber && (
              <>
                <span>•</span>
                <span>Nº enganche: {connectionNumber}</span>
              </>
            )}
            {location && (
              <>
                <span>•</span>
                <span className="truncate">{location}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
