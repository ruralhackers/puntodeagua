export interface ReadingForPeriodStats {
  normalizedReading: number
  readingDate: Date
}

export interface PeriodConsumptionStats {
  totalConsumption: number | null
  days: number | null
  averageConsumptionPerDay: number | null
}

/**
 * Total and average daily consumption between first and last reading in a period.
 * Days use whole calendar days (same basis as the community readings PDF).
 */
export function periodConsumptionStats(
  readings: ReadingForPeriodStats[]
): PeriodConsumptionStats {
  if (readings.length < 2) {
    return {
      totalConsumption: null,
      days: null,
      averageConsumptionPerDay: null
    }
  }

  const first = readings[0]
  const last = readings[readings.length - 1]
  if (!first || !last) {
    return {
      totalConsumption: null,
      days: null,
      averageConsumptionPerDay: null
    }
  }

  const totalConsumption = last.normalizedReading - first.normalizedReading
  const days = Math.floor(
    (new Date(last.readingDate).getTime() - new Date(first.readingDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  if (days <= 0) {
    return {
      totalConsumption,
      days: 0,
      averageConsumptionPerDay: null
    }
  }

  return {
    totalConsumption,
    days,
    averageConsumptionPerDay: totalConsumption / days
  }
}
