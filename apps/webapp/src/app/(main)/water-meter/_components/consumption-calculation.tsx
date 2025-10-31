import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConsumptionCalculationProps {
  waterLimitRule: { type: string; value: number }
  pax?: number // Optional - only required for PERSON_BASED rules
  lastReading: { normalizedReading: number; readingDate: Date | string }
  previousReading: { normalizedReading: number; readingDate: Date | string }
}

export function ConsumptionCalculation({
  waterLimitRule,
  pax,
  lastReading,
  previousReading
}: ConsumptionCalculationProps) {
  // Calcular días transcurridos
  const daysBetween = Math.floor(
    (new Date(lastReading.readingDate).getTime() -
      new Date(previousReading.readingDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  // Calcular consumo máximo permitido según el tipo de regla
  let maxAllowedConsumption = 0
  let calculationExplanation = ''

  if (waterLimitRule.type === 'PERSON_BASED') {
    if (!pax || pax === 0) {
      // No podemos calcular sin pax para PERSON_BASED
      return null
    }
    maxAllowedConsumption = daysBetween * pax * waterLimitRule.value
    calculationExplanation = `${daysBetween} días × ${pax} personas × ${waterLimitRule.value} L/día`
  } else if (waterLimitRule.type === 'HOUSEHOLD_BASED') {
    maxAllowedConsumption = daysBetween * waterLimitRule.value
    calculationExplanation = `${daysBetween} días × ${waterLimitRule.value} L/día`
  } else {
    // Tipo de regla no soportado
    return null
  }

  // Consumo real
  const actualConsumption = lastReading.normalizedReading - previousReading.normalizedReading

  const isExcess = actualConsumption > maxAllowedConsumption

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Cálculo de Consumo (Entre Últimas Lecturas)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Período */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Período Analizado</div>
            <div className="text-lg font-semibold">
              {format(new Date(previousReading.readingDate), 'dd/MM/yyyy', { locale: es })}
              {' → '}
              {format(new Date(lastReading.readingDate), 'dd/MM/yyyy', { locale: es })}
            </div>
            <div className="text-sm text-gray-500 mt-1">{daysBetween} días transcurridos</div>
          </div>

          {/* Cálculos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consumo Máximo Permitido */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 font-medium mb-2">Consumo Máximo Permitido</div>
              <div className="text-xs text-gray-600 mb-2 space-y-1">
                <div>{calculationExplanation}</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {maxAllowedConsumption.toLocaleString('es-ES')} L
              </div>
            </div>

            {/* Consumo Real */}
            <div
              className={`p-4 rounded-lg border ${
                isExcess ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}
            >
              <div
                className={`text-sm font-medium mb-2 ${
                  isExcess ? 'text-red-700' : 'text-green-700'
                }`}
              >
                Consumo Real
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {lastReading.normalizedReading.toLocaleString('es-ES')} L -{' '}
                {previousReading.normalizedReading.toLocaleString('es-ES')} L
              </div>
              <div className={`text-2xl font-bold ${isExcess ? 'text-red-600' : 'text-green-600'}`}>
                {actualConsumption.toLocaleString('es-ES')} L
              </div>
              {isExcess && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-700">
                  <AlertTriangle className="h-3 w-3" />
                  Exceso: {(actualConsumption - maxAllowedConsumption).toLocaleString('es-ES')} L
                </div>
              )}
            </div>
          </div>

          {/* Datos Base */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2 border-t">
            {waterLimitRule.type === 'PERSON_BASED' && pax && (
              <>
                <div>
                  <span className="font-medium">Personas:</span> {pax}
                </div>
                <div>
                  <span className="font-medium">Límite diario:</span> {waterLimitRule.value}{' '}
                  L/persona/día
                </div>
                <div>
                  <span className="font-medium">Total diario permitido:</span>{' '}
                  {(pax * waterLimitRule.value).toLocaleString('es-ES')} L/día
                </div>
              </>
            )}
            {waterLimitRule.type === 'HOUSEHOLD_BASED' && (
              <>
                <div>
                  <span className="font-medium">Límite diario por vivienda:</span>{' '}
                  {waterLimitRule.value} L/día
                </div>
                <div>
                  <span className="font-medium">Total diario permitido:</span>{' '}
                  {waterLimitRule.value.toLocaleString('es-ES')} L/día
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
