import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WaterMeterStatusBadge } from '../../_components/water-meter-status-badge'

interface WaterMeterHeaderProps {
  waterAccountName: string
  waterPointName: string
  lastReadingDate: Date | null
  lastReadingExcessConsumption: boolean | null
  onAddReading: () => void
  readOnly?: boolean
}

export function WaterMeterHeader({
  waterAccountName,
  waterPointName,
  lastReadingDate,
  lastReadingExcessConsumption,
  onAddReading,
  readOnly = false
}: WaterMeterHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {readOnly && (
        <Button variant="ghost" size="sm" className="self-start -ml-2" asChild>
          <Link href="/water-meter/new">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a lecturas
          </Link>
        </Button>
      )}

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
    </div>
  )
}
