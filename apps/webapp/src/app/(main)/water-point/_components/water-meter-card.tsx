'use client'

import type { WaterMeterDto } from '@pda/water-account/domain'
import { Gauge } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface WaterMeterCardProps {
  meter: WaterMeterDto
  onAddReading: (meter: WaterMeterDto) => void
}

export default function WaterMeterCard({ meter, onAddReading }: WaterMeterCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold">{meter.name}</h4>
              <Badge variant="outline" className="text-xs">
                {meter.measurementUnit}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Última Lectura</p>
                <p className="font-mono">
                  {meter.lastReadingNormalizedValue !== null
                    ? `${meter.lastReadingNormalizedValue} ${meter.measurementUnit}`
                    : 'Sin lecturas'}
                </p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">Fecha</p>
                <p>
                  {meter.lastReadingDate
                    ? new Date(meter.lastReadingDate).toLocaleDateString('es-ES')
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">Estado</p>
                <div className="flex items-center gap-1">
                  {meter.lastReadingExcessConsumption === true && (
                    <Badge variant="destructive" className="text-xs">
                      Consumo Excesivo
                    </Badge>
                  )}
                  {meter.lastReadingExcessConsumption === false && (
                    <Badge variant="secondary" className="text-xs">
                      Normal
                    </Badge>
                  )}
                  {meter.lastReadingExcessConsumption === null && (
                    <Badge variant="outline" className="text-xs">
                      Sin datos
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => onAddReading(meter)}>
            Nueva Lectura
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
