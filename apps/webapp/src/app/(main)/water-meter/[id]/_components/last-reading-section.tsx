import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface LastReadingSectionProps {
  lastReadingDate: Date | null
  lastReadingNormalizedValue: number | null
  lastReadingExcessConsumption: boolean | null
  onRecalculate: () => void
  isRecalculating: boolean
}

export function LastReadingSection({
  lastReadingDate,
  lastReadingNormalizedValue,
  lastReadingExcessConsumption,
  onRecalculate,
  isRecalculating
}: LastReadingSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Última Lectura
      </h3>
      {lastReadingDate ? (
        <div className="space-y-2">
          <div className="text-2xl font-bold text-blue-600">
            {lastReadingNormalizedValue?.toLocaleString('es-ES')} L
          </div>
          <div className="text-sm text-gray-600">
            {format(new Date(lastReadingDate), 'dd/MM/yyyy', { locale: es })}
          </div>
          {lastReadingExcessConsumption && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Exceso
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="mt-2"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRecalculating ? 'animate-spin' : ''}`} />
            Recalcular Exceso
          </Button>
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">Sin lecturas</div>
      )}
    </div>
  )
}
