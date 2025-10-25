'use client'

import type { WaterMeterDisplayDto } from '@pda/water-account/domain'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AddReadingModal } from './add-reading-modal'

interface WaterMeterItemProps {
  waterMeter: WaterMeterDisplayDto
}

export function WaterMeterItem({ waterMeter }: WaterMeterItemProps) {
  const [showAddReadingModal, setShowAddReadingModal] = useState(false)

  const formatLastReading = () => {
    if (!waterMeter.lastReadingDate) {
      return 'Sin lecturas'
    }

    const daysAgo = Math.floor(
      (Date.now() - new Date(waterMeter.lastReadingDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysAgo === 0) {
      return 'Hoy'
    } else if (daysAgo === 1) {
      return 'Ayer'
    } else {
      return `Hace ${daysAgo} días`
    }
  }

  const formatReadingValue = () => {
    if (!waterMeter.lastReadingNormalizedValue) {
      return 'Sin lectura'
    }

    return `${waterMeter.lastReadingNormalizedValue.toLocaleString('es-ES')} L`
  }

  const getExcessBadge = () => {
    if (waterMeter.lastReadingExcessConsumption === null) {
      return null
    }

    return waterMeter.lastReadingExcessConsumption ? (
      <Badge variant="destructive" className="text-xs">
        Exceso
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">
        Normal
      </Badge>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowAddReadingModal(true)}
        onKeyDown={(e) => e.key === 'Enter' && setShowAddReadingModal(true)}
        className="block w-full text-left py-4 px-4 border-b border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 hover:shadow-sm transition-all duration-200 last:border-b-0 cursor-pointer rounded-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="font-medium text-lg">{waterMeter.waterAccountName}</div>
              {getExcessBadge()}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">Punto: {waterMeter.waterPoint.name}</span>
              <span>•</span>
              <span>{waterMeter.waterPoint.location}</span>
              <span>•</span>
              <span>Última lectura: {formatLastReading()}</span>
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
      </button>

      {showAddReadingModal && (
        <AddReadingModal
          waterMeterId={waterMeter.id}
          waterPointName={waterMeter.waterAccountName}
          measurementUnit={waterMeter.measurementUnit}
          lastReadingValue={waterMeter.lastReadingNormalizedValue}
          lastReadingDate={waterMeter.lastReadingDate}
          onClose={() => setShowAddReadingModal(false)}
        />
      )}
    </>
  )
}
