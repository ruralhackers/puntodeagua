import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WaterMeterStatusBadge } from '../../_components/water-meter-status-badge'

interface WaterMeterHeaderProps {
  waterAccountName: string
  waterPointName: string
  lastReadingDate: Date | null
  lastReadingExcessConsumption: boolean | null
  onAddReading: () => void
}

export function WaterMeterHeader({
  waterAccountName,
  waterPointName,
  lastReadingDate,
  lastReadingExcessConsumption,
  onAddReading
}: WaterMeterHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      {/* Left side: Info */}
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{waterAccountName}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="truncate">{waterPointName}</span>
          <span>•</span>
          <WaterMeterStatusBadge
            lastReadingDate={lastReadingDate}
            lastReadingExcessConsumption={lastReadingExcessConsumption}
          />
        </div>
      </div>

      {/* Right side: Action button */}
      <Button variant="outline" size="sm" className="shrink-0 self-start" onClick={onAddReading}>
        <Plus className="h-4 w-4 mr-2" />
        Nueva Lectura
      </Button>
    </div>
  )
}
