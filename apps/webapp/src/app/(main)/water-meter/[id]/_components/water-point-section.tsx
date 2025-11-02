import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface WaterPointSectionProps {
  waterPoint: {
    id: string
    name: string
    location: string
    fixedPopulation: number
    floatingPopulation: number
  }
}

export function WaterPointSection({ waterPoint }: WaterPointSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Punto de Agua</h3>
      <div className="space-y-1">
        <div className="font-medium">{waterPoint.name}</div>
        <div className="text-sm text-gray-600">{waterPoint.location}</div>
        <div className="text-sm text-gray-500">
          {waterPoint.fixedPopulation + waterPoint.floatingPopulation} personas
        </div>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/water-point/${waterPoint.id}`}>
          <MapPin className="h-3 w-3 mr-1" />
          Ver Punto
        </Link>
      </Button>
    </div>
  )
}
