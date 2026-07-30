import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildMapsHref } from '@/lib/maps-link'

interface WaterPointSectionProps {
  waterPoint: {
    id: string
    name: string
    location: string
    connectionNumber?: string | null
    mapsUrl?: string | null
    fixedPopulation: number
    floatingPopulation: number
  }
  readOnly?: boolean
}

// `readOnly` stays in the props because the card passes it, but it no longer
// gates anything here: whoever reads meters in the field needs the map most.
export function WaterPointSection({ waterPoint }: WaterPointSectionProps) {
  // Fall back to `location`: it predates mapsUrl and often already holds "lat,lng".
  const mapsHref = buildMapsHref(waterPoint.mapsUrl) ?? buildMapsHref(waterPoint.location)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Punto de Agua</h3>
      <div className="space-y-1">
        {waterPoint.connectionNumber && (
          <div className="text-sm font-semibold text-blue-700">
            Nº enganche: {waterPoint.connectionNumber}
          </div>
        )}
        <div className="font-medium">{waterPoint.name}</div>
        <div className="text-sm text-gray-600">{waterPoint.location}</div>
        <div className="text-sm text-gray-500">
          {waterPoint.fixedPopulation + waterPoint.floatingPopulation} personas
        </div>
      </div>
      {mapsHref && (
        <Button variant="outline" size="sm" asChild>
          <a href={mapsHref} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-3 w-3 mr-1" />
            Ver en Google Maps
          </a>
        </Button>
      )}
    </div>
  )
}
