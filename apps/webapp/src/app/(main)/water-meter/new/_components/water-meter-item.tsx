'use client'

import type { WaterMeterDisplayDto } from '@pda/water-account/domain'
import Link from 'next/link'
import { formatLastReading } from '../../_components/format-last-reading'
import { WaterMeterStatusBadge } from '../../_components/water-meter-status-badge'

interface WaterMeterItemProps {
  waterMeter: WaterMeterDisplayDto
}

export function WaterMeterItem({ waterMeter }: WaterMeterItemProps) {
  const formatReadingValue = () => {
    if (!waterMeter.lastReadingNormalizedValue) {
      return 'Sin lectura'
    }

    return `${waterMeter.lastReadingNormalizedValue.toLocaleString('es-ES')} L`
  }

  return (
    <Link
      href={`/water-meter/${waterMeter.id}`}
      className="block w-full text-left py-4 px-4 border-b border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 hover:shadow-sm transition-all duration-200 last:border-b-0 cursor-pointer rounded-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="font-medium text-lg">{waterMeter.waterAccountName}</div>
            {waterMeter.lastReadingExcessConsumption !== null && (
              <WaterMeterStatusBadge
                lastReadingDate={waterMeter.lastReadingDate}
                lastReadingExcessConsumption={waterMeter.lastReadingExcessConsumption}
                variant="compact"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium">Punto: {waterMeter.waterPoint.name}</span>
            {waterMeter.waterPoint.connectionNumber && (
              <>
                <span>•</span>
                <span>Nº enganche: {waterMeter.waterPoint.connectionNumber}</span>
              </>
            )}
            <span>•</span>
            <span>{waterMeter.waterPoint.location}</span>
            <span>•</span>
            <span>Última lectura: {formatLastReading(waterMeter.lastReadingDate)}</span>
            {waterMeter.lastReadingNormalizedValue && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">{formatReadingValue()}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right text-sm text-muted-foreground hidden md:block">
          <div>
            Población:{' '}
            {waterMeter.waterPoint.fixedPopulation + waterMeter.waterPoint.floatingPopulation}
          </div>
          <div className="text-xs">{waterMeter.waterPoint.cadastralReference}</div>
        </div>
      </div>
    </Link>
  )
}
