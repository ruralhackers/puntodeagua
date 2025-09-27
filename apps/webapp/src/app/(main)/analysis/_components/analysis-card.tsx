'use client'

import type { AnalysisDto } from '@pda/registers/domain'
import { TestTube } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AnalysisCardProps {
  analysis: AnalysisDto
  onViewDetails: (analysis: AnalysisDto) => void
}

const analysisTypeLabels = {
  chlorine_ph: 'Cloro + pH',
  turbidity: 'Turbidez',
  hardness: 'Dureza',
  complete: 'Análisis Completo'
}

export default function AnalysisCard({ analysis, onViewDetails }: AnalysisCardProps) {
  const formatMeasurement = (value: number | undefined, unit: string) => {
    return value !== undefined ? `${value} ${unit}` : 'N/A'
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold">
                {analysisTypeLabels[analysis.analysisType as keyof typeof analysisTypeLabels]}
              </h4>
              <Badge variant="outline" className="text-xs">
                {analysis.analyst}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Fecha</p>
                <p>{new Date(analysis.analyzedAt).toLocaleDateString('es-ES')}</p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">Mediciones</p>
                <div className="space-y-1">
                  {analysis.ph !== undefined && (
                    <p className="text-xs">pH: {formatMeasurement(analysis.ph, '')}</p>
                  )}
                  {analysis.chlorine !== undefined && (
                    <p className="text-xs">Cloro: {formatMeasurement(analysis.chlorine, 'mg/L')}</p>
                  )}
                  {analysis.turbidity !== undefined && (
                    <p className="text-xs">
                      Turbidez: {formatMeasurement(analysis.turbidity, 'NTU')}
                    </p>
                  )}
                  {analysis.ph === undefined &&
                    analysis.chlorine === undefined &&
                    analysis.turbidity === undefined && (
                      <p className="text-xs text-muted-foreground">Sin mediciones</p>
                    )}
                </div>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">Ubicación</p>
                <p className="text-xs">
                  {analysis.waterZoneId || analysis.waterDepositId
                    ? 'Zona/Depósito específico'
                    : 'Comunidad general'}
                </p>
              </div>
            </div>

            {analysis.description && (
              <div className="text-sm">
                <p className="font-medium text-muted-foreground">Descripción</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{analysis.description}</p>
              </div>
            )}
          </div>

          <Button
            onClick={() => onViewDetails(analysis)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
