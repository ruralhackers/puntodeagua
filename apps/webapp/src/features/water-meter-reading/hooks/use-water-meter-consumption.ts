import type { WaterMeterDto, WaterPointDto } from 'features'
import { useMemo } from 'react'

export interface ConsumptionData {
  difference: number
  differenceInLiters: number
  daysBetween: number
  consumptionPerDayPerPerson: number
  consumptionPerDayTotal: number
  isHighConsumption: boolean
  isNegativeConsumption: boolean
  hasPreviousReading: boolean
  peopleInWaterPoint: number
  currentReading?: number
}

export interface ReadingData {
  reading: string
  readingDate: Date | string
}

interface UseWaterMeterConsumptionParams {
  currentReading: string
  readingDate: Date
  waterMeter: WaterMeterDto
  waterPoint: WaterPointDto
}

/**
 * Hook para calcular el consumo de agua basado en lecturas del contador
 *
 * @param currentReading - Lectura actual del contador
 * @param readingDate - Fecha de la lectura actual
 * @param waterMeter - Información del contador de agua
 * @param waterPoint - Información del punto de agua
 * @returns Datos calculados del consumo o null si no hay datos válidos
 */
export const useWaterMeterConsumption = ({
  currentReading,
  readingDate,
  waterMeter,
  waterPoint
}: UseWaterMeterConsumptionParams): ConsumptionData | null => {
  return useMemo(() => {
    if (!currentReading) {
      return null
    }

    const current = parseFloat(currentReading)

    if (Number.isNaN(current)) {
      return null
    }

    // Obtener la última lectura
    const getLastReading = () => {
      if (!waterMeter.readings || waterMeter.readings.length === 0) {
        return null
      }
      // Ordenar por fecha descendente y tomar la primera
      return waterMeter.readings.sort(
        (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
      )[0]
    }

    const lastReading = getLastReading()

    // Si tenemos una lectura anterior, calcular la diferencia
    if (lastReading) {
      return calculateConsumptionBetweenReadings(
        currentReading,
        readingDate,
        lastReading,
        waterMeter.measurementUnit,
        waterPoint
      )
    }

    // Si no hay lectura anterior, solo mostrar la lectura actual
    return {
      difference: 0,
      differenceInLiters: 0,
      daysBetween: 0,
      consumptionPerDayPerPerson: 0,
      consumptionPerDayTotal: 0,
      isHighConsumption: false,
      isNegativeConsumption: false,
      hasPreviousReading: false,
      peopleInWaterPoint: waterPoint.fixedPopulation + waterPoint.floatingPopulation,
      currentReading: current
    }
  }, [currentReading, readingDate, waterMeter.readings, waterMeter.measurementUnit, waterPoint])
}

/**
 * Constantes para configuración de consumo
 */
export const CONSUMPTION_THRESHOLDS = {
  HIGH_CONSUMPTION_PER_PERSON_PER_DAY: 180, // litros por persona por día
  NORMAL_CONSUMPTION_PER_PERSON_PER_DAY: 150, // litros por persona por día
  LOW_CONSUMPTION_PER_PERSON_PER_DAY: 50 // litros por persona por día
} as const

/**
 * Utilidad para obtener el mensaje de estado del consumo
 */
export const getConsumptionStatusMessage = (consumptionData: ConsumptionData): string => {
  if (consumptionData.isNegativeConsumption) {
    return '⚠ La ultima lectura es menor que su anterior.'
  }

  if (consumptionData.isHighConsumption) {
    return '⚠ Consumo elevado'
  }

  if (!consumptionData.hasPreviousReading) {
    return 'ℹ Lectura inicial'
  }

  return '✓ Consumo normal'
}

/**
 * Utilidad para obtener las clases CSS según el estado del consumo
 */
export const getConsumptionStatusClasses = (consumptionData: ConsumptionData): string => {
  if (!consumptionData.hasPreviousReading) {
    return 'bg-blue-50 border-blue-200'
  }

  if (consumptionData.isNegativeConsumption || consumptionData.isHighConsumption) {
    return 'bg-red-50 border-red-200'
  }

  return 'bg-green-50 border-green-200'
}

/**
 * Utilidad para obtener las clases CSS del texto según el estado del consumo
 */
export const getConsumptionTextClasses = (consumptionData: ConsumptionData): string => {
  if (consumptionData.isNegativeConsumption || consumptionData.isHighConsumption) {
    return 'text-red-700'
  }

  if (!consumptionData.hasPreviousReading) {
    return 'text-blue-700'
  }

  return 'text-green-700'
}

/**
 * Calcula el consumo entre dos lecturas específicas
 */
export const calculateConsumptionBetweenReadings = (
  currentReading: string,
  currentReadingDate: Date | string,
  previousReading: ReadingData,
  measurementUnit: string,
  waterPoint: WaterPointDto
): ConsumptionData => {
  const current = parseFloat(currentReading)
  const previous = parseFloat(previousReading.reading)

  if (Number.isNaN(current) || Number.isNaN(previous)) {
    return {
      difference: 0,
      differenceInLiters: 0,
      daysBetween: 0,
      consumptionPerDayPerPerson: 0,
      consumptionPerDayTotal: 0,
      isHighConsumption: false,
      isNegativeConsumption: false,
      hasPreviousReading: false,
      peopleInWaterPoint: 0
    }
  }

  const difference = current - previous

  // Convertir a litros solo si la unidad de medida es M3 (metros cúbicos)
  const differenceInLiters = measurementUnit === 'M3' ? difference * 1000 : difference

  // Verificar si el consumo es negativo
  const isNegativeConsumption = difference < 0

  // Calcular días entre lecturas
  const lastReadingDate = new Date(previousReading.readingDate)
  const currentReadingDateObj = new Date(currentReadingDate)

  const daysBetween = Math.ceil(
    (currentReadingDateObj.getTime() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const consumptionPerDayTotal = daysBetween > 0 ? differenceInLiters / daysBetween : 0
  const peopleInWaterPoint = waterPoint.fixedPopulation + waterPoint.floatingPopulation
  const consumptionPerDayPerPerson = consumptionPerDayTotal / peopleInWaterPoint

  // Validación simple: considerar consumo elevado si > 180L por día por persona
  const isHighConsumption = consumptionPerDayPerPerson > 180

  return {
    difference,
    differenceInLiters,
    daysBetween,
    consumptionPerDayPerPerson,
    consumptionPerDayTotal,
    isHighConsumption,
    isNegativeConsumption,
    hasPreviousReading: true,
    peopleInWaterPoint
  }
}

/**
 * Calcula el consumo entre las dos últimas lecturas existentes
 */
export const calculateExistingReadingsConsumption = (
  readings: Array<{ reading: string; readingDate: Date | string }>,
  waterMeter: WaterMeterDto,
  waterPoint: WaterPointDto
): ConsumptionData | null => {
  if (!readings || readings.length < 2) {
    return null
  }

  // Ordenar por fecha descendente
  const sortedReadings = readings.sort(
    (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
  )

  const lastReading = sortedReadings[0]
  const secondLastReading = sortedReadings[1]

  return calculateConsumptionBetweenReadings(
    lastReading.reading,
    lastReading.readingDate,
    secondLastReading,
    waterMeter.measurementUnit,
    waterPoint
  )
}
