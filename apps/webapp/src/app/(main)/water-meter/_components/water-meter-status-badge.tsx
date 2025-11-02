import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface WaterMeterStatusBadgeProps {
  lastReadingDate: Date | null
  lastReadingExcessConsumption: boolean | null
  variant?: 'full' | 'compact'
}

export function WaterMeterStatusBadge({
  lastReadingDate,
  lastReadingExcessConsumption,
  variant = 'full'
}: WaterMeterStatusBadgeProps) {
  if (!lastReadingDate) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
        <Clock className="h-3 w-3 mr-1" />
        Sin lectura
      </Badge>
    )
  }

  if (lastReadingExcessConsumption) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {variant === 'full' ? 'Exceso de consumo' : 'Exceso'}
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
      <CheckCircle className="h-3 w-3 mr-1" />
      {variant === 'full' ? 'Consumo normal' : 'Normal'}
    </Badge>
  )
}
